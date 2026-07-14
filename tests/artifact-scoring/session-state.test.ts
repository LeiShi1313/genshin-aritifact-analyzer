import assert from "node:assert/strict";
import test from "node:test";

import {
  artifactScoringSessionReducer,
  initialArtifactScoringSessionState,
} from "../../src/features/artifacts/scoringSessionState";

const emptyBatch = {
  datasetId: "data",
  algorithmVersion: "v1",
  buildIds: ["build"],
  artifactCount: 1,
  buildCount: 1,
  artifactStatus: new Uint8Array(1),
  artifactIssueFlags: new Uint32Array(1),
  buildStatus: new Uint8Array(1),
  buildIssueFlags: new Uint32Array(1),
  buildSetPlan: new Uint8Array(1),
  match: new Float32Array([0.6]),
  expectedFinalMatch: new Float32Array([0.7]),
  isPreferredMain: new Uint8Array([1]),
  setCompatibility: new Uint8Array(1),
  pairIssueFlags: new Uint32Array(1),
};

test("a new summary atomically invalidates every lazy phase", () => {
  let state = initialArtifactScoringSessionState();
  state = artifactScoringSessionReducer(state, {
    type: "request",
    phase: "setEligibility",
    requestId: "old-set",
  });
  state = artifactScoringSessionReducer(state, {
    type: "request",
    phase: "prospect",
    requestId: "old-prospect",
  });
  state = artifactScoringSessionReducer(state, {
    type: "request",
    phase: "summary",
    requestId: "new-summary",
  });

  assert.equal(state.summary.status, "pending");
  assert.equal(state.prospect.status, "idle");
  assert.equal(state.potential.status, "idle");
  assert.equal(state.setEligibility.status, "idle");
  assert.deepEqual(state.prospect.results, {});
});

test("ignores stale progress, chunks, and completion responses", () => {
  let state = artifactScoringSessionReducer(
    initialArtifactScoringSessionState(),
    {
      type: "request",
      phase: "prospect",
      requestId: "current",
    }
  );
  const unchanged = artifactScoringSessionReducer(state, {
    type: "response",
    response: {
      type: "prospectChunk",
      requestId: "stale",
      results: [
        {
          pair: { artifactIndex: 0, buildIndex: 0 },
          status: "ok",
          result: {
            percentile: 0.95,
            tailProbability: 0.05,
            position: 3,
            milestone: 0,
            sourceProfile: {
              kind: "normal-five-star",
              fourLineStartProbability: 0.2,
            },
          },
        },
      ],
    },
  });
  assert.strictEqual(unchanged, state);
});

test("keeps summary usable while Prospect and Potential progress independently", () => {
  let state = artifactScoringSessionReducer(
    initialArtifactScoringSessionState(),
    {
      type: "request",
      phase: "summary",
      requestId: "summary",
    }
  );
  state = artifactScoringSessionReducer(state, {
    type: "response",
    response: {
      type: "summaryComplete",
      requestId: "summary",
      batch: emptyBatch,
      summaryKey: "snapshot",
      issues: [],
    },
  });
  state = artifactScoringSessionReducer(state, {
    type: "request",
    phase: "potential",
    requestId: "potential",
  });

  assert.equal(state.summary.status, "ready");
  assert.equal(state.potential.status, "pending");
  assert.equal(state.prospect.status, "idle");
});

test("reset removes a ready snapshot when artifacts or builds become empty", () => {
  let state = artifactScoringSessionReducer(
    initialArtifactScoringSessionState(),
    { type: "request", phase: "summary", requestId: "summary" }
  );
  state = artifactScoringSessionReducer(state, {
    type: "response",
    response: {
      type: "summaryComplete",
      requestId: "summary",
      batch: emptyBatch,
      summaryKey: "snapshot",
      issues: [],
    },
  });

  assert.deepEqual(
    artifactScoringSessionReducer(state, { type: "reset" }),
    initialArtifactScoringSessionState()
  );
});

test("marks only lazy phases unavailable when Workers are missing", () => {
  const state = artifactScoringSessionReducer(
    initialArtifactScoringSessionState(),
    {
      type: "workerUnavailable",
    }
  );
  assert.equal(state.summary.status, "idle");
  assert.equal(state.prospect.status, "unavailable");
  assert.equal(state.potential.status, "unavailable");
  assert.equal(state.setEligibility.status, "unavailable");
});

test("population invalidation preserves the Worker-unavailable terminal state", () => {
  const unavailable = artifactScoringSessionReducer(
    initialArtifactScoringSessionState(),
    { type: "workerUnavailable" }
  );
  const invalidated = artifactScoringSessionReducer(unavailable, {
    type: "invalidatePopulationResults",
  });

  assert.equal(invalidated.prospect.status, "unavailable");
  assert.equal(invalidated.potential.status, "unavailable");
  assert.equal(invalidated.setEligibility.status, "unavailable");
});

test("a population assumption change keeps summary but invalidates lazy results", () => {
  let state = artifactScoringSessionReducer(
    initialArtifactScoringSessionState(),
    {
      type: "request",
      phase: "summary",
      requestId: "summary",
    }
  );
  state = artifactScoringSessionReducer(state, {
    type: "response",
    response: {
      type: "summaryComplete",
      requestId: "summary",
      batch: emptyBatch,
      summaryKey: "snapshot",
      issues: [],
    },
  });
  state = artifactScoringSessionReducer(state, {
    type: "request",
    phase: "prospect",
    requestId: "prospect",
  });
  state = artifactScoringSessionReducer(state, {
    type: "response",
    response: {
      type: "prospectChunk",
      requestId: "prospect",
      results: [
        {
          pair: { artifactIndex: 0, buildIndex: 0 },
          status: "ok",
          result: {
            percentile: 0.91,
            tailProbability: 0.09,
            position: 3,
            milestone: 0,
            sourceProfile: {
              kind: "normal-five-star",
              fourLineStartProbability: 0.2,
            },
          },
        },
      ],
    },
  });
  state = artifactScoringSessionReducer(state, {
    type: "request",
    phase: "potential",
    requestId: "potential",
  });
  state = artifactScoringSessionReducer(state, {
    type: "response",
    response: {
      type: "potentialChunk",
      requestId: "potential",
      results: [
        {
          pair: { artifactIndex: 0, buildIndex: 0 },
          status: "ok",
          result: {
            expectedFinalMatch: 0.7,
            p10FinalMatch: 0.6,
            medianFinalMatch: 0.7,
            p90FinalMatch: 0.8,
            bestReachableFinalMatch: 0.9,
          },
          finishChance: {
            kind: "conservative-top-ten",
            result: {
              status: "available",
              targetFinalMatch: 0.8,
              probability: 0.25,
            },
          },
        },
      ],
    },
  });

  const next = artifactScoringSessionReducer(state, {
    type: "invalidatePopulationResults",
  });

  assert.strictEqual(next.summary.batch, emptyBatch);
  assert.equal(next.summary.status, "ready");
  assert.equal(next.prospect.status, "idle");
  assert.equal(next.potential.status, "idle");
  assert.equal(next.setEligibility.status, "idle");
  assert.deepEqual(next.prospect.results, {});
  assert.deepEqual(next.potential.results["0:0"], {
    pair: { artifactIndex: 0, buildIndex: 0 },
    status: "ok",
    result: {
      expectedFinalMatch: 0.7,
      p10FinalMatch: 0.6,
      medianFinalMatch: 0.7,
      p90FinalMatch: 0.8,
      bestReachableFinalMatch: 0.9,
    },
    finishChance: { kind: "none" },
  });
});

test("stores the complete set policy only for the active request", () => {
  const policy = {
    buildCount: 1,
    gateStatus: new Uint8Array(10).fill(1),
    offPieceCutoff: new Uint8Array(10).fill(84),
    expectedFiveStarDrops: new Float64Array(10).fill(100),
  };
  let state = artifactScoringSessionReducer(
    initialArtifactScoringSessionState(),
    {
      type: "request",
      phase: "setEligibility",
      requestId: "current-set",
    }
  );
  const stale = artifactScoringSessionReducer(state, {
    type: "response",
    response: {
      type: "setEligibilityComplete",
      requestId: "stale-set",
      policy,
    },
  });
  assert.strictEqual(stale, state);

  state = artifactScoringSessionReducer(state, {
    type: "response",
    response: {
      type: "setEligibilityComplete",
      requestId: "current-set",
      policy,
    },
  });
  assert.equal(state.setEligibility.status, "ready");
  assert.strictEqual(state.setEligibility.policy, policy);
});
