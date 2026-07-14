import {
  compareRationals,
  createRational,
  type ExactRational,
  rationalKey,
  rationalToNumber,
} from "./rational";
import { CooperativeComputation } from "./cooperative";

export const PROBABILITY_EPSILON = 1e-12;

export interface ScoreProbabilityAtom {
  readonly score: ExactRational;
  readonly probability: number;
}

export interface ScoreCdfPoint extends ScoreProbabilityAtom {
  readonly cumulativeProbability: number;
}

export interface DiscreteScoreDistribution {
  readonly atoms: readonly ScoreProbabilityAtom[];
  readonly totalProbability: number;
  probabilityOf(score: ExactRational): number;
}

export class CompensatedSum {
  private sum = 0;
  private correction = 0;

  add(value: number): void {
    const next = this.sum + value;
    if (Math.abs(this.sum) >= Math.abs(value)) {
      this.correction += this.sum - next + value;
    } else {
      this.correction += value - next + this.sum;
    }
    this.sum = next;
  }

  value(): number {
    return this.sum + this.correction;
  }
}

export const compensatedSum = (values: Iterable<number>): number => {
  const accumulator = new CompensatedSum();
  for (const value of values) accumulator.add(value);
  return accumulator.value();
};

const validateProbability = (probability: number): void => {
  if (!Number.isFinite(probability) || probability < 0) {
    throw new RangeError("Probability must be a finite nonnegative number");
  }
};

export const createScoreDistribution = (
  inputAtoms: Iterable<ScoreProbabilityAtom>
): DiscreteScoreDistribution => {
  const byScore = new Map<
    string,
    { score: ExactRational; probability: CompensatedSum }
  >();

  for (const atom of inputAtoms) {
    validateProbability(atom.probability);
    const score = createRational(atom.score.numerator, atom.score.denominator);
    const key = rationalKey(score);
    let entry = byScore.get(key);
    if (!entry) {
      entry = { score, probability: new CompensatedSum() };
      byScore.set(key, entry);
    }
    entry.probability.add(atom.probability);
  }

  const merged = [...byScore.values()]
    .map((entry) => ({
      score: entry.score,
      probability: entry.probability.value(),
    }))
    .filter((atom) => atom.probability > 0)
    .sort((left, right) => compareRationals(left.score, right.score));
  const measuredTotal = compensatedSum(merged.map((atom) => atom.probability));

  if (measuredTotal <= 0 || Math.abs(measuredTotal - 1) > PROBABILITY_EPSILON) {
    throw new RangeError(
      `Probability mass must total one within ${PROBABILITY_EPSILON}; received ${measuredTotal}`
    );
  }

  const atoms = merged.map((atom) =>
    Object.freeze({
      score: atom.score,
      probability: atom.probability / measuredTotal,
    })
  );
  const probabilityByScore = new Map(
    atoms.map((atom) => [rationalKey(atom.score), atom.probability])
  );

  return Object.freeze({
    atoms: Object.freeze(atoms),
    totalProbability: compensatedSum(atoms.map((atom) => atom.probability)),
    probabilityOf: (score: ExactRational) =>
      probabilityByScore.get(rationalKey(score)) ?? 0,
  });
};

export const createScoreDistributionCooperatively = async (
  inputAtoms: Iterable<ScoreProbabilityAtom>,
  computation: CooperativeComputation
): Promise<DiscreteScoreDistribution | undefined> => {
  const byScore = new Map<
    string,
    { score: ExactRational; probability: CompensatedSum }
  >();

  for (const atom of inputAtoms) {
    validateProbability(atom.probability);
    const score = createRational(atom.score.numerator, atom.score.denominator);
    const key = rationalKey(score);
    let entry = byScore.get(key);
    if (!entry) {
      entry = { score, probability: new CompensatedSum() };
      byScore.set(key, entry);
    }
    entry.probability.add(atom.probability);
    if (computation.cancelled) return undefined;
    if (computation.isYieldDue(64) && !(await computation.yield())) {
      return undefined;
    }
  }

  const merged: ScoreProbabilityAtom[] = [];
  for (const entry of byScore.values()) {
    const probability = entry.probability.value();
    if (probability > 0) {
      merged.push({ score: entry.score, probability });
    }
    if (computation.cancelled) return undefined;
    if (computation.isYieldDue(64) && !(await computation.yield())) {
      return undefined;
    }
  }
  merged.sort((left, right) => compareRationals(left.score, right.score));
  const measuredTotal = compensatedSum(merged.map((atom) => atom.probability));

  if (measuredTotal <= 0 || Math.abs(measuredTotal - 1) > PROBABILITY_EPSILON) {
    throw new RangeError(
      `Probability mass must total one within ${PROBABILITY_EPSILON}; received ${measuredTotal}`
    );
  }

  const atoms: ScoreProbabilityAtom[] = [];
  const probabilityByScore = new Map<string, number>();
  for (const atom of merged) {
    const normalized = Object.freeze({
      score: atom.score,
      probability: atom.probability / measuredTotal,
    });
    atoms.push(normalized);
    probabilityByScore.set(
      rationalKey(normalized.score),
      normalized.probability
    );
    if (computation.cancelled) return undefined;
    if (computation.isYieldDue(64) && !(await computation.yield())) {
      return undefined;
    }
  }

  return Object.freeze({
    atoms: Object.freeze(atoms),
    totalProbability: compensatedSum(atoms.map((atom) => atom.probability)),
    probabilityOf: (score: ExactRational) =>
      probabilityByScore.get(rationalKey(score)) ?? 0,
  });
};

export const buildScoreCdf = (
  distribution: DiscreteScoreDistribution
): readonly ScoreCdfPoint[] => {
  const cumulative = new CompensatedSum();
  return Object.freeze(
    distribution.atoms.map((atom) => {
      cumulative.add(atom.probability);
      return Object.freeze({
        ...atom,
        cumulativeProbability: Math.min(1, cumulative.value()),
      });
    })
  );
};

export const quantileScore = (
  distribution: DiscreteScoreDistribution,
  probability: number
): ExactRational => {
  if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
    throw new RangeError("Quantile probability must be in [0, 1]");
  }
  if (distribution.atoms.length === 0) {
    throw new RangeError("Cannot take a quantile of an empty distribution");
  }

  const cdf = buildScoreCdf(distribution);
  return (
    cdf.find(
      (point) =>
        point.cumulativeProbability > probability ||
        Math.abs(point.cumulativeProbability - probability) <=
          PROBABILITY_EPSILON
    ) ?? cdf[cdf.length - 1]
  ).score;
};

export const expectedScore = (
  distribution: DiscreteScoreDistribution
): number =>
  compensatedSum(
    distribution.atoms.map(
      (atom) => rationalToNumber(atom.score) * atom.probability
    )
  );

export const inclusiveTailProbability = (
  distribution: DiscreteScoreDistribution,
  threshold: ExactRational
): number =>
  compensatedSum(
    distribution.atoms
      .filter((atom) => compareRationals(atom.score, threshold) >= 0)
      .map((atom) => atom.probability)
  );

/** Conservative accounting for the atom array, rational objects and lookup Map. */
export const estimateScoreDistributionBytes = (
  distribution: DiscreteScoreDistribution
): number =>
  1024 +
  distribution.atoms.reduce(
    (total, atom) =>
      total +
      512 +
      4 *
        (atom.score.numerator.toString().length +
          atom.score.denominator.toString().length),
    0
  );
