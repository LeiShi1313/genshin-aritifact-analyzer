import { AttributeType } from "../genshin/attribute";

type ArtifactRarity = 1 | 2 | 3 | 4 | 5;
type MainStatTableKey =
  | "hpFlat"
  | "attackFlat"
  | "percent"
  | "defensePercent"
  | "elementalMastery"
  | "energyRecharge"
  | "critRate"
  | "critDamage"
  | "physicalDamageBonus"
  | "healingBonus";

type MainStatTables = Readonly<
  Record<MainStatTableKey, readonly number[]>
>;

// Canonical game-data values with float noise normalized. Ratios are stored
// below as percentage points and normalized at the module boundary. Data
// provenance is recorded in THIRD_PARTY_NOTICES.md.
const MAIN_STAT_VALUES: Readonly<Record<ArtifactRarity, MainStatTables>> = {
  1: {
    hpFlat: [129, 178, 227, 275, 324],
    attackFlat: [8, 12, 15, 18, 21],
    percent: [3.1, 4.3, 5.5, 6.7, 7.9],
    defensePercent: [3.9, 5.4, 6.9, 8.4, 9.9],
    elementalMastery: [12.6, 17.3, 22.1, 26.9, 31.6],
    energyRecharge: [3.5, 4.8, 6.1, 7.5, 8.8],
    critRate: [2.1, 2.9, 3.7, 4.5, 5.3],
    critDamage: [4.2, 5.8, 7.4, 9, 10.5],
    physicalDamageBonus: [3.9, 5.4, 6.9, 8.4, 9.9],
    healingBonus: [2.4, 3.3, 4.3, 5.2, 6.1],
  },
  2: {
    hpFlat: [258, 331, 404, 478, 551],
    attackFlat: [17, 22, 26, 31, 36],
    percent: [4.2, 5.4, 6.6, 7.8, 9],
    defensePercent: [5.2, 6.7, 8.2, 9.7, 11.2],
    elementalMastery: [16.8, 21.5, 26.3, 31.1, 35.8],
    energyRecharge: [4.7, 6, 7.3, 8.6, 9.9],
    critRate: [2.8, 3.6, 4.4, 5.2, 6],
    critDamage: [5.6, 7.2, 8.8, 10.4, 11.9],
    physicalDamageBonus: [5.2, 6.7, 8.2, 9.7, 11.2],
    healingBonus: [3.2, 4.1, 5.1, 6, 6.9],
  },
  3: {
    hpFlat: [
      430, 552, 674, 796, 918, 1040, 1162, 1283, 1405, 1527, 1649, 1771,
      1893,
    ],
    attackFlat: [28, 36, 44, 52, 60, 68, 76, 84, 91, 99, 107, 115, 123],
    percent: [
      5.2, 6.7, 8.2, 9.7, 11.2, 12.7, 14.2, 15.6, 17.1, 18.6, 20.1,
      21.6, 23.1,
    ],
    defensePercent: [
      6.6, 8.4, 10.3, 12.1, 14, 15.8, 17.7, 19.6, 21.4, 23.3, 25.1, 27,
      28.8,
    ],
    elementalMastery: [
      21, 26.9, 32.9, 38.8, 44.8, 50.7, 56.7, 62.6, 68.5, 74.5, 80.4,
      86.4, 92.3,
    ],
    energyRecharge: [
      5.8, 7.5, 9.1, 10.8, 12.4, 14.1, 15.7, 17.4, 19, 20.7, 22.3, 24,
      25.6,
    ],
    critRate: [
      3.5, 4.5, 5.5, 6.5, 7.5, 8.4, 9.4, 10.4, 11.4, 12.4, 13.4, 14.4,
      15.4,
    ],
    critDamage: [
      7, 9, 11, 12.9, 14.9, 16.9, 18.9, 20.9, 22.8, 24.8, 26.8, 28.8,
      30.8,
    ],
    physicalDamageBonus: [
      6.6, 8.4, 10.3, 12.1, 14, 15.8, 17.7, 19.6, 21.4, 23.3, 25.1, 27,
      28.8,
    ],
    healingBonus: [
      4, 5.2, 6.3, 7.5, 8.6, 9.8, 10.9, 12, 13.2, 14.3, 15.5, 16.6,
      17.8,
    ],
  },
  4: {
    hpFlat: [
      645, 828, 1011, 1194, 1377, 1559, 1742, 1925, 2108, 2291, 2474, 2657,
      2839, 3022, 3205, 3388, 3571,
    ],
    attackFlat: [
      42, 54, 66, 78, 90, 102, 113, 125, 137, 149, 161, 173, 185, 197, 209,
      221, 232,
    ],
    percent: [
      6.3, 8.1, 9.9, 11.6, 13.4, 15.2, 17, 18.8, 20.6, 22.3, 24.1, 25.9,
      27.7, 29.5, 31.3, 33, 34.8,
    ],
    defensePercent: [
      7.9, 10.1, 12.3, 14.6, 16.8, 19, 21.2, 23.5, 25.7, 27.9, 30.2, 32.4,
      34.6, 36.8, 39.1, 41.3, 43.5,
    ],
    elementalMastery: [
      25.2, 32.3, 39.4, 46.6, 53.7, 60.8, 68, 75.1, 82.2, 89.4, 96.5,
      103.6, 110.8, 117.9, 125, 132.2, 139.3,
    ],
    energyRecharge: [
      7, 9, 11, 12.9, 14.9, 16.9, 18.9, 20.9, 22.8, 24.8, 26.8, 28.8,
      30.8, 32.8, 34.7, 36.7, 38.7,
    ],
    critRate: [
      4.2, 5.4, 6.6, 7.8, 9, 10.1, 11.3, 12.5, 13.7, 14.9, 16.1, 17.3,
      18.5, 19.7, 20.8, 22, 23.2,
    ],
    critDamage: [
      8.4, 10.8, 13.1, 15.5, 17.9, 20.3, 22.7, 25, 27.4, 29.8, 32.2,
      34.5, 36.9, 39.3, 41.7, 44.1, 46.4,
    ],
    physicalDamageBonus: [
      7.9, 10.1, 12.3, 14.6, 16.8, 19, 21.2, 23.5, 25.7, 27.9, 30.2, 32.4,
      34.6, 36.8, 39.1, 41.3, 43.5,
    ],
    healingBonus: [
      4.8, 6.2, 7.6, 9, 10.3, 11.7, 13.1, 14.4, 15.8, 17.2, 18.6, 19.9,
      21.3, 22.7, 24, 25.4, 26.8,
    ],
  },
  5: {
    hpFlat: [
      717, 920, 1123, 1326, 1530, 1733, 1936, 2139, 2342, 2545, 2749, 2952,
      3155, 3358, 3561, 3764, 3967, 4171, 4374, 4577, 4780,
    ],
    attackFlat: [
      47, 60, 73, 86, 100, 113, 126, 139, 152, 166, 179, 192, 205, 219, 232,
      245, 258, 272, 285, 298, 311,
    ],
    percent: [
      7, 9, 11, 12.9, 14.9, 16.9, 18.9, 20.9, 22.8, 24.8, 26.8, 28.8,
      30.8, 32.8, 34.7, 36.7, 38.7, 40.7, 42.7, 44.6, 46.6,
    ],
    defensePercent: [
      8.7, 11.2, 13.7, 16.2, 18.6, 21.1, 23.6, 26.1, 28.6, 31, 33.5, 36,
      38.5, 40.9, 43.4, 45.9, 48.4, 50.8, 53.3, 55.8, 58.3,
    ],
    elementalMastery: [
      28, 35.9, 43.8, 51.8, 59.7, 67.6, 75.5, 83.5, 91.4, 99.3, 107.2,
      115.2, 123.1, 131, 138.9, 146.9, 154.8, 162.7, 170.6, 178.6, 186.5,
    ],
    energyRecharge: [
      7.8, 10, 12.2, 14.4, 16.6, 18.8, 21, 23.2, 25.4, 27.6, 29.8, 32,
      34.2, 36.4, 38.6, 40.8, 43, 45.2, 47.4, 49.6, 51.8,
    ],
    critRate: [
      4.7, 6, 7.3, 8.6, 9.9, 11.3, 12.6, 13.9, 15.2, 16.6, 17.9, 19.2,
      20.5, 21.8, 23.2, 24.5, 25.8, 27.1, 28.4, 29.8, 31.1,
    ],
    critDamage: [
      9.3, 12, 14.6, 17.3, 19.9, 22.5, 25.2, 27.8, 30.5, 33.1, 35.7,
      38.4, 41, 43.7, 46.3, 49, 51.6, 54.2, 56.9, 59.5, 62.2,
    ],
    physicalDamageBonus: [
      8.7, 11.2, 13.7, 16.2, 18.6, 21.1, 23.6, 26.1, 28.6, 31, 33.5, 36,
      38.5, 40.9, 43.4, 45.9, 48.4, 50.8, 53.3, 55.8, 58.3,
    ],
    healingBonus: [
      5.4, 6.9, 8.4, 10, 11.5, 13, 14.5, 16.1, 17.6, 19.1, 20.6, 22.1,
      23.7, 25.2, 26.7, 28.2, 29.8, 31.3, 32.8, 34.3, 35.9,
    ],
  },
};

const PERCENT_TABLE_KEYS = new Set<MainStatTableKey>([
  "percent",
  "defensePercent",
  "energyRecharge",
  "critRate",
  "critDamage",
  "physicalDamageBonus",
  "healingBonus",
]);

const MAX_LEVEL_BY_RARITY: Readonly<Record<ArtifactRarity, number>> = {
  1: 4,
  2: 4,
  3: 12,
  4: 16,
  5: 20,
};

const TABLE_KEY_BY_ATTRIBUTE: Partial<Record<AttributeType, MainStatTableKey>> = {
  [AttributeType.HP]: "hpFlat",
  [AttributeType.ATK]: "attackFlat",
  [AttributeType.HP_PERCENT]: "percent",
  [AttributeType.ATK_PERCENT]: "percent",
  [AttributeType.DEF_PERCENT]: "defensePercent",
  [AttributeType.ELEMENTAL_MASTERY]: "elementalMastery",
  [AttributeType.ENERGY_RECHARGE]: "energyRecharge",
  [AttributeType.CRIT_RATE]: "critRate",
  [AttributeType.CRIT_DAMAGE]: "critDamage",
  [AttributeType.HEALING_BONUS]: "healingBonus",
  [AttributeType.PHYSICAL_DAMAGE_BONUS]: "physicalDamageBonus",
  [AttributeType.ANEMO_DAMAGE_BONUS]: "percent",
  [AttributeType.CRYO_DAMAGE_BONUS]: "percent",
  [AttributeType.DENDRO_DAMAGE_BONUS]: "percent",
  [AttributeType.ELECTRO_DAMAGE_BONUS]: "percent",
  [AttributeType.GEO_DAMAGE_BONUS]: "percent",
  [AttributeType.HYDRO_DAMAGE_BONUS]: "percent",
  [AttributeType.PYRO_DAMAGE_BONUS]: "percent",
};

export const getArtifactMainStatValue = (
  attribute: AttributeType,
  rarity: number,
  level: number
): number | undefined => {
  if (
    !Number.isInteger(rarity) ||
    rarity < 1 ||
    rarity > 5 ||
    !Number.isInteger(level) ||
    level < 0 ||
    level > MAX_LEVEL_BY_RARITY[rarity as ArtifactRarity]
  ) {
    return undefined;
  }

  const tableKey = TABLE_KEY_BY_ATTRIBUTE[attribute];
  if (!tableKey) return undefined;
  const displayedValue = MAIN_STAT_VALUES[rarity as ArtifactRarity][tableKey][level];
  if (displayedValue === undefined) return undefined;
  return PERCENT_TABLE_KEYS.has(tableKey)
    ? Math.round(displayedValue * 10) / 1000
    : displayedValue;
};
