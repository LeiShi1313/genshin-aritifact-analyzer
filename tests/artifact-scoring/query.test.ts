import assert from "node:assert/strict";
import test from "node:test";

import {
  ARTIFACT_SCORING_QUERY_DEFAULTS,
  parseArtifactScoringQuery,
  serializeArtifactScoringQuery,
} from "../../src/features/artifacts/scoringQuery";

test("uses the mechanics-calibrated scoring defaults", () => {
  assert.deepEqual(
    parseArtifactScoringQuery(""),
    ARTIFACT_SCORING_QUERY_DEFAULTS
  );
});

test("parses only integer public-score thresholds", () => {
  assert.equal(parseArtifactScoringQuery("minPotential=70").minPotential, 70);
  assert.equal(parseArtifactScoringQuery("minScore=85").minScore, 85);
  assert.equal(parseArtifactScoringQuery("minPotential=74.5").minPotential, 75);
  assert.equal(parseArtifactScoringQuery("minScore=101").minScore, 80);
  assert.equal(parseArtifactScoringQuery("minScore=NaN").minScore, 80);
});

test("does not reinterpret removed fitness, rarity, or sort parameters", () => {
  assert.deepEqual(
    parseArtifactScoringQuery(
      "fitness=.65&match=.65&rarity=8.5&prospect=.9&prospectEnabled=true&sort=rarity-desc&potential-desc=true"
    ),
    ARTIFACT_SCORING_QUERY_DEFAULTS
  );
});

test("rejects artifact set ids that are not in the generated enum", () => {
  assert.equal(parseArtifactScoringQuery("set=1").set, 1);
  assert.equal(parseArtifactScoringQuery("set=999").set, 0);
  assert.equal(parseArtifactScoringQuery("set=-1").set, 0);
});

test("normalizes a reversed level range", () => {
  const query = parseArtifactScoringQuery("minLevel=16&maxLevel=4");
  assert.equal(query.minLevel, 4);
  assert.equal(query.maxLevel, 16);
});

test("serializes non-default values and round-trips explicit false", () => {
  const query = {
    ...ARTIFACT_SCORING_QUERY_DEFAULTS,
    minPotential: 70,
    minScore: 85,
    sort: "score-asc" as const,
    showSelected: false,
  };
  const params = serializeArtifactScoringQuery(query);

  assert.equal(params.has("minLevel"), false);
  assert.equal(params.get("showSelected"), "false");
  assert.deepEqual(parseArtifactScoringQuery(params), query);
});
