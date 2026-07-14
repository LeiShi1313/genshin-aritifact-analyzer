import assert from "node:assert/strict";
import test from "node:test";

import {
  artifactBatchByteLength,
  ENTITY_STATUS,
  evaluateArtifactBatch,
} from "../../src/utils/artifactScoring";
import {
  BENCHMARK_ARTIFACT_COUNT,
  BENCHMARK_BUILD_COUNT,
  createArtifactScoringBenchmarkFixture,
} from "./benchmarkFixture";

test("the fixed-seed full workload is legal and stays below the transfer budget", () => {
  const fixture = createArtifactScoringBenchmarkFixture();
  const snapshot = evaluateArtifactBatch(
    "fixed-seed-benchmark",
    fixture.artifacts,
    fixture.builds
  );

  assert.equal(snapshot.batch.artifactCount, BENCHMARK_ARTIFACT_COUNT);
  assert.equal(snapshot.batch.buildCount, BENCHMARK_BUILD_COUNT);
  assert.equal(
    snapshot.batch.artifactStatus.every(
      (status) => status === ENTITY_STATUS.OK
    ),
    true
  );
  assert.equal(
    snapshot.batch.buildStatus.every((status) => status === ENTITY_STATUS.OK),
    true
  );
  assert.equal(snapshot.issues.length, 0);
  assert.ok(artifactBatchByteLength(snapshot.batch) < 6 * 1024 * 1024);
});
