export const PUBLIC_SCORE_DEFAULTS = Object.freeze({
  minPotential: 75,
  minScore: 80,
});

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

export const toPublicArtifactScore = (value: number): number | undefined => {
  if (!Number.isFinite(value) || value < 0 || value > 1) return undefined;
  if (value === 1) return 100;
  return Math.min(99, Math.floor(value * 100 + Number.EPSILON));
};

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

export const getArtifactScoreAction = ({
  level,
  score,
  isPreferredMain,
}: {
  readonly level: number;
  readonly score: number;
  readonly isPreferredMain: boolean;
}): ArtifactScoreAction => {
  if (!isPreferredMain) {
    return { id: "main-stat-mismatch", recommended: false };
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
