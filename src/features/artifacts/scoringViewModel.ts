import type { ArtifactScoreSort, ArtifactScoringQuery } from "./scoringQuery";
import { toPublicArtifactScore } from "./scorePresentation";

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
  readonly match: Float64Array;
  readonly expectedFinalMatch: Float64Array;
  readonly isPreferredMain: Uint8Array;
  readonly pairIssueFlags: Uint32Array;
}

export interface BoundBuildScore {
  readonly buildId: string;
  readonly buildIndex: number;
  readonly match: number;
  readonly expectedFinalMatch: number;
  readonly isPreferredMain: boolean;
}

export type ArtifactScoreSummary =
  | {
      readonly status: "ok";
      readonly artifactIndex: number;
      readonly bestCurrent: BoundBuildScore;
      readonly bestExpected: BoundBuildScore;
      readonly perBuild: readonly BoundBuildScore[];
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

export const selectArtifactScoreSummary = (
  batch: ScoreBatchView,
  artifactIndex: number
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
    });
  }

  if (perBuild.length === 0) {
    return {
      status: "unavailable",
      artifactIndex,
      issueFlags: batch.artifactIssueFlags[artifactIndex] ?? 0,
    };
  }

  let bestCurrent = perBuild[0];
  let bestExpected = perBuild[0];
  for (const score of perBuild.slice(1)) {
    if (greater(score.match, bestCurrent.match)) bestCurrent = score;
    if (
      greater(score.expectedFinalMatch, bestExpected.expectedFinalMatch) ||
      (equal(score.expectedFinalMatch, bestExpected.expectedFinalMatch) &&
        greater(score.match, bestExpected.match))
    ) {
      bestExpected = score;
    }
  }

  return {
    status: "ok",
    artifactIndex,
    bestCurrent,
    bestExpected,
    perBuild,
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
  level: number
): ArtifactScorePresentation | undefined => {
  if (summary.status !== "ok") return undefined;

  const finished = level >= 20;
  const bound = finished ? summary.bestCurrent : summary.bestExpected;
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
  const presentation = presentArtifactScore(summary, level);
  if (!presentation?.primary.isPreferredMain) return "unselected";
  const minimum = level >= 20 ? query.minScore : query.minPotential;
  return presentation.primary.score >= minimum ? "selected" : "unselected";
};

const sortValue = (
  summary: ArtifactScoreSummary,
  level: number
): number | undefined => presentArtifactScore(summary, level)?.primary.score;

export const compareArtifactScores = (
  left: ArtifactScoreSummary,
  right: ArtifactScoreSummary,
  leftLevel: number,
  rightLevel: number,
  sort: ArtifactScoreSort
): number => {
  const leftValue = sortValue(left, leftLevel);
  const rightValue = sortValue(right, rightLevel);
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
