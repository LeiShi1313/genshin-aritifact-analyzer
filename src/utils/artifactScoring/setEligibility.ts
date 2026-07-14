import type { Build } from "../../genshin/build";
import {
  CompensatedSum,
  compensatedSum,
  PROBABILITY_EPSILON,
  type DiscreteScoreDistribution,
} from "./probabilityTypes";
import {
  PUBLIC_SCORE_DEFAULTS,
  toPublicArtifactScoreExact,
} from "./publicScore";

export const SET_ELIGIBILITY_POSITION_COUNT = 5;

export const BUILD_SET_PLAN = {
  NEUTRAL: 0,
  STRICT_FOUR_PIECE: 1,
} as const;

export const SET_COMPATIBILITY = {
  NEUTRAL: 0,
  MATCH: 1,
  MISMATCH: 2,
} as const;

export type BuildSetPlan = Readonly<{
  kind: (typeof BUILD_SET_PLAN)[keyof typeof BUILD_SET_PLAN];
  targetSets: readonly number[];
}>;

export const classifyBuildSetPlan = (build: Build): BuildSetPlan => {
  if (
    build.suits.length === 0 ||
    build.suits.some(
      (suit) =>
        suit.setCombos.length !== 1 ||
        suit.setCombos[0].count !== 4 ||
        !Number.isInteger(suit.setCombos[0].set) ||
        suit.setCombos[0].set <= 0
    )
  ) {
    return Object.freeze({ kind: BUILD_SET_PLAN.NEUTRAL, targetSets: [] });
  }

  return Object.freeze({
    kind: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
    targetSets: Object.freeze([
      ...new Set(build.suits.map((suit) => suit.setCombos[0].set)),
    ]),
  });
};

export const classifyArtifactSetCompatibility = (
  artifactSet: number,
  plan: BuildSetPlan
): (typeof SET_COMPATIBILITY)[keyof typeof SET_COMPATIBILITY] => {
  if (plan.kind !== BUILD_SET_PLAN.STRICT_FOUR_PIECE) {
    return SET_COMPATIBILITY.NEUTRAL;
  }
  return plan.targetSets.includes(artifactSet)
    ? SET_COMPATIBILITY.MATCH
    : SET_COMPATIBILITY.MISMATCH;
};

export interface PublicScoreBin {
  readonly score: number;
  readonly probability: number;
}

export type SetEligibilityReference = Readonly<{
  referenceMilestone: 0 | 20;
  baseScore: number;
}>;

export type SetEligibilityGate =
  | Readonly<{
      status: "available";
      baseScore: number;
      baseTailProbability: number;
      lastArrivalProbability: number;
      offPieceFactor: number;
      offPieceBudget: number;
      offPieceCutoff: number;
      retainedProbability: number;
      forcedHighestBucket: boolean;
      expectedFiveStarDrops: number;
    }>
  | Readonly<{
      status: "unavailable";
      baseScore: number;
      baseTailProbability: number;
      reason: "base-unattainable" | "build-uncompletable" | "zero-budget";
    }>;

const assertUnitInterval = (value: number, label: string): void => {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${label} must be in [0, 1]`);
  }
};

const assertPublicScore = (value: number): void => {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new RangeError("Base score must be an integer in [0, 100]");
  }
};

export const setEligibilityReferenceForLevel = (
  level: number
): SetEligibilityReference => {
  if (!Number.isFinite(level) || level < 0 || level > 20) {
    throw new RangeError("Artifact level must be in [0, 20]");
  }
  return level < 20
    ? {
        referenceMilestone: 0,
        baseScore: PUBLIC_SCORE_DEFAULTS.minPotential,
      }
    : {
        referenceMilestone: 20,
        baseScore: PUBLIC_SCORE_DEFAULTS.minScore,
      };
};

export const publicScoreBins = (
  distribution: DiscreteScoreDistribution
): readonly PublicScoreBin[] => {
  const probabilities = new Map<number, CompensatedSum>();
  distribution.atoms.forEach((atom) => {
    const score = toPublicArtifactScoreExact(atom.score);
    if (score === undefined) {
      throw new RangeError("Score distribution contains an invalid score");
    }
    let probability = probabilities.get(score);
    if (!probability) {
      probability = new CompensatedSum();
      probabilities.set(score, probability);
    }
    probability.add(atom.probability);
  });
  return Object.freeze(
    [...probabilities]
      .sort(([left], [right]) => right - left)
      .map(([score, probability]) =>
        Object.freeze({ score, probability: probability.value() })
      )
  );
};

export const lastArrivalProbabilities = (
  arrivalRates: readonly number[]
): readonly number[] => {
  if (arrivalRates.length !== SET_ELIGIBILITY_POSITION_COUNT) {
    throw new RangeError("Exactly five position arrival rates are required");
  }
  arrivalRates.forEach((rate) => {
    if (!Number.isFinite(rate) || rate < 0) {
      throw new RangeError("Arrival rates must be finite and nonnegative");
    }
  });

  const zeroIndexes = arrivalRates
    .map((rate, index) => (rate === 0 ? index : -1))
    .filter((index) => index >= 0);
  if (zeroIndexes.length > 0) {
    return Object.freeze(
      arrivalRates.map((_, index) =>
        zeroIndexes.includes(index) ? 1 / zeroIndexes.length : 0
      )
    );
  }

  const result = arrivalRates.map((positionRate, positionIndex) => {
    const others = arrivalRates
      .map((_, index) => index)
      .filter((index) => index !== positionIndex);
    let probability = 0;
    for (let mask = 0; mask < 1 << others.length; mask += 1) {
      let denominator = positionRate;
      let selectedCount = 0;
      for (let bit = 0; bit < others.length; bit += 1) {
        if ((mask & (1 << bit)) === 0) continue;
        denominator += arrivalRates[others[bit]];
        selectedCount += 1;
      }
      probability +=
        (selectedCount % 2 === 0 ? 1 : -1) * (positionRate / denominator);
    }
    return Math.max(0, Math.min(1, probability));
  });
  const total = compensatedSum(result);
  return Object.freeze(result.map((probability) => probability / total));
};

export const oddsLimitedOffPieceFactor = (
  lastArrivalProbability: number
): number => {
  assertUnitInterval(lastArrivalProbability, "Last-arrival probability");
  if (lastArrivalProbability >= 0.5) return 1;
  return lastArrivalProbability / (1 - lastArrivalProbability);
};

export const expectedFiveStarDrops = (
  baseTailProbability: number
): number | undefined => {
  assertUnitInterval(baseTailProbability, "Base-tail probability");
  return baseTailProbability === 0 ? undefined : 10 / baseTailProbability;
};

export const selectConservativePublicScoreCutoff = (
  bins: readonly PublicScoreBin[],
  baseScore: number,
  offPieceFactor: number
):
  | Readonly<{
      status: "available";
      baseTailProbability: number;
      offPieceBudget: number;
      offPieceCutoff: number;
      retainedProbability: number;
      forcedHighestBucket: boolean;
    }>
  | Readonly<{
      status: "unavailable";
      baseTailProbability: number;
      reason: "base-unattainable" | "zero-budget";
    }> => {
  assertPublicScore(baseScore);
  assertUnitInterval(offPieceFactor, "Off-piece factor");

  const eligibleBins = bins.filter((bin) => bin.score >= baseScore);
  const baseTailProbability = compensatedSum(
    eligibleBins.map((bin) => bin.probability)
  );
  if (eligibleBins.length === 0 || baseTailProbability === 0) {
    return {
      status: "unavailable",
      baseTailProbability: 0,
      reason: "base-unattainable",
    };
  }

  const offPieceBudget = offPieceFactor * baseTailProbability;
  if (offPieceBudget === 0) {
    return {
      status: "unavailable",
      baseTailProbability,
      reason: "zero-budget",
    };
  }
  let retainedProbability = eligibleBins[0].probability;
  let offPieceCutoff = eligibleBins[0].score;
  const forcedHighestBucket =
    retainedProbability > offPieceBudget + PROBABILITY_EPSILON;

  for (const bin of eligibleBins.slice(1)) {
    if (
      retainedProbability + bin.probability >
      offPieceBudget + PROBABILITY_EPSILON
    ) {
      break;
    }
    retainedProbability += bin.probability;
    offPieceCutoff = bin.score;
  }

  return {
    status: "available",
    baseTailProbability,
    offPieceBudget,
    offPieceCutoff,
    retainedProbability,
    forcedHighestBucket,
  };
};

export const calculateSetEligibilityGates = (
  distributions: readonly DiscreteScoreDistribution[],
  baseScore: number
): readonly SetEligibilityGate[] => {
  if (distributions.length !== SET_ELIGIBILITY_POSITION_COUNT) {
    throw new RangeError("Exactly five position distributions are required");
  }
  assertPublicScore(baseScore);

  const bins = distributions.map(publicScoreBins);
  const baseTailProbabilities = bins.map((positionBins) =>
    compensatedSum(
      positionBins
        .filter((bin) => bin.score >= baseScore)
        .map((bin) => bin.probability)
    )
  );
  if (baseTailProbabilities.some((probability) => probability === 0)) {
    return Object.freeze(
      baseTailProbabilities.map(
        (baseTailProbability): SetEligibilityGate =>
          Object.freeze({
            status: "unavailable",
            baseScore,
            baseTailProbability,
            reason:
              baseTailProbability === 0
                ? "base-unattainable"
                : "build-uncompletable",
          })
      )
    );
  }
  const lastArrivals = lastArrivalProbabilities(baseTailProbabilities);

  return Object.freeze(
    bins.map((positionBins, index): SetEligibilityGate => {
      const offPieceFactor = oddsLimitedOffPieceFactor(lastArrivals[index]);
      const cutoff = selectConservativePublicScoreCutoff(
        positionBins,
        baseScore,
        offPieceFactor
      );
      if (cutoff.status === "unavailable") {
        return Object.freeze({
          status: "unavailable",
          baseScore,
          baseTailProbability: cutoff.baseTailProbability,
          reason: cutoff.reason,
        });
      }
      return Object.freeze({
        baseScore,
        ...cutoff,
        lastArrivalProbability: lastArrivals[index],
        offPieceFactor,
        expectedFiveStarDrops: 10 / cutoff.baseTailProbability,
      });
    })
  );
};
