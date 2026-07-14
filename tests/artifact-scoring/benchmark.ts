import { performance } from "node:perf_hooks";

import { AttributePosition } from "../../src/genshin/attribute";
import { selectArtifactScoreSummary } from "../../src/features/artifacts/scoringViewModel";
import {
  artifactBatchByteLength,
  artifactBatchTransferList,
  ByteBudgetLruCache,
  createPopulationCacheKey,
  estimateScoreDistributionBytes,
  evaluateArtifactBatch,
  generateNormalFiveStarPopulation,
  validateBuild,
  type DiscreteScoreDistribution,
} from "../../src/utils/artifactScoring";
import { createArtifactScoringBenchmarkFixture } from "./benchmarkFixture";

const milliseconds = (value: number) => Number(value.toFixed(3));
const mebibytes = (value: number) => Number((value / 1024 / 1024).toFixed(3));
const timed = <Value>(operation: () => Value): readonly [Value, number] => {
  const start = performance.now();
  const value = operation();
  return [value, performance.now() - start];
};

const fixture = createArtifactScoringBenchmarkFixture();
const heapBefore = process.memoryUsage().heapUsed;
const [clonedRequest, requestCloneMs] = timed(() => structuredClone(fixture));
const [snapshot, summaryMs] = timed(() =>
  evaluateArtifactBatch(
    "fixed-seed-benchmark",
    clonedRequest.artifacts,
    clonedRequest.builds
  )
);
const heapAfterSummary = process.memoryUsage().heapUsed;
const transferableBytes = artifactBatchByteLength(snapshot.batch);
const [transferredBatch, responseTransferMs] = timed(() =>
  structuredClone(snapshot.batch, {
    transfer: artifactBatchTransferList(snapshot.batch) as ArrayBuffer[],
  })
);
const [, listInteractiveMs] = timed(() => {
  const summaries = Array.from(
    { length: transferredBatch.artifactCount },
    (_, artifactIndex) =>
      selectArtifactScoreSummary(transferredBatch, artifactIndex)
  );
  summaries.sort((left, right) => {
    const leftValue =
      left.status === "ok" ? left.bestExpected.expectedFinalMatch : -1;
    const rightValue =
      right.status === "ok" ? right.bestExpected.expectedFinalMatch : -1;
    return rightValue - leftValue || left.artifactIndex - right.artifactIndex;
  });
  return summaries;
});

const validated = validateBuild(fixture.builds[0].build, fixture.builds[0].id);
if (validated.status !== "ok")
  throw new Error("Benchmark Build did not validate");
const populationInput = {
  profile: validated.profile,
  position: AttributePosition.SANDS,
  milestone: 0 as const,
  sourceProfile: {
    kind: "normal-five-star" as const,
    fourLineStartProbability: 0.2,
  },
};
const populationKey = createPopulationCacheKey(populationInput);
const populationCache = new ByteBudgetLruCache<DiscreteScoreDistribution>(
  32 * 1024 * 1024
);
const getPopulation = () => {
  const cached = populationCache.get(populationKey);
  if (cached) return cached;
  const generated =
    generateNormalFiveStarPopulation(populationInput).distribution;
  populationCache.set(
    populationKey,
    generated,
    estimateScoreDistributionBytes(generated)
  );
  return generated;
};
const [population, coldPopulationMs] = timed(getPopulation);
const [, hitPopulationMs] = timed(getPopulation);
populationCache.clear();
const [, postEvictionPopulationMs] = timed(getPopulation);

process.stdout.write(
  `${JSON.stringify(
    {
      fixture: {
        artifacts: fixture.artifacts.length,
        builds: fixture.builds.length,
      },
      summaryComputeMs: milliseconds(summaryMs),
      requestStructuredCloneMs: milliseconds(requestCloneMs),
      transferableResponseBytes: transferableBytes,
      transferableResponseMiB: mebibytes(transferableBytes),
      responseTransferMs: milliseconds(responseTransferMs),
      expectedSortedListMs: milliseconds(listInteractiveMs),
      heapDeltaAfterSummaryMiB: mebibytes(heapAfterSummary - heapBefore),
      coldPopulationMs: milliseconds(coldPopulationMs),
      cacheHitPopulationMs: milliseconds(hitPopulationMs),
      postEvictionPopulationMs: milliseconds(postEvictionPopulationMs),
      populationAtoms: population.atoms.length,
      estimatedCachedPopulationMiB: mebibytes(populationCache.sizeBytes),
    },
    null,
    2
  )}\n`
);
