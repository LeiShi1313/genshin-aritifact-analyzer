import assert from "node:assert/strict";
import test from "node:test";

import {
  getArtifactScoreAction,
  getArtifactScoreBand,
  roundExpectedFiveStarDrops,
  toPublicArtifactScore,
} from "../../src/features/artifacts/scorePresentation";

test("floors the public score and reserves 100 for exact perfection", () => {
  assert.equal(toPublicArtifactScore(0), 0);
  assert.equal(toPublicArtifactScore(0.749999), 74);
  assert.equal(toPublicArtifactScore(0.75), 75);
  assert.equal(toPublicArtifactScore(0.58), 58);
  assert.equal(toPublicArtifactScore(0.809999), 80);
  assert.equal(toPublicArtifactScore(1 - Number.EPSILON), 99);
  assert.equal(toPublicArtifactScore(1), 100);

  assert.equal(toPublicArtifactScore(Number.NaN), undefined);
  assert.equal(toPublicArtifactScore(-0.01), undefined);
  assert.equal(toPublicArtifactScore(1.01), undefined);
});

test("assigns calm semantic colors with stronger emphasis for higher scores", () => {
  assert.deepEqual(
    [69, 70, 79, 80, 89, 90, 99, 100].map((score) => {
      const band = getArtifactScoreBand(score);
      return [band.id, band.tone, band.emphasis];
    }),
    [
      ["ordinary", "neutral", "normal"],
      ["good", "info", "normal"],
      ["good", "info", "normal"],
      ["excellent", "success", "strong"],
      ["excellent", "success", "strong"],
      ["exceptional", "accent", "strong"],
      ["exceptional", "accent", "strong"],
      ["perfect", "accent", "maximum"],
    ]
  );
});

test("uses separate calibrated upgrade and finished keep actions", () => {
  assert.deepEqual(
    getArtifactScoreAction({ level: 0, score: 74, isPreferredMain: true }),
    { id: "try-upgrading", recommended: false }
  );
  assert.deepEqual(
    getArtifactScoreAction({ level: 0, score: 75, isPreferredMain: true }),
    { id: "worth-upgrading", recommended: true }
  );
  assert.deepEqual(
    getArtifactScoreAction({ level: 19, score: 80, isPreferredMain: true }),
    { id: "high-priority", recommended: true }
  );
  assert.deepEqual(
    getArtifactScoreAction({ level: 20, score: 79, isPreferredMain: true }),
    { id: "good", recommended: false }
  );
  assert.deepEqual(
    getArtifactScoreAction({ level: 20, score: 80, isPreferredMain: true }),
    { id: "worth-keeping", recommended: true }
  );
});

test("never recommends an artifact with a mismatched main stat", () => {
  for (const level of [0, 20]) {
    assert.deepEqual(
      getArtifactScoreAction({ level, score: 90, isPreferredMain: false }),
      { id: "main-stat-mismatch", recommended: false }
    );
  }
});

test("does not recommend a high stat score that misses the set gate", () => {
  assert.deepEqual(
    getArtifactScoreAction({
      level: 20,
      score: 95,
      isPreferredMain: true,
      recommendation: { status: "ready", failure: "set" },
    }),
    { id: "below-recommendation", recommended: false }
  );
  assert.deepEqual(
    getArtifactScoreAction({
      level: 0,
      score: 90,
      isPreferredMain: true,
      recommendation: { status: "pending", failure: "pending" },
    }),
    { id: "calculating-recommendation", recommended: false }
  );
});

test("rounds the farming tooltip to two useful digits", () => {
  assert.equal(roundExpectedFiveStarDrops(40), 40);
  assert.equal(roundExpectedFiveStarDrops(7_331), 7_300);
  assert.equal(roundExpectedFiveStarDrops(Number.POSITIVE_INFINITY), undefined);
});
