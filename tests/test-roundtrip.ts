import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { GCSim, GCSimScript } from "../genshin/gcsim.js";
import {
  hashGCSimCatalogSnapshot,
  hashScriptSnapshot,
  sha256File,
} from "../scripts/generate-gcsim-manifest.mjs";
import { listScriptFiles, parseScript } from "../scripts/gcsim";
import { gcsimScriptToScript } from "../src/utils/gcsim";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.join(__dirname, "..");
const scriptsDirectory = path.join(__dirname, "../public/gcsim/scripts");
const catalogsDirectory = path.join(__dirname, "../src/data/gcsim");
const binaryPath = path.join(__dirname, "../public/gcsim/gcsim.bin");
const wasmPath = path.join(__dirname, "../public/gcsim/main.wasm");
const wasmExecPath = path.join(__dirname, "../public/gcsim/wasm_exec.js");
const manifestPath = path.join(__dirname, "../public/gcsim/manifest.json");

const canonicalizeAggregatedStats = (script: GCSimScript): GCSimScript => ({
  ...script,
  characterInfos: script.characterInfos.map((character) => {
    const stats: typeof character.stats = [];
    const indexes = new Map<string, number>();

    for (const stat of character.stats) {
      const key = `${stat.label}\0${stat.type}`;
      const existing = indexes.get(key);
      if (existing === undefined) {
        indexes.set(key, stats.length);
        stats.push({ ...stat });
      } else {
        stats[existing] = {
          ...stats[existing],
          value: stats[existing].value + stat.value,
        };
      }
    }

    return { ...character, stats };
  }),
});

const protobufCanonicalJSON = (script: GCSimScript) =>
  GCSimScript.toJSON(
    GCSimScript.decode(GCSimScript.encode(script).finish())
  );

console.log("Checking the complete GCSIM script snapshot...");

const files = await listScriptFiles(scriptsDirectory);
const binary = GCSim.decode(await fs.promises.readFile(binaryPath));
const manifest = JSON.parse(await fs.promises.readFile(manifestPath, "utf8"));
const snapshot = await hashScriptSnapshot(scriptsDirectory);
const catalogs = await hashGCSimCatalogSnapshot(catalogsDirectory);
const goMod = await fs.promises.readFile(
  path.join(projectDirectory, "gcsim/go.mod"),
  "utf8"
);
const goVersion = goMod.match(/^go\s+(\S+)/m)?.[1];
const gcsimCommit = execFileSync(
  "git",
  ["-C", path.join(projectDirectory, "gcsim"), "rev-parse", "HEAD"],
  { encoding: "utf8" }
).trim();

assert.equal(manifest.gcsimCommit, gcsimCommit);
assert.equal(manifest.goToolchain, `go${goVersion}`);
assert.equal(manifest.scriptCount, files.length);
assert.equal(manifest.scriptSnapshotSha256, snapshot.sha256);
assert.equal(manifest.catalogFileCount, catalogs.count);
assert.equal(manifest.catalogSnapshotSha256, catalogs.sha256);
assert.equal(manifest.binarySha256, await sha256File(binaryPath));
assert.equal(manifest.wasmSha256, await sha256File(wasmPath));
assert.equal(manifest.wasmExecSha256, await sha256File(wasmExecPath));
assert.equal(
  binary.scripts.length,
  files.length,
  `gcsim.bin has ${binary.scripts.length} scripts, snapshot has ${files.length}`
);

const failures: Array<{ file: string; error: string }> = [];

for (const [index, file] of files.entries()) {
  try {
    const source = await fs.promises.readFile(
      path.join(scriptsDirectory, file),
      "utf8"
    );
    const parsed = parseScript(source, file);
    assert.deepEqual(
      GCSimScript.toJSON(binary.scripts[index]),
      protobufCanonicalJSON(parsed),
      "gcsim.bin does not match the parsed source script"
    );
    const normalized = parseScript(
      gcsimScriptToScript(parsed),
      `${file}:round-trip`
    );
    const normalizedAgain = parseScript(
      gcsimScriptToScript(normalized),
      `${file}:round-trip-twice`
    );

    assert.deepEqual(
      protobufCanonicalJSON(normalized),
      protobufCanonicalJSON(canonicalizeAggregatedStats(parsed)),
      "serialization changed data beyond stat aggregation"
    );
    assert.deepEqual(
      GCSimScript.toJSON(normalizedAgain),
      GCSimScript.toJSON(normalized),
      "serialized script did not reach a stable normalized form"
    );
  } catch (error) {
    failures.push({
      file,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  if ((index + 1) % 1_000 === 0) {
    console.log(`Checked ${index + 1}/${files.length} scripts...`);
  }
}

if (failures.length > 0) {
  for (const { file, error } of failures.slice(0, 20)) {
    console.error(`${file}: ${error}`);
  }
  if (failures.length > 20) {
    console.error(`...and ${failures.length - 20} more failures`);
  }
  throw new Error(`${failures.length} GCSIM scripts failed round-trip checks`);
}

console.log(
  `GCSIM snapshot is consistent: ${files.length} scripts parsed and round-tripped.`
);
