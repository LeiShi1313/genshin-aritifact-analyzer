import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { listScriptFiles } from "../../scripts/gcsim";

test("script discovery returns a stable canonical file order", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "gcsim-files-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(path.join(directory, "b"), "config b");
  await writeFile(path.join(directory, "a"), "config a");

  assert.deepEqual(await listScriptFiles(directory), ["a", "b"]);
});

test("script discovery rejects legacy duplicate file formats", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "gcsim-files-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(path.join(directory, "canonical"), "config");
  await writeFile(path.join(directory, "canonical.txt"), "legacy config");

  await assert.rejects(
    () => listScriptFiles(directory),
    /legacy GCSIM script file "canonical\.txt"/
  );
});
