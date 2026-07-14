import {
  createRational,
  rationalToNumber,
  type ExactRational,
} from "./rational";
import {
  buildScoreCdf,
  CompensatedSum,
  compensatedSum,
  createScoreDistribution,
  expectedScore,
  inclusiveTailProbability,
  PROBABILITY_EPSILON,
  quantileScore,
  type DiscreteScoreDistribution,
  type ScoreCdfPoint,
} from "./probabilityTypes";
import { createScoreDistributionCooperatively } from "./probabilityTypes";
import {
  CooperativeComputation,
  type CooperativeComputationOptions,
  useCooperativeComputation,
} from "./cooperative";

const TIER_POINTS = [7, 8, 9, 10] as const;

export interface PotentialLineInput {
  readonly importance: number;
  readonly rollValuePoints: number;
}

export interface RevealImportanceOption {
  readonly importance: number;
  readonly probability: number;
}

export interface PotentialInput {
  readonly lines: readonly PotentialLineInput[];
  readonly revealOptions?: readonly RevealImportanceOption[];
  readonly remainingUpgradeEvents: number;
  readonly preferredMain: boolean;
  readonly denominatorImportance: number;
  /** Population metadata only. Conditional Potential deliberately ignores it. */
  readonly fourLineStartProbability?: number;
}

export interface PotentialCalculation {
  readonly pmf: DiscreteScoreDistribution;
  readonly cdf: readonly ScoreCdfPoint[];
  readonly expectedFinalMatch: number;
  readonly p10FinalMatch: number;
  readonly medianFinalMatch: number;
  readonly p90FinalMatch: number;
  readonly bestReachableFinalMatch: number;
}

const assertNonnegativeSafeInteger = (value: number, name: string): void => {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a nonnegative safe integer`);
  }
};

const validateInput = (input: PotentialInput): void => {
  if (input.lines.length !== 3 && input.lines.length !== 4) {
    throw new RangeError("Potential requires three or four known lines");
  }
  assertNonnegativeSafeInteger(
    input.remainingUpgradeEvents,
    "remainingUpgradeEvents"
  );
  if (
    !Number.isSafeInteger(input.denominatorImportance) ||
    input.denominatorImportance < 0
  ) {
    throw new RangeError(
      "denominatorImportance must be a nonnegative safe integer"
    );
  }
  for (const line of input.lines) {
    assertNonnegativeSafeInteger(line.importance, "line importance");
    assertNonnegativeSafeInteger(line.rollValuePoints, "line rollValuePoints");
    if (!Number.isSafeInteger(line.importance * line.rollValuePoints)) {
      throw new RangeError(
        "Weighted line points exceed the safe integer range"
      );
    }
  }
  if (
    input.fourLineStartProbability !== undefined &&
    (!Number.isFinite(input.fourLineStartProbability) ||
      input.fourLineStartProbability < 0 ||
      input.fourLineStartProbability > 1)
  ) {
    throw new RangeError("fourLineStartProbability must be in [0, 1]");
  }

  if (input.lines.length === 4) {
    if (input.revealOptions !== undefined) {
      throw new RangeError("A four-line artifact must not have reveal options");
    }
    if (
      input.denominatorImportance === 0 &&
      input.lines.some((line) => line.importance !== 0)
    ) {
      throw new RangeError("A zero denominator requires zero line importance");
    }
    return;
  }

  if (!input.revealOptions || input.revealOptions.length === 0) {
    throw new RangeError("A three-line artifact requires reveal options");
  }
  for (const option of input.revealOptions) {
    assertNonnegativeSafeInteger(option.importance, "reveal importance");
    if (!Number.isFinite(option.probability) || option.probability < 0) {
      throw new RangeError("Reveal probability must be finite and nonnegative");
    }
  }
  const revealTotal = compensatedSum(
    input.revealOptions.map((option) => option.probability)
  );
  if (Math.abs(revealTotal - 1) > PROBABILITY_EPSILON) {
    throw new RangeError("Reveal probability mass must total one");
  }
  if (
    input.denominatorImportance === 0 &&
    (input.lines.some((line) => line.importance !== 0) ||
      input.revealOptions.some((option) => option.importance !== 0))
  ) {
    throw new RangeError("A zero denominator requires zero line importance");
  }
};

const addProbability = (
  states: Map<number, CompensatedSum>,
  weightedPoints: number,
  probability: number
): void => {
  let accumulator = states.get(weightedPoints);
  if (!accumulator) {
    accumulator = new CompensatedSum();
    states.set(weightedPoints, accumulator);
  }
  accumulator.add(probability);
};

const finalizePointStates = (
  states: Map<number, CompensatedSum>
): ReadonlyMap<number, number> => {
  const entries = [...states.entries()]
    .map(([points, probability]) => [points, probability.value()] as const)
    .sort(([left], [right]) => left - right);
  const total = compensatedSum(entries.map(([, probability]) => probability));
  if (Math.abs(total - 1) > PROBABILITY_EPSILON) {
    throw new RangeError(
      "Potential probability mass did not remain normalized"
    );
  }
  return new Map(
    entries.map(([points, probability]) => [points, probability / total])
  );
};

const runUpgradeEvents = (
  initialWeightedPoints: number,
  importances: readonly number[],
  eventCount: number
): ReadonlyMap<number, number> => {
  let states: ReadonlyMap<number, number> = new Map([
    [initialWeightedPoints, 1],
  ]);
  const branchProbability = 1 / (importances.length * TIER_POINTS.length);

  for (let event = 0; event < eventCount; event += 1) {
    const next = new Map<number, CompensatedSum>();
    for (const [weightedPoints, probability] of states) {
      for (const importance of importances) {
        for (const tierPoints of TIER_POINTS) {
          addProbability(
            next,
            weightedPoints + importance * tierPoints,
            probability * branchProbability
          );
        }
      }
    }
    states = finalizePointStates(next);
  }

  return states;
};

const runUpgradeEventsCooperatively = async (
  initialWeightedPoints: number,
  importances: readonly number[],
  eventCount: number,
  computation: CooperativeComputation
): Promise<ReadonlyMap<number, number> | undefined> => {
  let states: ReadonlyMap<number, number> = new Map([
    [initialWeightedPoints, 1],
  ]);
  const branchProbability = 1 / (importances.length * TIER_POINTS.length);

  for (let event = 0; event < eventCount; event += 1) {
    const next = new Map<number, CompensatedSum>();
    for (const [weightedPoints, probability] of states) {
      for (const importance of importances) {
        for (const tierPoints of TIER_POINTS) {
          addProbability(
            next,
            weightedPoints + importance * tierPoints,
            probability * branchProbability
          );
        }
      }
      if (computation.cancelled) return undefined;
      if (computation.isYieldDue(64) && !(await computation.yield())) {
        return undefined;
      }
    }
    states = finalizePointStates(next);
  }

  return states;
};

const calculateFinalPointStates = (
  input: PotentialInput,
  initialWeightedPoints: number
): ReadonlyMap<number, number> => {
  const existingImportances = input.lines.map((line) => line.importance);
  if (input.lines.length === 4) {
    return runUpgradeEvents(
      initialWeightedPoints,
      existingImportances,
      input.remainingUpgradeEvents
    );
  }

  const combined = new Map<number, CompensatedSum>();
  const revealOptions = [...input.revealOptions!].sort(
    (left, right) =>
      left.importance - right.importance || left.probability - right.probability
  );
  for (const option of revealOptions) {
    for (const tierPoints of TIER_POINTS) {
      const conditionalStates = runUpgradeEvents(
        initialWeightedPoints + option.importance * tierPoints,
        [...existingImportances, option.importance],
        input.remainingUpgradeEvents
      );
      const branchProbability = option.probability / TIER_POINTS.length;
      for (const [weightedPoints, probability] of conditionalStates) {
        addProbability(
          combined,
          weightedPoints,
          probability * branchProbability
        );
      }
    }
  }
  return finalizePointStates(combined);
};

const calculateFinalPointStatesCooperatively = async (
  input: PotentialInput,
  initialWeightedPoints: number,
  computation: CooperativeComputation
): Promise<ReadonlyMap<number, number> | undefined> => {
  const existingImportances = input.lines.map((line) => line.importance);
  if (input.lines.length === 4) {
    return runUpgradeEventsCooperatively(
      initialWeightedPoints,
      existingImportances,
      input.remainingUpgradeEvents,
      computation
    );
  }

  const combined = new Map<number, CompensatedSum>();
  const revealOptions = [...input.revealOptions!].sort(
    (left, right) =>
      left.importance - right.importance || left.probability - right.probability
  );
  for (const option of revealOptions) {
    for (const tierPoints of TIER_POINTS) {
      const conditionalStates = await runUpgradeEventsCooperatively(
        initialWeightedPoints + option.importance * tierPoints,
        [...existingImportances, option.importance],
        input.remainingUpgradeEvents,
        computation
      );
      if (!conditionalStates) return undefined;
      const branchProbability = option.probability / TIER_POINTS.length;
      for (const [weightedPoints, probability] of conditionalStates) {
        addProbability(
          combined,
          weightedPoints,
          probability * branchProbability
        );
        if (computation.cancelled) return undefined;
        if (computation.isYieldDue(64) && !(await computation.yield())) {
          return undefined;
        }
      }
    }
  }
  return finalizePointStates(combined);
};

export const matchScoreFromWeightedPoints = (
  weightedPoints: number,
  preferredMain: boolean,
  denominatorImportance: number
): ExactRational => {
  if (denominatorImportance === 0) {
    if (weightedPoints !== 0) {
      throw new RangeError("A zero denominator requires zero weighted points");
    }
    return createRational(preferredMain ? 8n : 0n, 17n);
  }
  const points = BigInt(weightedPoints);
  const denominator = BigInt(denominatorImportance);
  return createRational(
    (preferredMain ? 80n * denominator : 0n) + 9n * points,
    170n * denominator
  );
};

export const calculatePotential = (
  input: PotentialInput
): PotentialCalculation => {
  validateInput(input);
  const initialWeightedPoints = input.lines.reduce(
    (total, line) => total + line.importance * line.rollValuePoints,
    0
  );
  const pointStates = calculateFinalPointStates(input, initialWeightedPoints);
  const pmf = createScoreDistribution(
    [...pointStates].map(([weightedPoints, probability]) => ({
      score: matchScoreFromWeightedPoints(
        weightedPoints,
        input.preferredMain,
        input.denominatorImportance
      ),
      probability,
    }))
  );
  const p10 = quantileScore(pmf, 0.1);
  const median = quantileScore(pmf, 0.5);
  const p90 = quantileScore(pmf, 0.9);
  const best = pmf.atoms[pmf.atoms.length - 1].score;

  return Object.freeze({
    pmf,
    cdf: buildScoreCdf(pmf),
    expectedFinalMatch: expectedScore(pmf),
    p10FinalMatch: rationalToNumber(p10),
    medianFinalMatch: rationalToNumber(median),
    p90FinalMatch: rationalToNumber(p90),
    bestReachableFinalMatch: rationalToNumber(best),
  });
};

export const calculatePotentialCooperatively = async (
  input: PotentialInput,
  options: CooperativeComputationOptions | CooperativeComputation = {}
): Promise<PotentialCalculation | undefined> => {
  validateInput(input);
  const computation = useCooperativeComputation(options);
  const initialWeightedPoints = input.lines.reduce(
    (total, line) => total + line.importance * line.rollValuePoints,
    0
  );
  const pointStates = await calculateFinalPointStatesCooperatively(
    input,
    initialWeightedPoints,
    computation
  );
  if (!pointStates) return undefined;

  const pmf = await createScoreDistributionCooperatively(
    [...pointStates].map(([weightedPoints, probability]) => ({
      score: matchScoreFromWeightedPoints(
        weightedPoints,
        input.preferredMain,
        input.denominatorImportance
      ),
      probability,
    })),
    computation
  );
  if (!pmf) return undefined;

  const p10 = quantileScore(pmf, 0.1);
  const median = quantileScore(pmf, 0.5);
  const p90 = quantileScore(pmf, 0.9);
  const best = pmf.atoms[pmf.atoms.length - 1].score;

  return Object.freeze({
    pmf,
    cdf: buildScoreCdf(pmf),
    expectedFinalMatch: expectedScore(pmf),
    p10FinalMatch: rationalToNumber(p10),
    medianFinalMatch: rationalToNumber(median),
    p90FinalMatch: rationalToNumber(p90),
    bestReachableFinalMatch: rationalToNumber(best),
  });
};

export const probabilityAtLeast = (
  distribution: DiscreteScoreDistribution,
  target: ExactRational
): number => inclusiveTailProbability(distribution, target);
