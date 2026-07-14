import assert from "node:assert/strict";
import test from "node:test";

import {
  BATCH_ENTITY_STATUS,
  compareArtifactScores,
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

test("uses Match AND optional Prospect as the selection gate", () => {
  const summary = selectArtifactScoreSummary(batch(), 0);
  const query = { match: 0.75, prospectEnabled: true, prospect: 0.9 };

  assert.equal(
    scoreSelectionDecision(summary, query, {
      status: "ready",
      percentile: 0.89,
    }),
    "unselected"
  );
  assert.equal(
    scoreSelectionDecision(summary, query, {
      status: "ready",
      percentile: 0.9,
    }),
    "selected"
  );
  assert.equal(
    scoreSelectionDecision(summary, query, { status: "pending" }),
    "pending"
  );
  assert.equal(
    scoreSelectionDecision(
      summary,
      { ...query, prospectEnabled: false },
      { status: "error" }
    ),
    "selected"
  );
});

test("sorts by Expected +20 by default and leaves unsupported rows last", () => {
  const input = batch();
  const first = selectArtifactScoreSummary(input, 0);
  const second = selectArtifactScoreSummary(input, 1);
  const sorted = [second, first].sort((left, right) =>
    compareArtifactScores(
      left,
      right,
      { status: "idle" },
      { status: "idle" },
      "expectedFinalMatch-desc"
    )
  );
  assert.equal(sorted[0].artifactIndex, 0);

  input.artifactStatus[0] = BATCH_ENTITY_STATUS.UNSUPPORTED;
  const unsupported = selectArtifactScoreSummary(input, 0);
  assert.ok(
    compareArtifactScores(
      unsupported,
      second,
      { status: "unavailable" },
      { status: "ready", percentile: 0.5 },
      "currentMatch-desc"
    ) > 0
  );
});
