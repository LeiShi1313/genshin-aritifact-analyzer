import type { ArtifactScoreSort, ArtifactScoringQuery } from "./scoringQuery";
import {
  PUBLIC_SCORE_DEFAULTS,
  toPublicArtifactScore,
} from "../../utils/artifactScoring/publicScore";
import { SET_COMPATIBILITY } from "../../utils/artifactScoring/setEligibility";
import {
  SET_ELIGIBILITY_GATE_STATUS,
  setEligibilityGateIndex,
  type SetEligibilityPolicyBatch,
} from "../../workers/artifactScoringProtocol";

export const BATCH_ENTITY_STATUS = {
  OK: 0,
  UNSUPPORTED: 1,
  INVALID: 2,
} as const;

export interface ScoreBatchView {
  readonly buildIds: readonly string[];
  readonly artifactCount: number;
  readonly buildCount: number;
  readonly artifactStatus: Uint8Array;
  readonly artifactIssueFlags: Uint32Array;
  readonly buildStatus: Uint8Array;
  readonly buildIssueFlags: Uint32Array;
  readonly buildSetPlan: Uint8Array;
  readonly match: Float64Array;
  readonly expectedFinalMatch: Float64Array;
  readonly isPreferredMain: Uint8Array;
  readonly setCompatibility: Uint8Array;
  readonly pairIssueFlags: Uint32Array;
}

export interface BoundBuildScore {
  readonly buildId: string;
  readonly buildIndex: number;
  readonly match: number;
  readonly expectedFinalMatch: number;
  readonly isPreferredMain: boolean;
  readonly currentRecommendation: BuildScoreRecommendation;
  readonly expectedRecommendation: BuildScoreRecommendation;
}

export type ArtifactSetRole =
  | "neutral"
  | "set-match"
  | "off-piece-candidate"
  | "set-mismatch";

export type RecommendationStatus = "ready" | "pending" | "unavailable";

export interface BuildScoreRecommendation {
  readonly status: RecommendationStatus;
  readonly recommended: boolean;
  readonly role: ArtifactSetRole;
  readonly requiredScore?: number;
  readonly expectedFiveStarDrops?: number;
  readonly failure: "none" | "main-stat" | "score" | "set" | "pending";
}

export type SetEligibilityView =
  | {
      readonly status: "ready";
      readonly policy: SetEligibilityPolicyBatch;
    }
  | { readonly status: "pending" | "unavailable" };

export interface ArtifactRecommendationContext {
  readonly position: number;
  readonly setEligibility: SetEligibilityView;
}

export type ArtifactScoreSummary =
  | {
      readonly status: "ok";
      readonly artifactIndex: number;
      readonly bestCurrent: BoundBuildScore;
      readonly bestExpected: BoundBuildScore;
      readonly perBuild: readonly BoundBuildScore[];
      readonly recommendationStatus: RecommendationStatus;
    }
  | {
      readonly status: "unsupported" | "invalid" | "unavailable";
      readonly artifactIndex: number;
      readonly issueFlags: number;
    };

const SCORE_EPSILON = 1e-12;

const greater = (left: number, right: number): boolean =>
  left - right > SCORE_EPSILON;

const equal = (left: number, right: number): boolean =>
  Math.abs(left - right) <= SCORE_EPSILON;

const finiteExpectedDrops = (value: number): number | undefined =>
  Number.isFinite(value) && value > 0 ? value : undefined;

const recommendationFor = ({
  score,
  baseScore,
  isPreferredMain,
  compatibility,
  buildIndex,
  referenceMilestone,
  context,
}: {
  readonly score: number;
  readonly baseScore: number;
  readonly isPreferredMain: boolean;
  readonly compatibility: number;
  readonly buildIndex: number;
  readonly referenceMilestone: 0 | 20;
  readonly context?: ArtifactRecommendationContext;
}): BuildScoreRecommendation => {
  const ordinaryFailure = !isPreferredMain
    ? "main-stat"
    : score < baseScore
    ? "score"
    : "none";

  if (compatibility === SET_COMPATIBILITY.NEUTRAL) {
    return {
      status: "ready",
      recommended: ordinaryFailure === "none",
      role: "neutral",
      requiredScore: baseScore,
      failure: ordinaryFailure,
    };
  }

  let gateStatus: number | undefined;
  let offPieceCutoff: number | undefined;
  let expectedDrops: number | undefined;
  if (
    context?.setEligibility.status === "ready" &&
    context.setEligibility.policy.buildCount > buildIndex
  ) {
    try {
      const gateIndex = setEligibilityGateIndex(
        buildIndex,
        referenceMilestone,
        context.position
      );
      gateStatus = context.setEligibility.policy.gateStatus[gateIndex];
      if (gateStatus === SET_ELIGIBILITY_GATE_STATUS.AVAILABLE) {
        offPieceCutoff =
          context.setEligibility.policy.offPieceCutoff[gateIndex];
      }
      expectedDrops = finiteExpectedDrops(
        context.setEligibility.policy.expectedFiveStarDrops[gateIndex]
      );
    } catch {
      gateStatus = undefined;
    }
  }

  if (compatibility === SET_COMPATIBILITY.MATCH) {
    return {
      status: "ready",
      recommended: ordinaryFailure === "none",
      role: "set-match",
      requiredScore: baseScore,
      ...(expectedDrops === undefined
        ? {}
        : { expectedFiveStarDrops: expectedDrops }),
      failure: ordinaryFailure,
    };
  }

  if (context?.setEligibility.status !== "ready") {
    const status = context?.setEligibility.status ?? "pending";
    return {
      status,
      recommended: false,
      role: "set-mismatch",
      failure: status === "pending" ? "pending" : "set",
    };
  }

  const setPass =
    gateStatus === SET_ELIGIBILITY_GATE_STATUS.AVAILABLE &&
    offPieceCutoff !== undefined &&
    score >= offPieceCutoff;
  const failure =
    ordinaryFailure !== "none" ? ordinaryFailure : setPass ? "none" : "set";
  return {
    status: "ready",
    recommended: failure === "none",
    role: setPass ? "off-piece-candidate" : "set-mismatch",
    ...(offPieceCutoff === undefined ? {} : { requiredScore: offPieceCutoff }),
    ...(expectedDrops === undefined
      ? {}
      : { expectedFiveStarDrops: expectedDrops }),
    failure,
  };
};

const rawBestCurrent = (scores: readonly BoundBuildScore[]): BoundBuildScore =>
  scores
    .slice(1)
    .reduce(
      (best, score) => (greater(score.match, best.match) ? score : best),
      scores[0]
    );

const rawBestExpected = (scores: readonly BoundBuildScore[]): BoundBuildScore =>
  scores
    .slice(1)
    .reduce(
      (best, score) =>
        greater(score.expectedFinalMatch, best.expectedFinalMatch) ||
        (equal(score.expectedFinalMatch, best.expectedFinalMatch) &&
          greater(score.match, best.match))
          ? score
          : best,
      scores[0]
    );

const bestRecommended = (
  scores: readonly BoundBuildScore[],
  kind: "current" | "expected"
): BoundBuildScore | undefined => {
  const recommendationKey =
    kind === "current" ? "currentRecommendation" : "expectedRecommendation";
  const eligible = scores.filter(
    (score) => score[recommendationKey].recommended
  );
  if (eligible.length === 0) return undefined;
  return kind === "current"
    ? rawBestCurrent(eligible)
    : rawBestExpected(eligible);
};

export const selectArtifactScoreSummary = (
  batch: ScoreBatchView,
  artifactIndex: number,
  context?: ArtifactRecommendationContext
): ArtifactScoreSummary => {
  const entityStatus = batch.artifactStatus[artifactIndex];
  if (entityStatus !== BATCH_ENTITY_STATUS.OK) {
    return {
      status:
        entityStatus === BATCH_ENTITY_STATUS.UNSUPPORTED
          ? "unsupported"
          : "invalid",
      artifactIndex,
      issueFlags: batch.artifactIssueFlags[artifactIndex] ?? 0,
    };
  }

  const perBuild: BoundBuildScore[] = [];
  for (let buildIndex = 0; buildIndex < batch.buildCount; buildIndex += 1) {
    if (batch.buildStatus[buildIndex] !== BATCH_ENTITY_STATUS.OK) continue;
    const pairIndex = artifactIndex * batch.buildCount + buildIndex;
    const match = batch.match[pairIndex];
    const expectedFinalMatch = batch.expectedFinalMatch[pairIndex];
    if (!Number.isFinite(match) || !Number.isFinite(expectedFinalMatch))
      continue;
    perBuild.push({
      buildId: batch.buildIds[buildIndex],
      buildIndex,
      match,
      expectedFinalMatch,
      isPreferredMain: batch.isPreferredMain[pairIndex] === 1,
      currentRecommendation: recommendationFor({
        score: toPublicArtifactScore(match) ?? 0,
        baseScore: PUBLIC_SCORE_DEFAULTS.minScore,
        isPreferredMain: batch.isPreferredMain[pairIndex] === 1,
        compatibility: batch.setCompatibility[pairIndex],
        buildIndex,
        referenceMilestone: 20,
        context,
      }),
      expectedRecommendation: recommendationFor({
        score: toPublicArtifactScore(expectedFinalMatch) ?? 0,
        baseScore: PUBLIC_SCORE_DEFAULTS.minPotential,
        isPreferredMain: batch.isPreferredMain[pairIndex] === 1,
        compatibility: batch.setCompatibility[pairIndex],
        buildIndex,
        referenceMilestone: 0,
        context,
      }),
    });
  }

  if (perBuild.length === 0) {
    return {
      status: "unavailable",
      artifactIndex,
      issueFlags: batch.artifactIssueFlags[artifactIndex] ?? 0,
    };
  }

  const recommendationStatuses = perBuild.flatMap((score) => [
    score.currentRecommendation.status,
    score.expectedRecommendation.status,
  ]);
  const recommendationStatus: RecommendationStatus =
    recommendationStatuses.includes("unavailable")
      ? "unavailable"
      : recommendationStatuses.includes("pending")
      ? "pending"
      : "ready";
  const bestCurrent =
    recommendationStatus === "ready"
      ? bestRecommended(perBuild, "current") ?? rawBestCurrent(perBuild)
      : rawBestCurrent(perBuild);
  const bestExpected =
    recommendationStatus === "ready"
      ? bestRecommended(perBuild, "expected") ?? rawBestExpected(perBuild)
      : rawBestExpected(perBuild);

  return {
    status: "ok",
    artifactIndex,
    bestCurrent,
    bestExpected,
    perBuild,
    recommendationStatus,
  };
};

export interface ArtifactScorePresentation {
  readonly primary: {
    readonly kind: "potential" | "score";
    readonly score: number;
    readonly rawValue: number;
    readonly buildId: string;
    readonly buildIndex: number;
    readonly isPreferredMain: boolean;
    readonly recommendation: BuildScoreRecommendation;
  };
  readonly secondary?: {
    readonly kind: "current";
    readonly score: number;
    readonly rawValue: number;
    readonly buildId: string;
    readonly buildIndex: number;
  };
}

export const presentArtifactScore = (
  summary: ArtifactScoreSummary,
  level: number,
  minimum?: number
): ArtifactScorePresentation | undefined => {
  if (summary.status !== "ok") return undefined;

  const finished = level >= 20;
  const queryBest =
    minimum === undefined
      ? undefined
      : bestBuildMeetingMinimum(summary, level, minimum);
  const bound =
    minimum === undefined
      ? finished
        ? summary.bestCurrent
        : summary.bestExpected
      : queryBest ??
        (finished
          ? rawBestCurrent(summary.perBuild)
          : rawBestExpected(summary.perBuild));
  const rawValue = finished ? bound.match : bound.expectedFinalMatch;
  const score = toPublicArtifactScore(rawValue);
  if (score === undefined) return undefined;

  const secondaryScore = finished
    ? undefined
    : toPublicArtifactScore(bound.match);
  return {
    primary: {
      kind: finished ? "score" : "potential",
      score,
      rawValue,
      buildId: bound.buildId,
      buildIndex: bound.buildIndex,
      isPreferredMain: bound.isPreferredMain,
      recommendation: finished
        ? bound.currentRecommendation
        : bound.expectedRecommendation,
    },
    ...(secondaryScore === undefined
      ? {}
      : {
          secondary: {
            kind: "current" as const,
            score: secondaryScore,
            rawValue: bound.match,
            buildId: bound.buildId,
            buildIndex: bound.buildIndex,
          },
        }),
  };
};

export type SelectionDecision = "selected" | "unselected";

export type ArtifactExportEvaluationStatus =
  | "pending-summary"
  | "pending-set-eligibility"
  | "unavailable"
  | "ready";

export const isArtifactExportReady = (
  format: string | undefined,
  evaluationStatus: ArtifactExportEvaluationStatus
): boolean => format === "GOOD" && evaluationStatus === "ready";

export const scoreSelectionDecision = (
  summary: ArtifactScoreSummary,
  level: number,
  query: Pick<ArtifactScoringQuery, "minPotential" | "minScore">
): SelectionDecision => {
  if (summary.status !== "ok" || summary.recommendationStatus !== "ready") {
    return "unselected";
  }
  const minimum = level >= 20 ? query.minScore : query.minPotential;
  return bestBuildMeetingMinimum(summary, level, minimum)
    ? "selected"
    : "unselected";
};

export const buildScoreMeetsMinimum = (
  score: BoundBuildScore,
  level: number,
  minimum: number
): boolean => {
  if (!score.isPreferredMain) return false;
  const finished = level >= 20;
  const recommendation = finished
    ? score.currentRecommendation
    : score.expectedRecommendation;
  if (recommendation.status !== "ready") return false;
  const publicScore = toPublicArtifactScore(
    finished ? score.match : score.expectedFinalMatch
  );
  if (publicScore === undefined) return false;
  if (
    recommendation.role === "neutral" ||
    recommendation.role === "set-match"
  ) {
    return publicScore >= minimum;
  }
  return (
    recommendation.requiredScore !== undefined &&
    publicScore >= Math.max(minimum, recommendation.requiredScore)
  );
};

const bestBuildMeetingMinimum = (
  summary: Extract<ArtifactScoreSummary, { status: "ok" }>,
  level: number,
  minimum: number
): BoundBuildScore | undefined => {
  if (summary.recommendationStatus !== "ready") return undefined;
  const eligible = summary.perBuild.filter((score) =>
    buildScoreMeetsMinimum(score, level, minimum)
  );
  if (eligible.length === 0) return undefined;
  return level >= 20 ? rawBestCurrent(eligible) : rawBestExpected(eligible);
};

export const matchingBuildScores = (
  summary: ArtifactScoreSummary,
  level: number,
  minimum: number
): readonly BoundBuildScore[] => {
  if (summary.status !== "ok" || summary.recommendationStatus !== "ready") {
    return [];
  }
  const finished = level >= 20;
  return summary.perBuild
    .filter((score) => buildScoreMeetsMinimum(score, level, minimum))
    .sort((left, right) => {
      const leftScore =
        toPublicArtifactScore(
          finished ? left.match : left.expectedFinalMatch
        ) ?? 0;
      const rightScore =
        toPublicArtifactScore(
          finished ? right.match : right.expectedFinalMatch
        ) ?? 0;
      return rightScore - leftScore || left.buildIndex - right.buildIndex;
    });
};

const sortValue = (
  summary: ArtifactScoreSummary,
  level: number,
  query?: Pick<ArtifactScoringQuery, "minPotential" | "minScore">
): number | undefined =>
  presentArtifactScore(
    summary,
    level,
    query === undefined
      ? undefined
      : level >= 20
      ? query.minScore
      : query.minPotential
  )?.primary.score;

export const compareArtifactScores = (
  left: ArtifactScoreSummary,
  right: ArtifactScoreSummary,
  leftLevel: number,
  rightLevel: number,
  sort: ArtifactScoreSort,
  query?: Pick<ArtifactScoringQuery, "minPotential" | "minScore">
): number => {
  const leftValue = sortValue(left, leftLevel, query);
  const rightValue = sortValue(right, rightLevel, query);
  if (leftValue === undefined || rightValue === undefined) {
    if (leftValue === rightValue) {
      return left.artifactIndex - right.artifactIndex;
    }
    return leftValue === undefined ? 1 : -1;
  }
  const direction = sort.endsWith("-asc") ? 1 : -1;
  const delta = (leftValue - rightValue) * direction;
  return Math.abs(delta) > SCORE_EPSILON
    ? delta
    : left.artifactIndex - right.artifactIndex;
};
