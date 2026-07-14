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

test("parses only explicit booleans and finite unit-interval thresholds", () => {
  assert.equal(
    parseArtifactScoringQuery("prospectEnabled=false").prospectEnabled,
    false
  );
  assert.equal(
    parseArtifactScoringQuery("prospectEnabled=true").prospectEnabled,
    true
  );
  assert.equal(
    parseArtifactScoringQuery("prospectEnabled=1").prospectEnabled,
    false
  );
  assert.equal(parseArtifactScoringQuery("match=NaN").match, 0.55);
  assert.equal(parseArtifactScoringQuery("match=1.01").match, 0.55);
  assert.equal(parseArtifactScoringQuery("prospect=-0.1").prospect, 0.9);
});

test("does not reinterpret removed fitness, rarity, or sort parameters", () => {
  assert.deepEqual(
    parseArtifactScoringQuery(
      "fitness=.65&rarity=8.5&sort=rarity-desc&potential-desc=true"
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
    match: 0.7,
    prospectEnabled: true,
    prospect: 0.95,
    sort: "currentMatch-asc" as const,
    showSelected: false,
  };
  const params = serializeArtifactScoringQuery(query);

  assert.equal(params.has("minLevel"), false);
  assert.equal(params.get("showSelected"), "false");
  assert.deepEqual(parseArtifactScoringQuery(params), query);
});
