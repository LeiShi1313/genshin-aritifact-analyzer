/// <reference lib="webworker" />

import {
  artifactBatchTransferList,
  BUILD_SET_PLAN,
  ByteBudgetLruCache,
  calculateSetEligibilityGatesFromBins,
  calculateArtifactPotentialCooperatively,
  calculateConservativeTopTenFinish,
  CooperativeComputation,
  createPopulationCacheKey,
  evaluateProspect,
  evaluateArtifactBatchCooperatively,
  estimateScoreDistributionBytes,
  expectedFinalQualityRational,
  generateNormalFiveStarPopulationCooperatively,
  publicScoreBins,
  probabilityAtLeast,
  rationalToNumber,
  type ArtifactScoringSnapshot,
  type BuildScoringProfile,
  type CanonicalArtifactState,
  type DiscreteScoreDistribution,
} from "../utils/artifactScoring";
import { AttributePosition } from "../genshin/attribute";
import type {
  PairRef,
  FinishChanceResult,
  NormalSourceFiveStarProfile,
  PotentialDelta,
  ProspectDelta,
  ScoringPhase,
  ScoringWorkerRequest,
  ScoringWorkerResponse,
  SetEligibilityPolicyBatch,
} from "./artifactScoringProtocol";
import {
  ARTIFACT_SCORING_ALGORITHM_VERSION,
  hasValidLazyRequestIdentity,
  scoringRequestIdOrUnknown,
  SET_ELIGIBILITY_GATES_PER_BUILD,
  SET_ELIGIBILITY_GATE_STATUS,
  setEligibilityGateIndex,
} from "./artifactScoringProtocol";

const scope: DedicatedWorkerGlobalScope =
  self as unknown as DedicatedWorkerGlobalScope;
const cancelled = new Set<string>();
const activeLazyRequests = new Set<string>();
let activeSummaryRequest: string | undefined;
let retainedSnapshot: ArtifactScoringSnapshot | undefined;
const populationCache = new ByteBudgetLruCache<DiscreteScoreDistribution>(
  32 * 1024 * 1024
);
interface CompactSetPolicy {
  readonly gateStatus: Uint8Array;
  readonly offPieceCutoff: Uint8Array;
  readonly expectedFiveStarDrops: Float64Array;
}
const setPolicyCache = new ByteBudgetLruCache<CompactSetPolicy>(256 * 1024);
const SET_POLICY_CACHE_ENTRY_BYTES = 512;
const SET_POSITIONS = [
  AttributePosition.FLOWER,
  AttributePosition.PLUME,
  AttributePosition.SANDS,
  AttributePosition.GOBLET,
  AttributePosition.CIRCLET,
] as const;

const respond = (
  response: ScoringWorkerResponse,
  transfer: Transferable[] = []
) => {
  scope.postMessage(response, transfer);
};

const error = (
  requestId: string,
  phase: ScoringPhase,
  code: "INVALID_WORKER_REQUEST" | "STALE_SCORING_SNAPSHOT"
) => {
  respond({
    type: "error",
    requestId,
    phase,
    issues: [{ code, severity: "error" }],
  });
};

const snapshotMatches = (
  request: Extract<
    ScoringWorkerRequest,
    { type: "setEligibility" | "prospect" | "potential" }
  >
): boolean =>
  retainedSnapshot?.datasetId === request.datasetId &&
  retainedSnapshot.summaryKey === request.summaryKey;

const yieldToMessageQueue = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

const getPopulation = async (
  profile: BuildScoringProfile,
  position: CanonicalArtifactState["position"],
  milestone: CanonicalArtifactState["milestone"],
  sourceProfile: NormalSourceFiveStarProfile,
  computation: CooperativeComputation
): Promise<DiscreteScoreDistribution | undefined> => {
  const input = { profile, position, milestone, sourceProfile };
  const key = createPopulationCacheKey(input);
  const cached = populationCache.get(key);
  if (cached) return cached;
  const population = await generateNormalFiveStarPopulationCooperatively(
    input,
    computation
  );
  if (!population) return undefined;
  populationCache.set(
    key,
    population.distribution,
    estimateScoreDistributionBytes(population.distribution)
  );
  return population.distribution;
};

const validSourceProfile = (
  value: unknown
): value is NormalSourceFiveStarProfile => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<NormalSourceFiveStarProfile>;
  return (
    candidate.kind === "normal-five-star" &&
    typeof candidate.fourLineStartProbability === "number" &&
    Number.isFinite(candidate.fourLineStartProbability) &&
    candidate.fourLineStartProbability >= 0 &&
    candidate.fourLineStartProbability <= 1
  );
};

const validPair = (value: unknown): value is PairRef => {
  if (!value || typeof value !== "object") return false;
  const pair = value as Partial<PairRef>;
  return (
    Number.isInteger(pair.artifactIndex) &&
    Number.isInteger(pair.buildIndex) &&
    Number(pair.artifactIndex) >= 0 &&
    Number(pair.buildIndex) >= 0
  );
};

const validTargets = (value: unknown): value is readonly PairRef[] =>
  Array.isArray(value) && value.every(validPair);

const validPotentialFinishTarget = (
  value: unknown
): value is Extract<
  ScoringWorkerRequest,
  { type: "potential" }
>["finishTarget"] => {
  if (!value || typeof value !== "object") return false;
  const target = value as Record<string, unknown>;
  if (target.kind === "none") return true;
  if (target.kind === "conservative-top-ten") {
    return validSourceProfile(target.sourceProfile);
  }
  if (target.kind !== "absolute-match") return false;
  if (!target.target || typeof target.target !== "object") return false;
  const rational = target.target as Record<string, unknown>;
  return (
    typeof rational.numerator === "bigint" &&
    typeof rational.denominator === "bigint" &&
    rational.denominator > 0n &&
    rational.numerator >= 0n &&
    rational.numerator <= rational.denominator
  );
};

const pairState = (
  pair: PairRef
):
  | {
      readonly status: "ok";
      readonly artifact: CanonicalArtifactState;
      readonly profile: BuildScoringProfile;
    }
  | {
      readonly status: "unsupported" | "invalid";
      readonly issues: ArtifactScoringSnapshot["issues"];
    } => {
  const snapshot = retainedSnapshot;
  if (
    !snapshot ||
    !Number.isInteger(pair.artifactIndex) ||
    !Number.isInteger(pair.buildIndex) ||
    pair.artifactIndex < 0 ||
    pair.artifactIndex >= snapshot.canonicalArtifacts.length ||
    pair.buildIndex < 0 ||
    pair.buildIndex >= snapshot.buildProfiles.length
  ) {
    return {
      status: "invalid",
      issues: [{ code: "INVALID_WORKER_REQUEST", severity: "error" }],
    };
  }
  const artifact = snapshot.canonicalArtifacts[pair.artifactIndex];
  const profile = snapshot.buildProfiles[pair.buildIndex];
  if (!artifact || !profile) {
    const buildId = snapshot.batch.buildIds[pair.buildIndex];
    const issues = snapshot.issues.filter(
      (issue) =>
        issue.artifactIndex === pair.artifactIndex || issue.buildId === buildId
    );
    return {
      status: issues.some(
        (issue) => issue.code === "UNSUPPORTED_ARTIFACT_STAR_RARITY"
      )
        ? "unsupported"
        : "invalid",
      issues,
    };
  }
  return { status: "ok", artifact, profile };
};

const wasCancelled = (requestId: string, phase: ScoringPhase): boolean => {
  if (!cancelled.delete(requestId)) return false;
  activeLazyRequests.delete(requestId);
  respond({ type: "cancelled", requestId, phase });
  return true;
};

const compactSetPolicyCacheKey = (
  profile: BuildScoringProfile,
  sourceProfile: NormalSourceFiveStarProfile
): string =>
  `${ARTIFACT_SCORING_ALGORITHM_VERSION}:set-policy:${createPopulationCacheKey({
    profile,
    position: AttributePosition.FLOWER,
    milestone: 0,
    sourceProfile,
  })}`;

const calculateCompactSetPolicy = async (
  profile: BuildScoringProfile,
  sourceProfile: NormalSourceFiveStarProfile,
  computation: CooperativeComputation
): Promise<CompactSetPolicy | undefined> => {
  const cacheKey = compactSetPolicyCacheKey(profile, sourceProfile);
  const cached = setPolicyCache.get(cacheKey);
  if (cached) return cached;

  const gateStatus = new Uint8Array(SET_ELIGIBILITY_GATES_PER_BUILD);
  const offPieceCutoff = new Uint8Array(SET_ELIGIBILITY_GATES_PER_BUILD);
  const expectedFiveStarDrops = new Float64Array(
    SET_ELIGIBILITY_GATES_PER_BUILD
  );
  expectedFiveStarDrops.fill(Number.NaN);

  for (const [referenceMilestone, baseScore] of [
    [0, 75],
    [20, 80],
  ] as const) {
    const positionBins = [];
    for (const position of SET_POSITIONS) {
      const population = await generateNormalFiveStarPopulationCooperatively(
        { profile, position, milestone: referenceMilestone, sourceProfile },
        computation
      );
      if (!population) return undefined;
      positionBins.push(publicScoreBins(population.distribution));
    }
    const gates = calculateSetEligibilityGatesFromBins(positionBins, baseScore);
    gates.forEach((gate, positionIndex) => {
      const index = (referenceMilestone === 20 ? 5 : 0) + positionIndex;
      if (gate.status === "available") {
        gateStatus[index] = SET_ELIGIBILITY_GATE_STATUS.AVAILABLE;
        offPieceCutoff[index] = gate.offPieceCutoff;
        expectedFiveStarDrops[index] = gate.expectedFiveStarDrops;
      } else {
        gateStatus[index] = SET_ELIGIBILITY_GATE_STATUS.UNAVAILABLE;
      }
    });
  }

  const policy = { gateStatus, offPieceCutoff, expectedFiveStarDrops };
  setPolicyCache.set(cacheKey, policy, SET_POLICY_CACHE_ENTRY_BYTES);
  return policy;
};

const handleSetEligibility = async (
  request: Extract<ScoringWorkerRequest, { type: "setEligibility" }>
) => {
  const safeRequestId = scoringRequestIdOrUnknown(request.requestId);
  if (
    !hasValidLazyRequestIdentity(request, "setEligibility") ||
    !validSourceProfile(request.sourceProfile)
  ) {
    error(safeRequestId, "setEligibility", "INVALID_WORKER_REQUEST");
    return;
  }
  if (!snapshotMatches(request)) {
    error(request.requestId, "setEligibility", "STALE_SCORING_SNAPSHOT");
    return;
  }

  const snapshot = retainedSnapshot;
  if (!snapshot) {
    error(request.requestId, "setEligibility", "STALE_SCORING_SNAPSHOT");
    return;
  }
  activeLazyRequests.add(request.requestId);
  const computation = new CooperativeComputation({
    maxSliceMs: 8,
    shouldCancel: () => cancelled.has(request.requestId),
    yieldControl: yieldToMessageQueue,
  });
  const gateCount =
    snapshot.buildProfiles.length * SET_ELIGIBILITY_GATES_PER_BUILD;
  const policy: SetEligibilityPolicyBatch = {
    buildCount: snapshot.buildProfiles.length,
    gateStatus: new Uint8Array(gateCount),
    offPieceCutoff: new Uint8Array(gateCount),
    expectedFiveStarDrops: new Float64Array(gateCount),
  };
  policy.expectedFiveStarDrops.fill(Number.NaN);

  try {
    for (
      let buildIndex = 0;
      buildIndex < snapshot.buildProfiles.length;
      buildIndex += 1
    ) {
      if (wasCancelled(request.requestId, "setEligibility")) return;
      if (!snapshotMatches(request)) {
        error(request.requestId, "setEligibility", "STALE_SCORING_SNAPSHOT");
        return;
      }
      const profile = snapshot.buildProfiles[buildIndex];
      const plan = snapshot.buildSetPlans[buildIndex];
      if (profile && plan.kind === BUILD_SET_PLAN.STRICT_FOUR_PIECE) {
        const compact = await calculateCompactSetPolicy(
          profile,
          request.sourceProfile,
          computation
        );
        if (!compact) {
          wasCancelled(request.requestId, "setEligibility");
          return;
        }
        const offset = setEligibilityGateIndex(
          buildIndex,
          0,
          AttributePosition.FLOWER
        );
        policy.gateStatus.set(compact.gateStatus, offset);
        policy.offPieceCutoff.set(compact.offPieceCutoff, offset);
        policy.expectedFiveStarDrops.set(compact.expectedFiveStarDrops, offset);
      }
      respond({
        type: "progress",
        requestId: request.requestId,
        phase: "setEligibility",
        completed: buildIndex + 1,
        total: snapshot.buildProfiles.length,
      });
      await yieldToMessageQueue();
    }
    if (wasCancelled(request.requestId, "setEligibility")) return;
    respond(
      {
        type: "setEligibilityComplete",
        requestId: request.requestId,
        policy,
      },
      [
        policy.gateStatus.buffer,
        policy.offPieceCutoff.buffer,
        policy.expectedFiveStarDrops.buffer,
      ]
    );
  } catch {
    error(request.requestId, "setEligibility", "INVALID_WORKER_REQUEST");
  } finally {
    activeLazyRequests.delete(request.requestId);
  }
};

const handleProspect = async (
  request: Extract<ScoringWorkerRequest, { type: "prospect" }>
) => {
  const safeRequestId = scoringRequestIdOrUnknown(request.requestId);
  if (
    !hasValidLazyRequestIdentity(request, "prospect") ||
    !validTargets(request.targets) ||
    !validSourceProfile(request.sourceProfile)
  ) {
    error(safeRequestId, "prospect", "INVALID_WORKER_REQUEST");
    return;
  }
  if (!snapshotMatches(request)) {
    error(request.requestId, "prospect", "STALE_SCORING_SNAPSHOT");
    return;
  }
  activeLazyRequests.add(request.requestId);
  const computation = new CooperativeComputation({
    maxSliceMs: 8,
    shouldCancel: () => cancelled.has(request.requestId),
    yieldControl: yieldToMessageQueue,
  });
  const chunk: ProspectDelta[] = [];
  try {
    for (let index = 0; index < request.targets.length; index += 1) {
      if (wasCancelled(request.requestId, "prospect")) return;
      if (!snapshotMatches(request)) {
        error(request.requestId, "prospect", "STALE_SCORING_SNAPSHOT");
        return;
      }
      const pair = request.targets[index];
      const state = pairState(pair);
      if (state.status !== "ok") {
        chunk.push({ pair, status: state.status, issues: state.issues });
      } else {
        const population = await getPopulation(
          state.profile,
          state.artifact.position,
          state.artifact.milestone,
          request.sourceProfile,
          computation
        );
        if (!population) {
          wasCancelled(request.requestId, "prospect");
          return;
        }
        const quality = expectedFinalQualityRational(
          state.artifact,
          state.profile
        );
        chunk.push({
          pair,
          status: "ok",
          result: {
            ...evaluateProspect(population, quality),
            position: state.artifact.position,
            milestone: state.artifact.milestone,
            sourceProfile: request.sourceProfile,
          },
        });
      }
      if (chunk.length >= 8 || index === request.targets.length - 1) {
        respond({
          type: "prospectChunk",
          requestId: request.requestId,
          results: chunk.splice(0),
        });
        respond({
          type: "progress",
          requestId: request.requestId,
          phase: "prospect",
          completed: index + 1,
          total: request.targets.length,
        });
        await yieldToMessageQueue();
      }
    }
    if (wasCancelled(request.requestId, "prospect")) return;
    respond({ type: "prospectComplete", requestId: request.requestId });
  } catch {
    error(request.requestId, "prospect", "INVALID_WORKER_REQUEST");
  } finally {
    activeLazyRequests.delete(request.requestId);
  }
};

const handlePotential = async (
  request: Extract<ScoringWorkerRequest, { type: "potential" }>
) => {
  const safeRequestId = scoringRequestIdOrUnknown(request.requestId);
  if (
    !hasValidLazyRequestIdentity(request, "potential") ||
    !validTargets(request.targets) ||
    !validPotentialFinishTarget(request.finishTarget)
  ) {
    error(safeRequestId, "potential", "INVALID_WORKER_REQUEST");
    return;
  }
  if (!snapshotMatches(request)) {
    error(request.requestId, "potential", "STALE_SCORING_SNAPSHOT");
    return;
  }
  activeLazyRequests.add(request.requestId);
  const computation = new CooperativeComputation({
    maxSliceMs: 8,
    shouldCancel: () => cancelled.has(request.requestId),
    yieldControl: yieldToMessageQueue,
  });
  const chunk: PotentialDelta[] = [];
  try {
    for (let index = 0; index < request.targets.length; index += 1) {
      if (wasCancelled(request.requestId, "potential")) return;
      if (!snapshotMatches(request)) {
        error(request.requestId, "potential", "STALE_SCORING_SNAPSHOT");
        return;
      }
      const pair = request.targets[index];
      const state = pairState(pair);
      if (state.status !== "ok") {
        chunk.push({ pair, status: state.status, issues: state.issues });
      } else {
        const potential = await calculateArtifactPotentialCooperatively(
          state.artifact,
          state.profile,
          computation
        );
        if (!potential) {
          wasCancelled(request.requestId, "potential");
          return;
        }
        let finishChance: FinishChanceResult;
        if (request.finishTarget.kind === "none") {
          finishChance = { kind: "none" };
        } else if (request.finishTarget.kind === "conservative-top-ten") {
          const finished = await getPopulation(
            state.profile,
            state.artifact.position,
            20,
            request.finishTarget.sourceProfile,
            computation
          );
          if (!finished) {
            wasCancelled(request.requestId, "potential");
            return;
          }
          finishChance = {
            kind: "conservative-top-ten",
            result: calculateConservativeTopTenFinish(potential.pmf, finished),
          };
        } else {
          finishChance = {
            kind: "absolute-match",
            targetFinalMatch: rationalToNumber(request.finishTarget.target),
            probability: probabilityAtLeast(
              potential.pmf,
              request.finishTarget.target
            ),
          };
        }
        chunk.push({
          pair,
          status: "ok",
          result: {
            expectedFinalMatch: potential.expectedFinalMatch,
            p10FinalMatch: potential.p10FinalMatch,
            medianFinalMatch: potential.medianFinalMatch,
            p90FinalMatch: potential.p90FinalMatch,
            bestReachableFinalMatch: potential.bestReachableFinalMatch,
          },
          finishChance,
        });
      }
      if (chunk.length >= 4 || index === request.targets.length - 1) {
        respond({
          type: "potentialChunk",
          requestId: request.requestId,
          results: chunk.splice(0),
        });
        respond({
          type: "progress",
          requestId: request.requestId,
          phase: "potential",
          completed: index + 1,
          total: request.targets.length,
        });
        await yieldToMessageQueue();
      }
    }
    if (wasCancelled(request.requestId, "potential")) return;
    respond({ type: "potentialComplete", requestId: request.requestId });
  } catch {
    error(request.requestId, "potential", "INVALID_WORKER_REQUEST");
  } finally {
    activeLazyRequests.delete(request.requestId);
  }
};

const handleSummary = async (
  request: Extract<ScoringWorkerRequest, { type: "summary" }>
) => {
  if (
    typeof request.requestId !== "string" ||
    request.requestId.length === 0 ||
    typeof request.datasetId !== "string" ||
    request.datasetId.length === 0 ||
    !Array.isArray(request.artifacts) ||
    !Array.isArray(request.builds)
  ) {
    error(
      scoringRequestIdOrUnknown(request.requestId),
      "summary",
      "INVALID_WORKER_REQUEST"
    );
    return;
  }

  if (activeSummaryRequest && activeSummaryRequest !== request.requestId) {
    cancelled.add(activeSummaryRequest);
  }
  activeLazyRequests.forEach((requestId) => cancelled.add(requestId));
  activeSummaryRequest = request.requestId;

  try {
    let lastProgress = 0;
    const snapshot = await evaluateArtifactBatchCooperatively(
      request.datasetId,
      request.artifacts,
      request.builds,
      {
        maxSliceMs: 8,
        shouldCancel: () => cancelled.has(request.requestId),
        yieldControl: yieldToMessageQueue,
        onProgress: (completed, total) => {
          if (completed === total || completed - lastProgress >= 16) {
            lastProgress = completed;
            respond({
              type: "progress",
              requestId: request.requestId,
              phase: "summary",
              completed,
              total,
            });
          }
        },
      }
    );
    const requestWasCancelled = cancelled.delete(request.requestId);
    if (!snapshot || requestWasCancelled) {
      respond({
        type: "cancelled",
        requestId: request.requestId,
        phase: "summary",
      });
      return;
    }
    if (activeSummaryRequest !== request.requestId) return;

    retainedSnapshot = snapshot;
    respond(
      {
        type: "summaryComplete",
        requestId: request.requestId,
        batch: snapshot.batch,
        summaryKey: snapshot.summaryKey,
        issues: snapshot.issues,
      },
      artifactBatchTransferList(snapshot.batch)
    );
  } catch {
    error(request.requestId, "summary", "INVALID_WORKER_REQUEST");
  } finally {
    if (activeSummaryRequest === request.requestId) {
      activeSummaryRequest = undefined;
    }
  }
};

scope.onmessage = (event: MessageEvent<ScoringWorkerRequest>) => {
  const request = event.data;
  if (
    !request ||
    typeof request !== "object" ||
    typeof request.type !== "string"
  ) {
    error("unknown", "summary", "INVALID_WORKER_REQUEST");
    return;
  }
  if (request.type === "cancel") {
    if (typeof request.requestId === "string" && request.requestId.length > 0) {
      if (
        activeSummaryRequest === request.requestId ||
        activeLazyRequests.has(request.requestId)
      ) {
        cancelled.add(request.requestId);
      }
    } else {
      error("unknown", "summary", "INVALID_WORKER_REQUEST");
    }
    return;
  }
  if (request.type === "summary") {
    void handleSummary(request);
    return;
  }
  if (
    request.type === "setEligibility" ||
    request.type === "prospect" ||
    request.type === "potential"
  ) {
    if (request.type === "setEligibility") void handleSetEligibility(request);
    else if (request.type === "prospect") void handleProspect(request);
    else void handlePotential(request);
    return;
  }
  error("unknown", "summary", "INVALID_WORKER_REQUEST");
};

export {};
