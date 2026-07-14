import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { migrateArtifactScoringState } from "../../src/store/migrations/artifactScoring";

test("preserves user data and removes obsolete scoring caches and weights", () => {
  const subAttributes = [{ type: 9, value: 0.7 }];
  const input = {
    uploads: { artifacts: { upload: { items: ["artifact"] } } },
    build: {
      builds: { abc: { name: "build", subAttributes } },
      config: { abc: { enabled: false } },
      weights: { abc: [1, 2, 3] },
    },
    presets: { builds: { preset: { name: "preset" } } },
    artifacts: { fitsAndRarity: { upload: { old: "derived" } } },
    configs: {
      attributeWeights: [[1]],
      rarityWeights: [[2]],
      standardRarity: 3,
      scoreOverhead: 4,
      nonFiveStarSubstractor: 5,
      nonSuitSubstractors: { 1: 6 },
    },
  };

  const output = migrateArtifactScoringState(input);

  assert.strictEqual(output.uploads, input.uploads);
  assert.strictEqual(output.presets, input.presets);
  assert.strictEqual(output.build.builds.abc.subAttributes, subAttributes);
  assert.deepEqual(output.build.config, { abc: { enabled: false } });
  assert.equal("weights" in output.build, false);
  assert.deepEqual(output.artifacts, {});
  assert.deepEqual(output.configs, { fourLineStartProbability: 0.2 });
});

test("preserves a valid mechanics assumption and repairs an invalid one", () => {
  assert.equal(
    migrateArtifactScoringState({
      configs: { fourLineStartProbability: 0.35 },
    }).configs.fourLineStartProbability,
    0.35
  );
  assert.equal(
    migrateArtifactScoringState({
      configs: { fourLineStartProbability: Number.NaN },
    }).configs.fourLineStartProbability,
    0.2
  );
  assert.equal(
    migrateArtifactScoringState({
      configs: { fourLineStartProbability: "0.35" },
    }).configs.fourLineStartProbability,
    0.2
  );
});

test("derived artifact scoring state is structurally excluded from persistence", () => {
  const storeSource = readFileSync(
    new URL("../../src/store/index.js", import.meta.url),
    "utf8"
  );
  const artifactReducerSource = readFileSync(
    new URL("../../src/store/reducers/artifacts.js", import.meta.url),
    "utf8"
  );

  const blacklist = storeSource.match(/blacklist:\s*\[([^\]]*)\]/)?.[1] ?? "";
  assert.match(blacklist, /"artifacts"/);
  assert.match(blacklist, /"gcsim"/);
  assert.match(artifactReducerSource, /initialState:\s*\{\}/);
  assert.doesNotMatch(
    artifactReducerSource,
    /fitsAndRarity|match|potential|prospect/i
  );
});
