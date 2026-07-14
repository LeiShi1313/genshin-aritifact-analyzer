import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  GCSIM_CATALOG_FILES,
  GCSIM_DERIVED_FILES,
  hashGCSimCatalogSnapshot,
  hashGCSimDerivedSnapshot,
  hashScriptSnapshot,
  readCleanGitHead,
  sha256File,
} from "../../scripts/generate-gcsim-manifest.mjs";

const EXPECTED_DERIVED_FILES = [
  "genshin/enemy.ts",
  "proto/enemy.proto",
  "public/locales/de/enemy.json",
  "public/locales/en/enemy.json",
  "public/locales/es/enemy.json",
  "public/locales/fr/enemy.json",
  "public/locales/ja/enemy.json",
  "public/locales/ko/enemy.json",
  "public/locales/zh-Hant/enemy.json",
  "public/locales/zh/enemy.json",
  "src/genshin/enemy.ts",
];

test("script snapshot hashes are deterministic and content-sensitive", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "gcsim-manifest-"));
  t.after(() => rm(directory, { recursive: true, force: true }));

  await writeFile(path.join(directory, "b"), "second");
  await writeFile(path.join(directory, "a"), "first");
  const initial = await hashScriptSnapshot(directory);

  assert.equal(initial.count, 2);
  assert.match(initial.sha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(initial.files, ["a", "b"]);

  await writeFile(path.join(directory, "a"), "changed");
  const changed = await hashScriptSnapshot(directory);
  assert.notEqual(changed.sha256, initial.sha256);
});

test("GCSIM derived snapshot covers every enemy locale, proto, and generated type", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "gcsim-derived-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  assert.deepEqual(GCSIM_DERIVED_FILES, EXPECTED_DERIVED_FILES);
  assert.ok(GCSIM_CATALOG_FILES.includes("enemies.json"));

  for (const [index, file] of EXPECTED_DERIVED_FILES.entries()) {
    const target = path.join(root, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, `file-${index}`);
  }

  const initial = await hashGCSimDerivedSnapshot(root);
  assert.equal(initial.count, 11);
  assert.deepEqual(initial.files, [...EXPECTED_DERIVED_FILES].sort());

  await writeFile(path.join(root, "proto/enemy.proto"), "changed");
  const changed = await hashGCSimDerivedSnapshot(root);
  assert.notEqual(changed.sha256, initial.sha256);
});

test("manifest provenance rejects a dirty GCSIM checkout", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "gcsim-source-"));
  t.after(() => rm(directory, { recursive: true, force: true }));

  execFileSync("git", ["init", "--quiet", directory]);
  execFileSync("git", ["-C", directory, "config", "user.name", "Test"]);
  execFileSync("git", [
    "-C",
    directory,
    "config",
    "user.email",
    "test@example.com",
  ]);
  await writeFile(path.join(directory, "source.go"), "package main\n");
  execFileSync("git", ["-C", directory, "add", "source.go"]);
  execFileSync("git", ["-C", directory, "commit", "--quiet", "-m", "fixture"]);

  const head = readCleanGitHead(directory);
  assert.match(head, /^[a-f0-9]{40}$/);

  await writeFile(path.join(directory, "source.go"), "package changed\n");
  assert.throws(
    () => readCleanGitHead(directory),
    /GCSIM source checkout is not clean/
  );
});

test("checked-in manifest matches every pinned GCSIM artifact", async () => {
  const root = process.cwd();
  const publicDirectory = path.join(root, "public/gcsim");
  const scripts = await hashScriptSnapshot(
    path.join(publicDirectory, "scripts")
  );
  const catalogs = await hashGCSimCatalogSnapshot(
    path.join(root, "src/data/gcsim")
  );
  const derived = await hashGCSimDerivedSnapshot(root);
  const manifest = JSON.parse(
    await readFile(path.join(publicDirectory, "manifest.json"), "utf8")
  );
  const goMod = await readFile(path.join(root, "gcsim/go.mod"), "utf8");
  const goVersion = goMod.match(/^go\s+(\S+)/m)?.[1];

  assert.equal(
    manifest.gcsimCommit,
    readCleanGitHead(path.join(root, "gcsim"))
  );
  assert.equal(manifest.goToolchain, `go${goVersion}`);
  assert.equal(manifest.scriptCount, scripts.count);
  assert.equal(manifest.scriptSnapshotSha256, scripts.sha256);
  assert.equal(manifest.catalogFileCount, catalogs.count);
  assert.equal(manifest.catalogSnapshotSha256, catalogs.sha256);
  assert.equal(manifest.derivedFileCount, derived.count);
  assert.equal(manifest.derivedSnapshotSha256, derived.sha256);
  assert.equal(
    manifest.binarySha256,
    await sha256File(path.join(publicDirectory, "gcsim.bin"))
  );
  assert.equal(
    manifest.wasmSha256,
    await sha256File(path.join(publicDirectory, "main.wasm"))
  );
  assert.equal(
    manifest.wasmExecSha256,
    await sha256File(path.join(publicDirectory, "wasm_exec.js"))
  );
});
