import { AttributePosition, AttributeType } from "../../genshin/attribute";
import type { Build } from "../../genshin/build";
import { FIVE_STAR_SUBSTAT_TYPES, isFiveStarSubstat } from "./rollData";
import type {
  BuildScoringProfile,
  EvaluationIssue,
  ValidateBuildResult,
} from "./types";

export const LEGAL_MAIN_STATS_BY_POSITION: Readonly<
  Partial<Record<AttributePosition, readonly AttributeType[]>>
> = Object.freeze({
  [AttributePosition.FLOWER]: Object.freeze([AttributeType.HP]),
  [AttributePosition.PLUME]: Object.freeze([AttributeType.ATK]),
  [AttributePosition.SANDS]: Object.freeze([
    AttributeType.HP_PERCENT,
    AttributeType.ATK_PERCENT,
    AttributeType.DEF_PERCENT,
    AttributeType.ELEMENTAL_MASTERY,
    AttributeType.ENERGY_RECHARGE,
  ]),
  [AttributePosition.GOBLET]: Object.freeze([
    AttributeType.HP_PERCENT,
    AttributeType.ATK_PERCENT,
    AttributeType.DEF_PERCENT,
    AttributeType.ELEMENTAL_MASTERY,
    AttributeType.PYRO_DAMAGE_BONUS,
    AttributeType.HYDRO_DAMAGE_BONUS,
    AttributeType.ELECTRO_DAMAGE_BONUS,
    AttributeType.CRYO_DAMAGE_BONUS,
    AttributeType.ANEMO_DAMAGE_BONUS,
    AttributeType.GEO_DAMAGE_BONUS,
    AttributeType.DENDRO_DAMAGE_BONUS,
    AttributeType.PHYSICAL_DAMAGE_BONUS,
  ]),
  [AttributePosition.CIRCLET]: Object.freeze([
    AttributeType.HP_PERCENT,
    AttributeType.ATK_PERCENT,
    AttributeType.DEF_PERCENT,
    AttributeType.ELEMENTAL_MASTERY,
    AttributeType.CRIT_RATE,
    AttributeType.CRIT_DAMAGE,
    AttributeType.HEALING_BONUS,
  ]),
});

const POSITION_BUILD_FIELDS: Readonly<
  Array<readonly [AttributePosition, keyof Build]>
> = Object.freeze([
  [AttributePosition.FLOWER, "flowerAttributes"],
  [AttributePosition.PLUME, "plumeAttributes"],
  [AttributePosition.SANDS, "sandsAttributes"],
  [AttributePosition.GOBLET, "gobletAttributes"],
  [AttributePosition.CIRCLET, "circletAttributes"],
]);

const greatestCommonDivisor = (left: number, right: number): number => {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) [a, b] = [b, a % b];
  return a;
};

const error = (
  code: EvaluationIssue["code"],
  buildId: string,
  details?: EvaluationIssue["details"]
): EvaluationIssue => ({ code, severity: "error", buildId, details });

export const isLegalMainStat = (
  position: AttributePosition,
  type: AttributeType
): boolean => LEGAL_MAIN_STATS_BY_POSITION[position]?.includes(type) ?? false;

export const validateBuild = (
  build: Build,
  id: string
): ValidateBuildResult => {
  const issues: EvaluationIssue[] = [];
  const preferredMainStats: Partial<
    Record<AttributePosition, readonly AttributeType[]>
  > = {};

  for (const [position, field] of POSITION_BUILD_FIELDS) {
    const values = build[field] as AttributeType[];
    const seen = new Set<AttributeType>();

    for (const type of values) {
      if (seen.has(type) || !isLegalMainStat(position, type)) {
        issues.push(
          error("INVALID_BUILD_MAIN_STAT", id, {
            position,
            attributeType: type,
            reason: seen.has(type) ? "duplicate" : "illegal-for-position",
          })
        );
      }
      seen.add(type);
    }

    preferredMainStats[position] = Object.freeze([...values]);
  }

  const integerWeights: Partial<Record<AttributeType, number>> = {};
  const seenSubstats = new Set<AttributeType>();

  for (const substat of build.subAttributes) {
    const { type, value } = substat;
    if (seenSubstats.has(type)) {
      issues.push(
        error("DUPLICATE_BUILD_SUBSTAT", id, { attributeType: type })
      );
      continue;
    }
    seenSubstats.add(type);

    if (!isFiveStarSubstat(type)) {
      issues.push(error("INVALID_BUILD_SUBSTAT", id, { attributeType: type }));
      continue;
    }

    const scaled = value * 10;
    const nearest = Math.round(scaled);
    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value > 1 ||
      Math.abs(scaled - nearest) > 1e-5
    ) {
      issues.push(
        error("INVALID_BUILD_IMPORTANCE", id, {
          attributeType: type,
          value,
        })
      );
      continue;
    }

    if (nearest > 0) integerWeights[type] = nearest;
  }

  if (issues.length > 0) return { status: "invalid", issues };

  const positiveWeights = FIVE_STAR_SUBSTAT_TYPES.map(
    (type) => integerWeights[type] ?? 0
  ).filter((weight) => weight > 0);
  const divisor = positiveWeights.reduce(greatestCommonDivisor, 0) || 1;
  const importanceBySubstat = Object.freeze(
    Object.fromEntries(
      FIVE_STAR_SUBSTAT_TYPES.flatMap((type) => {
        const weight = integerWeights[type];
        return weight ? [[type, weight / divisor]] : [];
      })
    ) as Partial<Record<AttributeType, number>>
  );

  const profile = Object.freeze({
    id,
    preferredMainStats: Object.freeze(preferredMainStats),
    importanceBySubstat,
  }) as BuildScoringProfile;

  return { status: "ok", profile, issues: Object.freeze([]) };
};
