import assert from "node:assert/strict";
import test from "node:test";

import {
  BATCH_ENTITY_STATUS,
  compareArtifactScores,
  presentArtifactScore,
  scoreSelectionDecision,
  selectArtifactScoreSummary,
  type ScoreBatchView,
} from "../../src/features/artifacts/scoringViewModel";

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
  match: new Float64Array([0.8, 0.7, 0.7, 0.6, 0.6, 0.6]),
  expectedFinalMatch: new Float64Array([0.81, 0.9, 0.9, 0.75, 0.75, 0.75]),
  isPreferredMain: new Uint8Array([1, 1, 1, 1, 1, 1]),
  pairIssueFlags: new Uint32Array(6),
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
    rawValue: 0.9,
    buildId: "future-build",
    buildIndex: 1,
    isPreferredMain: true,
  });
  assert.deepEqual(presentation?.secondary, {
    kind: "current",
    score: 70,
    rawValue: 0.7,
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
