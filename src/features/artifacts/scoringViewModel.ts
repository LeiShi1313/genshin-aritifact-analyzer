import type { ArtifactScoreSort, ArtifactScoringQuery } from "./scoringQuery";

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

export type ProspectState =
  | { readonly status: "idle" | "pending" }
  | { readonly status: "ready"; readonly percentile: number }
  | { readonly status: "error" | "unavailable" };

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

export type SelectionDecision = "selected" | "unselected" | "pending";

export type ArtifactExportEvaluationStatus =
  | "pending-summary"
  | "pending-prospect"
  | "unavailable"
  | "ready";

export const isArtifactExportReady = (
  format: string | undefined,
  evaluationStatus: ArtifactExportEvaluationStatus
): boolean => format === "GOOD" && evaluationStatus === "ready";

export const scoreSelectionDecision = (
  summary: ArtifactScoreSummary,
  query: Pick<ArtifactScoringQuery, "match" | "prospectEnabled" | "prospect">,
  prospect: ProspectState
): SelectionDecision => {
  if (summary.status !== "ok" || summary.bestCurrent.match < query.match) {
    return "unselected";
  }
  if (!query.prospectEnabled) return "selected";
  if (prospect.status === "idle" || prospect.status === "pending") {
    return "pending";
  }
  if (prospect.status !== "ready") return "unselected";
  return prospect.percentile >= query.prospect ? "selected" : "unselected";
};

const sortValue = (
  summary: ArtifactScoreSummary,
  prospect: ProspectState,
  sort: ArtifactScoreSort
): number => {
  if (summary.status !== "ok") return Number.NEGATIVE_INFINITY;
  if (sort.startsWith("currentMatch")) return summary.bestCurrent.match;
  if (sort.startsWith("expectedFinalMatch")) {
    return summary.bestExpected.expectedFinalMatch;
  }
  return prospect.status === "ready"
    ? prospect.percentile
    : Number.NEGATIVE_INFINITY;
};

export const compareArtifactScores = (
  left: ArtifactScoreSummary,
  right: ArtifactScoreSummary,
  leftProspect: ProspectState,
  rightProspect: ProspectState,
  sort: ArtifactScoreSort
): number => {
  const leftValue = sortValue(left, leftProspect, sort);
  const rightValue = sortValue(right, rightProspect, sort);
  const direction = sort.endsWith("-asc") ? 1 : -1;
  const delta = (leftValue - rightValue) * direction;
  return Math.abs(delta) > SCORE_EPSILON
    ? delta
    : left.artifactIndex - right.artifactIndex;
};
