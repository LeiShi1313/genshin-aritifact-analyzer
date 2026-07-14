import {
  PUBLIC_SCORE_DEFAULTS,
  toPublicArtifactScore,
} from "../../utils/artifactScoring/publicScore";

export { PUBLIC_SCORE_DEFAULTS, toPublicArtifactScore };

export type ArtifactScoreBandId =
  | "ordinary"
  | "good"
  | "excellent"
  | "exceptional"
  | "perfect";

export type ArtifactScoreTone = "neutral" | "info" | "success" | "accent";

export interface ArtifactScoreBand {
  readonly id: ArtifactScoreBandId;
  readonly tone: ArtifactScoreTone;
  readonly emphasis: "normal" | "strong" | "maximum";
}

export type ArtifactScoreActionId =
  | "main-stat-mismatch"
  | "calculating-recommendation"
  | "low-potential"
  | "try-upgrading"
  | "worth-upgrading"
  | "high-priority"
  | "below-recommendation"
  | "good"
  | "worth-keeping"
  | "exceptional"
  | "perfect";

export interface ArtifactScoreAction {
  readonly id: ArtifactScoreActionId;
  readonly recommended: boolean;
}

export const getArtifactScoreBand = (score: number): ArtifactScoreBand => {
  if (score === 100) {
    return { id: "perfect", tone: "accent", emphasis: "maximum" };
  }
  if (score >= 90) {
    return { id: "exceptional", tone: "accent", emphasis: "strong" };
  }
  if (score >= 80) {
    return { id: "excellent", tone: "success", emphasis: "strong" };
  }
  if (score >= 70) {
    return { id: "good", tone: "info", emphasis: "normal" };
  }
  return { id: "ordinary", tone: "neutral", emphasis: "normal" };
};

export const roundExpectedFiveStarDrops = (
  value: number
): number | undefined => {
  if (!Number.isFinite(value) || value <= 0) return undefined;
  const digits = Math.floor(Math.log10(value)) + 1;
  const factor = 10 ** Math.max(0, digits - 2);
  return Math.round(value / factor) * factor;
};

export const getArtifactScoreAction = ({
  level,
  score,
  isPreferredMain,
  recommendation,
}: {
  readonly level: number;
  readonly score: number;
  readonly isPreferredMain: boolean;
  readonly recommendation?: {
    readonly status: "ready" | "pending" | "unavailable";
    readonly failure: "none" | "main-stat" | "score" | "set" | "pending";
  };
}): ArtifactScoreAction => {
  if (!isPreferredMain) {
    return { id: "main-stat-mismatch", recommended: false };
  }
  if (recommendation?.status === "pending") {
    return { id: "calculating-recommendation", recommended: false };
  }
  if (
    recommendation?.status === "unavailable" ||
    recommendation?.failure === "set"
  ) {
    return { id: "below-recommendation", recommended: false };
  }
  if (score === 100) return { id: "perfect", recommended: true };
  if (score >= 90) return { id: "exceptional", recommended: true };

  if (level < 20) {
    if (score >= 80) return { id: "high-priority", recommended: true };
    if (score >= PUBLIC_SCORE_DEFAULTS.minPotential) {
      return { id: "worth-upgrading", recommended: true };
    }
    if (score >= 70) return { id: "try-upgrading", recommended: false };
    return { id: "low-potential", recommended: false };
  }

  if (score >= PUBLIC_SCORE_DEFAULTS.minScore) {
    return { id: "worth-keeping", recommended: true };
  }
  if (score >= 70) return { id: "good", recommended: false };
  return { id: "below-recommendation", recommended: false };
};
