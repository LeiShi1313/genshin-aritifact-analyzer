import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { syncGCSimScripts } from "../../scripts/gcsim-snapshot.mjs";

test("syncGCSimScripts atomically replaces stale and duplicate files", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "gcsim-snapshot-"));
  const outputDir = path.join(root, "scripts");
  t.after(() => rm(root, { recursive: true, force: true }));

  await mkdir(outputDir);
  await writeFile(path.join(outputDir, "keep"), "old keep");
  await writeFile(path.join(outputDir, "keep.txt"), "duplicate keep");
  await writeFile(path.join(outputDir, "stale"), "stale config");

  const result = await syncGCSimScripts({
    outputDir,
    pageSize: 2,
    fetchPage: async (skip: number) => {
      if (skip === 0) {
        return [
          { _id: "keep", config: "new keep" },
          { _id: "new-id", config: "new config" },
        ];
      }
      return [];
    },
  });

  assert.deepEqual(result, { fetched: 2, unique: 2 });
  assert.deepEqual((await readdir(outputDir)).sort(), ["keep", "new-id"]);
  assert.deepEqual(await readdir(root), ["scripts"]);
  assert.equal(
    await readFile(path.join(outputDir, "keep"), "utf8"),
    "new keep"
  );
  assert.equal(
    await readFile(path.join(outputDir, "new-id"), "utf8"),
    "new config"
  );
});

test("syncGCSimScripts preserves the old snapshot when a later page fails", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "gcsim-snapshot-"));
  const outputDir = path.join(root, "scripts");
  t.after(() => rm(root, { recursive: true, force: true }));

  await mkdir(outputDir);
  await writeFile(path.join(outputDir, "existing"), "existing config");

  await assert.rejects(
    () =>
      syncGCSimScripts({
        outputDir,
        pageSize: 1,
        fetchPage: async (skip: number) => {
          if (skip === 0) {
            return [{ _id: "new-id", config: "new config" }];
          }
          throw new Error("page failed");
        },
      }),
    /page failed/
  );

  assert.deepEqual(await readdir(root), ["scripts"]);
  assert.deepEqual(await readdir(outputDir), ["existing"]);
  assert.equal(
    await readFile(path.join(outputDir, "existing"), "utf8"),
    "existing config"
  );
});

test("syncGCSimScripts rejects duplicate remote ids without replacing the snapshot", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "gcsim-snapshot-"));
  const outputDir = path.join(root, "scripts");
  t.after(() => rm(root, { recursive: true, force: true }));

  await mkdir(outputDir);
  await writeFile(path.join(outputDir, "existing"), "existing config");

  await assert.rejects(
    () =>
      syncGCSimScripts({
        outputDir,
        pageSize: 2,
        fetchPage: async () => [
          { _id: "duplicate", config: "first config" },
          { _id: "duplicate", config: "second config" },
        ],
      }),
    /duplicate script id "duplicate"/i
  );

  assert.deepEqual(await readdir(root), ["scripts"]);
  assert.deepEqual(await readdir(outputDir), ["existing"]);
  assert.equal(
    await readFile(path.join(outputDir, "existing"), "utf8"),
    "existing config"
  );
});

test("syncGCSimScripts rejects empty configs without replacing the snapshot", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "gcsim-snapshot-"));
  const outputDir = path.join(root, "scripts");
  t.after(() => rm(root, { recursive: true, force: true }));

  await mkdir(outputDir);
  await writeFile(path.join(outputDir, "existing"), "existing config");

  await assert.rejects(
    () =>
      syncGCSimScripts({
        outputDir,
        fetchPage: async () => [{ _id: "empty", config: "" }],
      }),
    /script "empty" must have a non-empty config/
  );

  assert.deepEqual(await readdir(outputDir), ["existing"]);
});

test("syncGCSimScripts rejects an implausibly small snapshot", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "gcsim-snapshot-"));
  const outputDir = path.join(root, "scripts");
  t.after(() => rm(root, { recursive: true, force: true }));

  await mkdir(outputDir);
  await writeFile(path.join(outputDir, "existing"), "existing config");

  await assert.rejects(
    () =>
      syncGCSimScripts({
        outputDir,
        minimumCount: 2,
        fetchPage: async () => [{ _id: "only-one", config: "config" }],
      }),
    /snapshot has 1 scripts; expected at least 2/
  );

  assert.deepEqual(await readdir(outputDir), ["existing"]);
});
