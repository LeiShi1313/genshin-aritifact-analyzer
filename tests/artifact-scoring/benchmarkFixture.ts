import type { Artifact } from "../../src/genshin/artifact";
import {
  AttributePosition,
  AttributeType,
  type Attribute,
} from "../../src/genshin/attribute";
import type { Build } from "../../src/genshin/build";
import {
  getFiveStarRollLookup,
  isPercentageSubstat,
} from "../../src/utils/artifactScoring/rollData";

export const BENCHMARK_ARTIFACT_COUNT = 2_112;
export const BENCHMARK_BUILD_COUNT = 156;
export const BENCHMARK_SEED = 0x5a17c0de;

const MILESTONES = [0, 4, 8, 12, 16, 20] as const;
const POSITIONS = [
  AttributePosition.FLOWER,
  AttributePosition.PLUME,
  AttributePosition.SANDS,
  AttributePosition.GOBLET,
  AttributePosition.CIRCLET,
] as const;
const SUBSTATS = [
  AttributeType.CRIT_RATE,
  AttributeType.CRIT_DAMAGE,
  AttributeType.ENERGY_RECHARGE,
  AttributeType.ELEMENTAL_MASTERY,
] as const;

const mainStatForPosition = (position: AttributePosition): AttributeType => {
  switch (position) {
    case AttributePosition.FLOWER:
      return AttributeType.HP;
    case AttributePosition.PLUME:
      return AttributeType.ATK;
    case AttributePosition.SANDS:
      return AttributeType.ATK_PERCENT;
    case AttributePosition.GOBLET:
      return AttributeType.PYRO_DAMAGE_BONUS;
    case AttributePosition.CIRCLET:
      return AttributeType.HEALING_BONUS;
    default:
      throw new RangeError(`Unsupported benchmark position ${position}`);
  }
};

const mulberry32 = (seed: number) => () => {
  let value = (seed += 0x6d2b79f5);
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 0x1_0000_0000;
};

const storedValueWithRollCount = (
  type: AttributeType,
  rollCount: number,
  random: () => number
): number => {
  const lookup = getFiveStarRollLookup(type);
  if (!lookup) throw new Error(`Missing lookup for benchmark substat ${type}`);
  const candidates = [...lookup.values()].filter((entry) =>
    entry.possibleRollCounts.includes(rollCount)
  );
  const candidate = candidates[Math.floor(random() * candidates.length)];
  if (!candidate) {
    throw new Error(`No ${rollCount}-roll benchmark value for substat ${type}`);
  }
  return isPercentageSubstat(type)
    ? candidate.displayValueKey / 1_000
    : candidate.displayValueKey;
};

export interface ArtifactScoringBenchmarkFixture {
  readonly artifacts: readonly Artifact[];
  readonly builds: readonly { readonly id: string; readonly build: Build }[];
}

export const createArtifactScoringBenchmarkFixture = (
  seed = BENCHMARK_SEED
): ArtifactScoringBenchmarkFixture => {
  const random = mulberry32(seed);
  const artifacts = Array.from(
    { length: BENCHMARK_ARTIFACT_COUNT },
    (_, index): Artifact => {
      const level = MILESTONES[index % MILESTONES.length];
      const position = POSITIONS[index % POSITIONS.length];
      const threeLine = level === 0 && index % 2 === 0;
      const visibleTypes = threeLine ? SUBSTATS.slice(0, 3) : SUBSTATS;
      const upgradeRolls = level / 4;
      const subAttributes: Attribute[] = visibleTypes.map(
        (type, lineIndex) => ({
          type,
          value: storedValueWithRollCount(
            type,
            1 + (lineIndex === 0 ? upgradeRolls : 0),
            random
          ),
        })
      );

      return {
        set: 0,
        star: 5,
        level,
        position,
        mainAttribute: { type: mainStatForPosition(position), value: 0 },
        subAttributes,
        character: 0,
        locked: index % 7 === 0,
      };
    }
  );

  const builds = Array.from({ length: BENCHMARK_BUILD_COUNT }, (_, index) => {
    const weights = [
      1,
      0.5 + (index % 6) * 0.1,
      0.2 + (index % 5) * 0.1,
      0.1 + (index % 4) * 0.1,
    ];
    const build: Build = {
      name: `Benchmark build ${index}`,
      character: 0,
      weapons: [],
      suits: [],
      flowerAttributes: [AttributeType.HP],
      plumeAttributes: [AttributeType.ATK],
      sandsAttributes: [
        index % 2 === 0
          ? AttributeType.ATK_PERCENT
          : AttributeType.ENERGY_RECHARGE,
      ],
      gobletAttributes: [
        index % 2 === 0
          ? AttributeType.PYRO_DAMAGE_BONUS
          : AttributeType.ELEMENTAL_MASTERY,
      ],
      circletAttributes: [
        index % 2 === 0 ? AttributeType.CRIT_RATE : AttributeType.HEALING_BONUS,
      ],
      subAttributes: SUBSTATS.map((type, weightIndex) => ({
        type,
        value: Number(weights[weightIndex].toFixed(1)),
      })),
    };
    return { id: `benchmark-${index}`, build };
  });

  return { artifacts, builds };
};
