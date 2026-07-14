import assert from "node:assert/strict";
import test from "node:test";

import { AttributePosition } from "../../src/genshin/attribute";
import {
  BATCH_ENTITY_STATUS,
  compareArtifactScores,
  matchingCharacterScores,
  presentArtifactScore,
  scoreSelectionDecision,
  selectArtifactScoreSummary,
  type ScoreBatchView,
} from "../../src/features/artifacts/scoringViewModel";
import { SET_COMPATIBILITY } from "../../src/utils/artifactScoring";
import {
  SET_ELIGIBILITY_GATE_STATUS,
  setEligibilityGateIndex,
  type SetEligibilityPolicyBatch,
} from "../../src/workers/artifactScoringProtocol";

const batch = (): ScoreBatchView => ({
  buildIds: ["current-build", "future-build", "tie-build"],
  artifactCount: 2,
  buildCount: 3,
  artifactStatus: new Uint8Array([
    BATCH_ENTITY_STATUS.OK,
    BATCH_ENTITY_STATUS.OK,
  ]),
  artifactIssueFlags: new Uint32Array(2),
  buildStatus: new Uint8Array(3),
  buildIssueFlags: new Uint32Array(3),
  buildSetPlan: new Uint8Array(3),
  match: new Float32Array([0.8, 0.7, 0.7, 0.6, 0.6, 0.6]),
  expectedFinalMatch: new Float32Array([0.81, 0.9, 0.9, 0.75, 0.75, 0.75]),
  isPreferredMain: new Uint8Array([1, 1, 1, 1, 1, 1]),
  setCompatibility: new Uint8Array(6),
  pairIssueFlags: new Uint32Array(6),
});

const setPolicy = (): SetEligibilityPolicyBatch => ({
  buildCount: 3,
  gateStatus: new Uint8Array(30).fill(SET_ELIGIBILITY_GATE_STATUS.AVAILABLE),
  offPieceCutoff: new Uint8Array(30).fill(84),
  expectedFiveStarDrops: new Float64Array(30).fill(100),
});

const readySetContext = (policy = setPolicy()) => ({
  position: AttributePosition.SANDS,
  setEligibility: { status: "ready" as const, policy },
});

test("binds current and expected metrics to their independently best builds", () => {
  const summary = selectArtifactScoreSummary(batch(), 0);
  assert.equal(summary.status, "ok");
  if (summary.status !== "ok") return;
  assert.equal(summary.bestCurrent.buildId, "current-build");
  assert.equal(summary.bestExpected.buildId, "future-build");
});

test("binds unfinished Potential and current context to one best-Expected build", () => {
  const summary = selectArtifactScoreSummary(batch(), 0);
  assert.equal(summary.status, "ok");
  if (summary.status !== "ok") return;

  const presentation = presentArtifactScore(summary, 0);
  assert.deepEqual(presentation?.primary, {
    kind: "potential",
    score: 90,
    rawValue: Math.fround(0.9),
    buildId: "future-build",
    buildIndex: 1,
    isPreferredMain: true,
    recommendation: {
      status: "ready",
      recommended: true,
      role: "neutral",
      requiredScore: 75,
      failure: "none",
    },
  });
  assert.deepEqual(presentation?.secondary, {
    kind: "current",
    score: 70,
    rawValue: Math.fround(0.7),
    buildId: "future-build",
    buildIndex: 1,
  });
});

test("shows one finished Score and no redundant Potential at +20", () => {
  const input = batch();
  input.expectedFinalMatch.set(input.match);
  const summary = selectArtifactScoreSummary(input, 0);
  assert.equal(summary.status, "ok");
  if (summary.status !== "ok") return;

  const presentation = presentArtifactScore(summary, 20);
  assert.equal(presentation?.primary.kind, "score");
  assert.equal(presentation?.primary.score, 80);
  assert.equal(presentation?.primary.buildId, "current-build");
  assert.equal(presentation?.secondary, undefined);
});

test("reports valid artifacts as unavailable when every build is invalid", () => {
  const input = batch();
  input.buildStatus.fill(BATCH_ENTITY_STATUS.INVALID);

  assert.deepEqual(selectArtifactScoreSummary(input, 0), {
    status: "unavailable",
    artifactIndex: 0,
    issueFlags: 0,
  });
});

test("breaks expected ties by current match and then enabled-build order", () => {
  const input = batch();
  input.match[2] = 0.71;
  let summary = selectArtifactScoreSummary(input, 0);
  assert.equal(
    summary.status === "ok" && summary.bestExpected.buildId,
    "tie-build"
  );

  input.match[2] = 0.7;
  summary = selectArtifactScoreSummary(input, 0);
  assert.equal(
    summary.status === "ok" && summary.bestExpected.buildId,
    "future-build"
  );
});

test("uses calibrated level-aware public scores and the main-stat gate", () => {
  const summary = selectArtifactScoreSummary(batch(), 0);
  const query = { minPotential: 90, minScore: 80 };

  assert.equal(scoreSelectionDecision(summary, 0, query), "selected");
  assert.equal(
    scoreSelectionDecision(summary, 0, { ...query, minPotential: 91 }),
    "unselected"
  );

  const finished = batch();
  finished.expectedFinalMatch.set(finished.match);
  const finishedSummary = selectArtifactScoreSummary(finished, 0);
  assert.equal(scoreSelectionDecision(finishedSummary, 20, query), "selected");

  const wrongMain = batch();
  wrongMain.isPreferredMain.fill(0);
  assert.equal(
    scoreSelectionDecision(selectArtifactScoreSummary(wrongMain, 0), 0, {
      minPotential: 0,
      minScore: 0,
    }),
    "unselected"
  );
});

test("sorts by the level-aware public score and leaves unsupported rows last", () => {
  const input = batch();
  const first = selectArtifactScoreSummary(input, 0);
  const second = selectArtifactScoreSummary(input, 1);
  const sorted = [second, first].sort((left, right) =>
    compareArtifactScores(
      left,
      right,
      left.artifactIndex === 0 ? 0 : 20,
      right.artifactIndex === 0 ? 0 : 20,
      "score-desc"
    )
  );
  assert.equal(sorted[0].artifactIndex, 0);

  input.artifactStatus[0] = BATCH_ENTITY_STATUS.UNSUPPORTED;
  const unsupported = selectArtifactScoreSummary(input, 0);
  assert.ok(
    compareArtifactScores(unsupported, second, 0, 20, "score-desc") > 0
  );
  assert.ok(compareArtifactScores(unsupported, second, 0, 20, "score-asc") > 0);
});

test("selects the highest raw score only after applying the set gate", () => {
  const input = batch();
  input.buildSetPlan.fill(1);
  input.expectedFinalMatch.set([0.9, 0.85, 0.8], 0);
  input.setCompatibility.set(
    [
      SET_COMPATIBILITY.MISMATCH,
      SET_COMPATIBILITY.MATCH,
      SET_COMPATIBILITY.MISMATCH,
    ],
    0
  );
  const policy = setPolicy();
  policy.offPieceCutoff[
    setEligibilityGateIndex(0, 0, AttributePosition.SANDS)
  ] = 91;
  policy.offPieceCutoff[
    setEligibilityGateIndex(2, 0, AttributePosition.SANDS)
  ] = 95;

  let summary = selectArtifactScoreSummary(input, 0, readySetContext(policy));
  assert.equal(
    summary.status === "ok" && summary.bestExpected.buildId,
    "future-build"
  );
  let presentation = presentArtifactScore(summary, 0);
  assert.equal(presentation?.primary.score, 85);
  assert.equal(presentation?.primary.recommendation.role, "set-match");

  input.expectedFinalMatch[0] = 0.91;
  summary = selectArtifactScoreSummary(input, 0, readySetContext(policy));
  presentation = presentArtifactScore(summary, 0);
  assert.equal(presentation?.primary.buildId, "current-build");
  assert.deepEqual(presentation?.primary.recommendation, {
    status: "ready",
    recommended: true,
    role: "off-piece-candidate",
    requiredScore: 91,
    expectedFiveStarDrops: 100,
    failure: "none",
  });
});

test("falls back to the raw best score when no Build passes the set gate", () => {
  const input = batch();
  input.buildSetPlan.fill(1);
  input.expectedFinalMatch.set([0.9, 0.85, 0.8], 0);
  input.setCompatibility.fill(SET_COMPATIBILITY.MISMATCH);
  const policy = setPolicy();
  policy.offPieceCutoff.fill(95);

  const summary = selectArtifactScoreSummary(input, 0, readySetContext(policy));
  const presentation = presentArtifactScore(summary, 0);
  assert.equal(presentation?.primary.buildId, "current-build");
  assert.equal(presentation?.primary.score, 90);
  assert.deepEqual(presentation?.primary.recommendation, {
    status: "ready",
    recommended: false,
    role: "set-mismatch",
    requiredScore: 95,
    expectedFiveStarDrops: 100,
    failure: "set",
  });
  assert.equal(
    scoreSelectionDecision(summary, 0, { minPotential: 75, minScore: 80 }),
    "unselected"
  );
});

test("combines the custom minimum with the Build-derived off-piece cutoff", () => {
  const input = batch();
  input.buildSetPlan.fill(1);
  input.expectedFinalMatch.set([0.9, 0.85, 0.8], 0);
  input.setCompatibility.set(
    [
      SET_COMPATIBILITY.MISMATCH,
      SET_COMPATIBILITY.MATCH,
      SET_COMPATIBILITY.MISMATCH,
    ],
    0
  );
  const policy = setPolicy();
  policy.offPieceCutoff[
    setEligibilityGateIndex(0, 0, AttributePosition.SANDS)
  ] = 91;
  policy.offPieceCutoff[
    setEligibilityGateIndex(2, 0, AttributePosition.SANDS)
  ] = 95;
  const summary = selectArtifactScoreSummary(input, 0, readySetContext(policy));

  assert.equal(
    scoreSelectionDecision(summary, 0, { minPotential: 85, minScore: 80 }),
    "selected"
  );
  assert.equal(
    scoreSelectionDecision(summary, 0, { minPotential: 86, minScore: 80 }),
    "unselected"
  );
});

test("presents and sorts by the same query-eligible Build used for selection", () => {
  const input = batch();
  input.buildSetPlan.fill(1);
  input.expectedFinalMatch.set([0.9, 0.74, 0.7], 0);
  input.setCompatibility.set(
    [
      SET_COMPATIBILITY.MISMATCH,
      SET_COMPATIBILITY.MATCH,
      SET_COMPATIBILITY.MISMATCH,
    ],
    0
  );
  const policy = setPolicy();
  policy.offPieceCutoff[
    setEligibilityGateIndex(0, 0, AttributePosition.SANDS)
  ] = 91;
  const summary = selectArtifactScoreSummary(input, 0, readySetContext(policy));
  const query = { minPotential: 70, minScore: 80 };

  assert.equal(scoreSelectionDecision(summary, 0, query), "selected");
  const presentation = presentArtifactScore(summary, 0, query.minPotential);
  assert.equal(presentation?.primary.buildId, "future-build");
  assert.equal(presentation?.primary.score, 74);
  assert.equal(presentation?.primary.recommendation.role, "set-match");

  const comparisonInput = batch();
  comparisonInput.expectedFinalMatch.set([0.75, 0.75, 0.75], 3);
  const comparison = selectArtifactScoreSummary(comparisonInput, 1);
  assert.ok(
    compareArtifactScores(summary, comparison, 0, 0, "score-desc", query) > 0
  );
});

test("ranks unique characters by their best eligible Build", () => {
  const input = batch();
  input.expectedFinalMatch.set([0.8, 0.9, 0.85], 0);
  const summary = selectArtifactScoreSummary(input, 0);
  const builds: Record<string, { character: number }> = {
    "current-build": { character: 1 },
    "future-build": { character: 1 },
    "tie-build": { character: 2 },
  };

  assert.deepEqual(
    matchingCharacterScores(summary, builds, 0, 75).map((score) =>
      Object.freeze({
        buildId: score.buildId,
        character: builds[score.buildId].character,
      })
    ),
    [
      { buildId: "future-build", character: 1 },
      { buildId: "tie-build", character: 2 },
    ]
  );
});

test("uses raw finished scores to pick one stable Build per available character", () => {
  const input = batch();
  input.match.set([0.801, 0.809, 0.805], 0);
  input.expectedFinalMatch.set([0.99, 0.8, 0.99], 0);
  const summary = selectArtifactScoreSummary(input, 0);
  const builds: Record<string, { character: number }> = {
    "current-build": { character: 1 },
    "future-build": { character: 1 },
    "tie-build": { character: 2 },
  };

  assert.deepEqual(
    matchingCharacterScores(summary, builds, 20, 80).map((score) =>
      Object.freeze({
        buildId: score.buildId,
        character: builds[score.buildId].character,
      })
    ),
    [
      { buildId: "future-build", character: 1 },
      { buildId: "tie-build", character: 2 },
    ]
  );

  delete builds["tie-build"];
  assert.deepEqual(
    matchingCharacterScores(summary, builds, 20, 80).map(
      (score) => score.buildId
    ),
    ["future-build"]
  );
});
