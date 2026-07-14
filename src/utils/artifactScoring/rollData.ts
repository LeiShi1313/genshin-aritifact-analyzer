import { AttributeType } from "../../genshin/attribute";
import type { CanonicalRollLookupEntry, CanonicalRollResult } from "./types";

/**
 * Pinned mechanics source:
 * DimbreathBot/AnimeGameData@82e74382e7788e318ad41fca926739a752c0bed6
 * ExcelBinOutput/ReliquaryAffixExcelConfigData.json
 *
 * The generator mirrors Genshin Optimizer@0c9bde8f99ec1561e66aa0114668e8cdc0b8aca2:
 * percentage tiers are first converted to float32 percentage points, then every
 * aggregate addition is float32-rounded before the game display rounding step.
 */
export const FIVE_STAR_MECHANICS_SOURCE = Object.freeze({
  dataCommit: "82e74382e7788e318ad41fca926739a752c0bed6",
  generatorCommit: "0c9bde8f99ec1561e66aa0114668e8cdc0b8aca2",
});

const NOMINAL_TIER_POINTS = [7, 8, 9, 10] as const;

const FIVE_STAR_ROLL_TIERS: Readonly<
  Partial<Record<AttributeType, readonly number[]>>
> = Object.freeze({
  [AttributeType.HP]: Object.freeze([209.13, 239, 268.88, 298.75]),
  [AttributeType.ATK]: Object.freeze([13.62, 15.56, 17.51, 19.45]),
  [AttributeType.DEF]: Object.freeze([16.2, 18.52, 20.83, 23.15]),
  [AttributeType.HP_PERCENT]: Object.freeze([0.0408, 0.0466, 0.0525, 0.0583]),
  [AttributeType.ATK_PERCENT]: Object.freeze([0.0408, 0.0466, 0.0525, 0.0583]),
  [AttributeType.DEF_PERCENT]: Object.freeze([0.051, 0.0583, 0.0656, 0.0729]),
  [AttributeType.ELEMENTAL_MASTERY]: Object.freeze([
    16.32, 18.65, 20.98, 23.31,
  ]),
  [AttributeType.ENERGY_RECHARGE]: Object.freeze([
    0.0453, 0.0518, 0.0583, 0.0648,
  ]),
  [AttributeType.CRIT_RATE]: Object.freeze([0.0272, 0.0311, 0.035, 0.0389]),
  [AttributeType.CRIT_DAMAGE]: Object.freeze([0.0544, 0.0622, 0.0699, 0.0777]),
});

export const FIVE_STAR_SUBSTAT_TYPES = Object.freeze([
  AttributeType.HP,
  AttributeType.ATK,
  AttributeType.DEF,
  AttributeType.HP_PERCENT,
  AttributeType.ATK_PERCENT,
  AttributeType.DEF_PERCENT,
  AttributeType.ELEMENTAL_MASTERY,
  AttributeType.ENERGY_RECHARGE,
  AttributeType.CRIT_RATE,
  AttributeType.CRIT_DAMAGE,
] as const);

export const FIVE_STAR_SUBSTAT_TYPE_WEIGHTS: Readonly<
  Record<(typeof FIVE_STAR_SUBSTAT_TYPES)[number], number>
> = Object.freeze({
  [AttributeType.HP]: 150,
  [AttributeType.ATK]: 150,
  [AttributeType.DEF]: 150,
  [AttributeType.HP_PERCENT]: 100,
  [AttributeType.ATK_PERCENT]: 100,
  [AttributeType.DEF_PERCENT]: 100,
  [AttributeType.ELEMENTAL_MASTERY]: 100,
  [AttributeType.ENERGY_RECHARGE]: 100,
  [AttributeType.CRIT_RATE]: 75,
  [AttributeType.CRIT_DAMAGE]: 75,
});

export const PINNED_DISPLAY_CORRECTIONS = Object.freeze({
  [AttributeType.DEF_PERCENT]: Object.freeze({ 240: 241 }),
  [AttributeType.CRIT_RATE]: Object.freeze({ 85: 86, 195: 194, 230: 229 }),
});

const PERCENTAGE_SUBSTATS = new Set<AttributeType>([
  AttributeType.HP_PERCENT,
  AttributeType.ATK_PERCENT,
  AttributeType.DEF_PERCENT,
  AttributeType.ENERGY_RECHARGE,
  AttributeType.CRIT_RATE,
  AttributeType.CRIT_DAMAGE,
]);

export const isFiveStarSubstat = (
  type: AttributeType
): type is (typeof FIVE_STAR_SUBSTAT_TYPES)[number] =>
  FIVE_STAR_SUBSTAT_TYPES.includes(
    type as (typeof FIVE_STAR_SUBSTAT_TYPES)[number]
  );

export const isPercentageSubstat = (type: AttributeType): boolean =>
  PERCENTAGE_SUBSTATS.has(type);

interface MutableLookupEntry {
  rollValuePoints: number;
  possibleRollCounts: Set<number>;
}

const buildLookupForType = (
  type: (typeof FIVE_STAR_SUBSTAT_TYPES)[number]
): ReadonlyMap<number, CanonicalRollLookupEntry> => {
  const tiers = FIVE_STAR_ROLL_TIERS[type];
  if (!tiers)
    throw new Error(`Missing five-star roll tiers for ${AttributeType[type]}`);

  const percentage = isPercentageSubstat(type);
  const accurateTiers = tiers.map((roll) =>
    percentage ? Math.fround(Math.fround(roll) * 100) : roll
  );
  const mutable = new Map<number, MutableLookupEntry>();

  const visit = (
    aggregate: number,
    rollCount: number,
    rollValuePoints: number
  ): void => {
    if (rollCount >= 6) return;

    for (let tierIndex = 0; tierIndex < accurateTiers.length; tierIndex += 1) {
      const nextAggregate = Math.fround(aggregate + accurateTiers[tierIndex]);
      const nextRollCount = rollCount + 1;
      const nextPoints = rollValuePoints + NOMINAL_TIER_POINTS[tierIndex];
      const displayValueKey = percentage
        ? Math.round(Math.fround(nextAggregate * 10))
        : Math.round(nextAggregate);
      const current = mutable.get(displayValueKey);

      if (current && current.rollValuePoints !== nextPoints) {
        throw new Error(
          `Ambiguous canonical roll points for ${AttributeType[type]} display key ${displayValueKey}`
        );
      }

      if (current) current.possibleRollCounts.add(nextRollCount);
      else {
        mutable.set(displayValueKey, {
          rollValuePoints: nextPoints,
          possibleRollCounts: new Set([nextRollCount]),
        });
      }

      visit(nextAggregate, nextRollCount, nextPoints);
    }
  };

  visit(0, 0, 0);

  return new Map(
    [...mutable.entries()].map(([displayValueKey, entry]) => [
      displayValueKey,
      Object.freeze({
        displayValueKey,
        rollValuePoints: entry.rollValuePoints,
        possibleRollCounts: Object.freeze(
          [...entry.possibleRollCounts].sort((a, b) => a - b)
        ),
      }),
    ])
  );
};

const FIVE_STAR_ROLL_LOOKUPS = new Map(
  FIVE_STAR_SUBSTAT_TYPES.map((type) => [type, buildLookupForType(type)])
);

export const FIVE_STAR_ROLL_LOOKUP_SIZES: Readonly<
  Partial<Record<AttributeType, number>>
> = Object.freeze(
  Object.fromEntries(
    FIVE_STAR_SUBSTAT_TYPES.map((type) => [
      type,
      FIVE_STAR_ROLL_LOOKUPS.get(type)?.size ?? 0,
    ])
  )
);

export const getFiveStarRollLookup = (
  type: AttributeType
): ReadonlyMap<number, CanonicalRollLookupEntry> | undefined =>
  FIVE_STAR_ROLL_LOOKUPS.get(type as (typeof FIVE_STAR_SUBSTAT_TYPES)[number]);

const toDisplayValueKey = (
  type: AttributeType,
  storedValue: number
): number | undefined => {
  if (!Number.isFinite(storedValue)) return undefined;

  if (isPercentageSubstat(type)) {
    const scaled = storedValue * 1000;
    const nearest = Math.round(scaled);
    return Math.abs(scaled - nearest) <= 1e-4 ? nearest : undefined;
  }

  return Number.isInteger(storedValue) ? storedValue : undefined;
};

export const getCanonicalRoll = (
  type: AttributeType,
  storedValue: number
): CanonicalRollResult => {
  const lookup = getFiveStarRollLookup(type);
  if (!lookup) return { status: "unsupported-substat" };

  const displayValueKey = toDisplayValueKey(type, storedValue);
  if (displayValueKey === undefined) return { status: "invalid-display-value" };

  const entry = lookup.get(displayValueKey);
  if (!entry) return { status: "impossible-roll-value", displayValueKey };
  return { status: "ok", ...entry };
};
