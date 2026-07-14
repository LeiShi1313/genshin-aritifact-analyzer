import { createRational, type ExactRational } from "./rational";

export const PUBLIC_SCORE_DEFAULTS = Object.freeze({
  minPotential: 75,
  minScore: 80,
});

export const toPublicArtifactScore = (value: number): number | undefined => {
  if (!Number.isFinite(value) || value < 0 || value > 1) return undefined;
  if (value === 1) return 100;
  const scaled = value * 100;
  const nearestInteger = Math.round(scaled);
  const magnitude = Math.max(1, Math.abs(scaled));
  const roundingTolerance = Math.max(
    4 * Number.EPSILON * magnitude,
    2 ** -23 * magnitude
  );
  const stableScaled =
    Math.abs(scaled - nearestInteger) <= roundingTolerance
      ? nearestInteger
      : scaled;
  return Math.min(99, Math.floor(stableScaled));
};

export const toPublicArtifactScoreExact = (
  value: ExactRational
): number | undefined => {
  const normalized = createRational(value.numerator, value.denominator);
  if (
    normalized.numerator < 0n ||
    normalized.numerator > normalized.denominator
  ) {
    return undefined;
  }
  if (normalized.numerator === normalized.denominator) return 100;
  return Number((100n * normalized.numerator) / normalized.denominator);
};
