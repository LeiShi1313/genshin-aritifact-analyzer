import { AttributePosition, AttributeType } from "../../genshin/attribute";
import { compensatedSum, PROBABILITY_EPSILON } from "./probabilityTypes";
import type { NormalSourceFiveStarProfile } from "./types";

export const POPULATION_ALGORITHM_VERSION = "normal-five-star-population-v1";

export const FIVE_STAR_TIER_POINTS = Object.freeze([7, 8, 9, 10] as const);

type MainStatWeightTable = Readonly<Partial<Record<AttributeType, number>>>;

export const NORMAL_FIVE_STAR_MAIN_STAT_WEIGHTS: Readonly<
  Partial<Record<AttributePosition, MainStatWeightTable>>
> = Object.freeze({
  [AttributePosition.FLOWER]: Object.freeze({
    [AttributeType.HP]: 1,
  }),
  [AttributePosition.PLUME]: Object.freeze({
    [AttributeType.ATK]: 1,
  }),
  [AttributePosition.SANDS]: Object.freeze({
    [AttributeType.ELEMENTAL_MASTERY]: 500,
    [AttributeType.ENERGY_RECHARGE]: 500,
    [AttributeType.HP_PERCENT]: 1334,
    [AttributeType.ATK_PERCENT]: 1333,
    [AttributeType.DEF_PERCENT]: 1333,
  }),
  [AttributePosition.GOBLET]: Object.freeze({
    [AttributeType.ELEMENTAL_MASTERY]: 100,
    [AttributeType.HP_PERCENT]: 767,
    [AttributeType.ATK_PERCENT]: 767,
    [AttributeType.DEF_PERCENT]: 766,
    [AttributeType.ANEMO_DAMAGE_BONUS]: 200,
    [AttributeType.CRYO_DAMAGE_BONUS]: 200,
    [AttributeType.DENDRO_DAMAGE_BONUS]: 200,
    [AttributeType.ELECTRO_DAMAGE_BONUS]: 200,
    [AttributeType.GEO_DAMAGE_BONUS]: 200,
    [AttributeType.HYDRO_DAMAGE_BONUS]: 200,
    [AttributeType.PHYSICAL_DAMAGE_BONUS]: 200,
    [AttributeType.PYRO_DAMAGE_BONUS]: 200,
  }),
  [AttributePosition.CIRCLET]: Object.freeze({
    [AttributeType.ELEMENTAL_MASTERY]: 200,
    [AttributeType.HP_PERCENT]: 1100,
    [AttributeType.ATK_PERCENT]: 1100,
    [AttributeType.DEF_PERCENT]: 1100,
    [AttributeType.CRIT_RATE]: 500,
    [AttributeType.CRIT_DAMAGE]: 500,
    [AttributeType.HEALING_BONUS]: 500,
  }),
});

export interface WeightedMainStatOutcome {
  readonly type: AttributeType;
  readonly weight: number;
  readonly probability: number;
}

export const getNormalFiveStarMainStatOutcomes = (
  position: AttributePosition
): readonly WeightedMainStatOutcome[] => {
  const table = NORMAL_FIVE_STAR_MAIN_STAT_WEIGHTS[position];
  if (!table) {
    throw new RangeError(`Unsupported artifact position: ${position}`);
  }

  const entries = Object.entries(table)
    .map(([type, weight]) => [Number(type) as AttributeType, weight] as const)
    .sort(([left], [right]) => left - right);
  const totalWeight = compensatedSum(entries.map(([, weight]) => weight));
  if (totalWeight <= 0) {
    throw new RangeError(
      `Main-stat weights are empty for position ${position}`
    );
  }

  const outcomes = entries.map(([type, weight]) =>
    Object.freeze({ type, weight, probability: weight / totalWeight })
  );
  const probabilityTotal = compensatedSum(
    outcomes.map((outcome) => outcome.probability)
  );
  if (Math.abs(probabilityTotal - 1) > PROBABILITY_EPSILON) {
    throw new RangeError("Main-stat probability mass did not normalize");
  }
  return Object.freeze(outcomes);
};

export const validateNormalSourceFiveStarProfile = (
  sourceProfile: NormalSourceFiveStarProfile
): void => {
  if (sourceProfile.kind !== "normal-five-star") {
    throw new RangeError("Unsupported artifact source profile");
  }
  if (
    !Number.isFinite(sourceProfile.fourLineStartProbability) ||
    sourceProfile.fourLineStartProbability < 0 ||
    sourceProfile.fourLineStartProbability > 1
  ) {
    throw new RangeError("fourLineStartProbability must be in [0, 1]");
  }
};

export const normalSourceProfileSignature = (
  sourceProfile: NormalSourceFiveStarProfile
): string => {
  validateNormalSourceFiveStarProfile(sourceProfile);
  return `${
    sourceProfile.kind
  }:${sourceProfile.fourLineStartProbability.toString()}`;
};
