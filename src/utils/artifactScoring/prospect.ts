import { rationalToNumber, type ExactRational } from "./rational";
import {
  CompensatedSum,
  createScoreDistribution,
  inclusiveTailProbability,
  PROBABILITY_EPSILON,
  type DiscreteScoreDistribution,
} from "./probabilityTypes";

export interface ProspectResult {
  readonly percentile: number;
  readonly tailProbability: number;
}

export type ConservativeTopTenTarget =
  | {
      readonly status: "available";
      readonly score: ExactRational;
      readonly tailProbability: number;
    }
  | {
      readonly status: "unavailable";
      readonly reason: "TOP_DECILE_CUT_NOT_REACHABLE";
    };

export type TopTenFinishResult =
  | {
      readonly status: "available";
      readonly targetScore: ExactRational;
      readonly targetFinalMatch: number;
      readonly probability: number;
    }
  | {
      readonly status: "unavailable";
      readonly reason: "TOP_DECILE_CUT_NOT_REACHABLE";
    };

export interface StartClassPopulationInput {
  readonly threeLine: DiscreteScoreDistribution;
  readonly fourLine: DiscreteScoreDistribution;
  readonly fourLineStartProbability: number;
}

const clampUnitInterval = (value: number): number => {
  if (Math.abs(value) <= PROBABILITY_EPSILON) return 0;
  if (Math.abs(value - 1) <= PROBABILITY_EPSILON) return 1;
  return value;
};

export const evaluateProspect = (
  population: DiscreteScoreDistribution,
  observedQuality: ExactRational
): ProspectResult => {
  const tailProbability = clampUnitInterval(
    inclusiveTailProbability(population, observedQuality)
  );
  return Object.freeze({
    tailProbability,
    percentile: clampUnitInterval(1 - tailProbability),
  });
};

export const findConservativeTopTenTarget = (
  finishedPopulation: DiscreteScoreDistribution,
  cutoff: number = 0.1
): ConservativeTopTenTarget => {
  if (!Number.isFinite(cutoff) || cutoff < 0 || cutoff > 1) {
    throw new RangeError("Conservative-tail cutoff must be in [0, 1]");
  }

  const tail = new CompensatedSum();
  let candidate: { score: ExactRational; tailProbability: number } | undefined;

  for (
    let index = finishedPopulation.atoms.length - 1;
    index >= 0;
    index -= 1
  ) {
    const atom = finishedPopulation.atoms[index];
    tail.add(atom.probability);
    const tailProbability = tail.value();
    if (
      tailProbability < cutoff ||
      Math.abs(tailProbability - cutoff) <= PROBABILITY_EPSILON
    ) {
      candidate = { score: atom.score, tailProbability };
      continue;
    }
    break;
  }

  if (!candidate) {
    return Object.freeze({
      status: "unavailable" as const,
      reason: "TOP_DECILE_CUT_NOT_REACHABLE" as const,
    });
  }

  return Object.freeze({
    status: "available" as const,
    score: candidate.score,
    tailProbability: clampUnitInterval(candidate.tailProbability),
  });
};

export const calculateConservativeTopTenFinish = (
  potential: DiscreteScoreDistribution,
  finishedPopulation: DiscreteScoreDistribution,
  cutoff: number = 0.1
): TopTenFinishResult => {
  const target = findConservativeTopTenTarget(finishedPopulation, cutoff);
  if (target.status === "unavailable") return target;

  return Object.freeze({
    status: "available" as const,
    targetScore: target.score,
    targetFinalMatch: rationalToNumber(target.score),
    probability: clampUnitInterval(
      inclusiveTailProbability(potential, target.score)
    ),
  });
};

export const mixStartClassPopulations = ({
  threeLine,
  fourLine,
  fourLineStartProbability,
}: StartClassPopulationInput): DiscreteScoreDistribution => {
  if (
    !Number.isFinite(fourLineStartProbability) ||
    fourLineStartProbability < 0 ||
    fourLineStartProbability > 1
  ) {
    throw new RangeError("fourLineStartProbability must be in [0, 1]");
  }

  return createScoreDistribution([
    ...threeLine.atoms.map((atom) => ({
      score: atom.score,
      probability: atom.probability * (1 - fourLineStartProbability),
    })),
    ...fourLine.atoms.map((atom) => ({
      score: atom.score,
      probability: atom.probability * fourLineStartProbability,
    })),
  ]);
};
