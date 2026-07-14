import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const gameWorkflow = readFileSync(
  ".github/workflows/update-genshin-data.yml",
  "utf8"
);
const gcsimWorkflow = readFileSync(
  ".github/workflows/update-gcsim.yml",
  "utf8"
);

test("game-data generation has no optional GCSIM side effects", () => {
  const source = readFileSync("scripts/index.mjs", "utf8");

  assert.doesNotMatch(source, /generate[_-]gcsim/i);
  assert.doesNotMatch(source, /generate[_-]enemy/i);
  assert.doesNotMatch(source, /Skipping gcsim generation/i);
  assert.doesNotMatch(gameWorkflow, /test-roundtrip/);
  assert.match(gameWorkflow, /npm run test:artifact-scoring/);
});

test("the GCSIM update command regenerates every derived layer in order", () => {
  const command = packageJson.scripts["update:gcsim"] as string;
  const expectedSteps = [
    "generate:gcsim",
    "generate:gcsim-enemies",
    "proto",
    "proto-esm",
    "scrape-gcsim",
    "gcsim",
    "build:wasm",
    "gcsim:manifest",
    "test:gcsim",
    "test-roundtrip",
    "build",
  ];
  const actualSteps = command
    .split("&&")
    .map((step) => step.trim().replace(/^npm run /, ""));

  assert.deepEqual(actualSteps, expectedSteps);
});

test("GCSIM automation checks out the submodule and publishes with gh", () => {
  assert.match(gcsimWorkflow, /submodules: recursive/);
  assert.match(gcsimWorkflow, /npm run update:gcsim/);
  assert.match(gcsimWorkflow, /gh pr (?:edit|create)/);
  assert.match(gcsimWorkflow, /Enforce GCSIM ownership boundary/);
  assert.match(gameWorkflow, /group: generated-data-updates/);
  assert.match(gcsimWorkflow, /group: generated-data-updates/);
});
