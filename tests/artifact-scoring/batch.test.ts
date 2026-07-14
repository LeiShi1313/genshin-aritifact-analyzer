import assert from "node:assert/strict";
import test from "node:test";

import type { Artifact } from "../../src/genshin/artifact";
import { AttributePosition, AttributeType } from "../../src/genshin/attribute";
import type { Build } from "../../src/genshin/build";
import {
  artifactBatchByteLength,
  BUILD_SET_PLAN,
  ENTITY_STATUS,
  evaluateArtifactBatch,
  evaluateArtifactBatchCooperatively,
  SET_COMPATIBILITY,
} from "../../src/utils/artifactScoring";

const build: Build = {
  name: "test",
  character: 0,
  weapons: [],
  suits: [],
  flowerAttributes: [AttributeType.HP],
  plumeAttributes: [AttributeType.ATK],
  sandsAttributes: [AttributeType.ATK_PERCENT],
  gobletAttributes: [],
  circletAttributes: [],
  subAttributes: [
    { type: AttributeType.CRIT_RATE, value: 1 },
    { type: AttributeType.CRIT_DAMAGE, value: 1 },
    { type: AttributeType.ENERGY_RECHARGE, value: 1 },
    { type: AttributeType.ELEMENTAL_MASTERY, value: 1 },
  ],
};

const artifact = (star = 5): Artifact => ({
  set: 0,
  star,
  level: 0,
  position: AttributePosition.SANDS,
  mainAttribute: { type: AttributeType.ATK_PERCENT, value: 0 },
  subAttributes: [
    { type: AttributeType.CRIT_RATE, value: 0.027 },
    { type: AttributeType.CRIT_DAMAGE, value: 0.054 },
    { type: AttributeType.HP_PERCENT, value: 0.041 },
    { type: AttributeType.DEF_PERCENT, value: 0.051 },
  ],
  character: 0,
  locked: false,
});

test("evaluates a columnar summary and leaves unsupported rows as NaN", () => {
  const progress: number[] = [];
  const snapshot = evaluateArtifactBatch(
    "dataset",
    [artifact(), artifact(4)],
    [{ id: "build", build }],
    (completed) => progress.push(completed)
  );

  assert.equal(snapshot.batch.match[0], 47 / 85);
  assert.equal(snapshot.batch.expectedFinalMatch[0], 461 / 680);
  assert.equal(snapshot.batch.artifactStatus[1], ENTITY_STATUS.UNSUPPORTED);
  assert.equal(Number.isNaN(snapshot.batch.match[1]), true);
  assert.deepEqual(progress, [1, 2]);
  assert.match(snapshot.summaryKey, /^artifact-scoring-v2:dataset:/);
});

test("marks invalid builds without allocating nested pair objects", () => {
  const invalidBuild = {
    ...build,
    subAttributes: [{ type: AttributeType.CRIT_RATE, value: 0.55 }],
  };
  const snapshot = evaluateArtifactBatch(
    "dataset",
    [artifact()],
    [{ id: "invalid", build: invalidBuild }]
  );

  assert.equal(snapshot.batch.buildStatus[0], ENTITY_STATUS.INVALID);
  assert.equal(Number.isNaN(snapshot.batch.expectedFinalMatch[0]), true);
});

test("binds strict four-piece compatibility and keys set changes", () => {
  const strictBuild: Build = {
    ...build,
    suits: [{ setCombos: [{ set: 10, count: 4 }] }],
  };
  const onSet = { ...artifact(), set: 10 };
  const offSet = { ...artifact(), set: 20 };
  const snapshot = evaluateArtifactBatch(
    "dataset",
    [onSet, offSet],
    [{ id: "build", build: strictBuild }]
  );

  assert.deepEqual(
    [...snapshot.batch.buildSetPlan],
    [BUILD_SET_PLAN.STRICT_FOUR_PIECE]
  );
  assert.deepEqual(
    [...snapshot.batch.setCompatibility],
    [SET_COMPATIBILITY.MATCH, SET_COMPATIBILITY.MISMATCH]
  );
  assert.notEqual(
    snapshot.summaryKey,
    evaluateArtifactBatch(
      "dataset",
      [offSet, offSet],
      [{ id: "build", build: strictBuild }]
    ).summaryKey
  );
  assert.notEqual(
    snapshot.summaryKey,
    evaluateArtifactBatch(
      "dataset",
      [onSet, offSet],
      [
        {
          id: "build",
          build: {
            ...strictBuild,
            suits: [{ setCombos: [{ set: 20, count: 4 }] }],
          },
        },
      ]
    ).summaryKey
  );
});

test("keeps the specified 2,112 by 104 transferable summary below 6 MiB", () => {
  const artifactCount = 2_112;
  const buildCount = 104;
  const pairCount = artifactCount * buildCount;
  const batch = {
    datasetId: "benchmark",
    algorithmVersion: "artifact-scoring-v1",
    buildIds: Array.from({ length: buildCount }, (_, index) => String(index)),
    artifactCount,
    buildCount,
    artifactStatus: new Uint8Array(artifactCount),
    artifactIssueFlags: new Uint32Array(artifactCount),
    buildStatus: new Uint8Array(buildCount),
    buildIssueFlags: new Uint32Array(buildCount),
    buildSetPlan: new Uint8Array(buildCount),
    match: new Float64Array(pairCount),
    expectedFinalMatch: new Float64Array(pairCount),
    isPreferredMain: new Uint8Array(pairCount),
    setCompatibility: new Uint8Array(pairCount),
    pairIssueFlags: new Uint32Array(pairCount),
  };
  assert.ok(artifactBatchByteLength(batch) < 6 * 1024 * 1024);
});

test("cooperative summary evaluation matches the synchronous batch", async () => {
  const inputs = [artifact(), artifact()];
  const builds = [{ id: "build", build }];
  const synchronous = evaluateArtifactBatch("dataset", inputs, builds);
  let yields = 0;
  const cooperative = await evaluateArtifactBatchCooperatively(
    "dataset",
    inputs,
    builds,
    {
      maxSliceMs: 0,
      yieldControl: async () => {
        yields += 1;
      },
    }
  );

  assert.ok(cooperative);
  assert.ok(yields >= inputs.length);
  assert.deepEqual(
    [...cooperative.batch.expectedFinalMatch],
    [...synchronous.batch.expectedFinalMatch]
  );
  assert.equal(cooperative.summaryKey, synchronous.summaryKey);
});

test("cooperative summary evaluation stops after cancellation", async () => {
  let cancelled = false;
  let completed = 0;
  const result = await evaluateArtifactBatchCooperatively(
    "dataset",
    Array.from({ length: 20 }, () => artifact()),
    [{ id: "build", build }],
    {
      maxSliceMs: 0,
      shouldCancel: () => cancelled,
      yieldControl: async () => {
        cancelled = true;
      },
      onProgress: (value) => {
        completed = value;
      },
    }
  );

  assert.equal(result, undefined);
  assert.equal(completed, 1);
});
