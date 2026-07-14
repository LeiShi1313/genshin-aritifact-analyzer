import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  hashGCSimCatalogSnapshot,
  hashScriptSnapshot,
  readCleanGitHead,
  sha256File,
} from "../../scripts/generate-gcsim-manifest.mjs";

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

test("manifest provenance rejects a dirty GCSIM checkout", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "gcsim-source-"));
  t.after(() => rm(directory, { recursive: true, force: true }));

  execFileSync("git", ["init", "--quiet", directory]);
  execFileSync("git", ["-C", directory, "config", "user.name", "Test"]);
  execFileSync("git", ["-C", directory, "config", "user.email", "test@example.com"]);
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
  const manifest = JSON.parse(
    await readFile(path.join(publicDirectory, "manifest.json"), "utf8")
  );
  const goMod = await readFile(path.join(root, "gcsim/go.mod"), "utf8");
  const goVersion = goMod.match(/^go\s+(\S+)/m)?.[1];

  assert.equal(manifest.gcsimCommit, readCleanGitHead(path.join(root, "gcsim")));
  assert.equal(manifest.goToolchain, `go${goVersion}`);
  assert.equal(manifest.scriptCount, scripts.count);
  assert.equal(manifest.scriptSnapshotSha256, scripts.sha256);
  assert.equal(manifest.catalogFileCount, catalogs.count);
  assert.equal(manifest.catalogSnapshotSha256, catalogs.sha256);
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
