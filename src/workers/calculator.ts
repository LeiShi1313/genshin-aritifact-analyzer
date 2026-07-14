/// <reference lib="webworker" />

import {
  artifactBatchTransferList,
  ByteBudgetLruCache,
  calculateArtifactPotentialCooperatively,
  calculateConservativeTopTenFinish,
  CooperativeComputation,
  createPopulationCacheKey,
  evaluateProspect,
  evaluateArtifactBatchCooperatively,
  estimateScoreDistributionBytes,
  expectedFinalQualityRational,
  generateNormalFiveStarPopulationCooperatively,
  probabilityAtLeast,
  rationalToNumber,
  type ArtifactScoringSnapshot,
  type BuildScoringProfile,
  type CanonicalArtifactState,
  type DiscreteScoreDistribution,
} from "../utils/artifactScoring";
import type {
  PairRef,
  FinishChanceResult,
  NormalSourceFiveStarProfile,
  PotentialDelta,
  ProspectDelta,
  ScoringPhase,
  ScoringWorkerRequest,
  ScoringWorkerResponse,
} from "./artifactScoringProtocol";
import {
  hasValidLazyRequestIdentity,
  scoringRequestIdOrUnknown,
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
  request: Extract<ScoringWorkerRequest, { type: "prospect" | "potential" }>
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
  if (request.type === "prospect" || request.type === "potential") {
    if (request.type === "prospect") void handleProspect(request);
    else void handlePotential(request);
    return;
  }
  error("unknown", "summary", "INVALID_WORKER_REQUEST");
};

export {};
