export type Element =
  | "anemo"
  | "cryo"
  | "dendro"
  | "electro"
  | "geo"
  | "hydro"
  | "pyro";

export type ConstantEffectStat =
  | "hpPercent"
  | "attackPercent"
  | "defensePercent"
  | "elementalMastery"
  | "critRate"
  | "critDamage"
  | "healingBonus"
  | "shieldStrength"
  | "allElementalDamageBonus"
  | `${Element}DamageBonus`;

export type ProgressionStatKey =
  | "hpPercent"
  | "attackPercent"
  | "defensePercent"
  | "elementalMastery"
  | "energyRecharge"
  | "critRate"
  | "critDamage"
  | "healingBonus"
  | "physicalDamageBonus"
  | `${Element}DamageBonus`;

export type ArtifactSlot =
  | "flower"
  | "plume"
  | "sands"
  | "goblet"
  | "circlet";

export type ArtifactStatKey =
  | "hpFlat"
  | "hpPercent"
  | "attackFlat"
  | "attackPercent"
  | "defenseFlat"
  | "defensePercent"
  | "elementalMastery"
  | "energyRecharge"
  | "critRate"
  | "critDamage"
  | "healingBonus"
  | "physicalDamageBonus"
  | `${Element}DamageBonus`;

export interface ArtifactStatInput {
  readonly stat: ArtifactStatKey;
  /** Ratios use 1 = 100%; flat stats and EM use raw points. */
  readonly value: number;
}

export interface EquippedArtifactInput {
  readonly slot: ArtifactSlot;
  readonly setKey?: string;
  readonly mainStat: ArtifactStatInput;
  readonly substats: readonly ArtifactStatInput[];
}

export interface CharacterSheetLoadout {
  readonly character: {
    readonly key: string;
    readonly level: number;
    readonly ascension: number;
  };
  readonly weapon: {
    readonly key: string;
    readonly level: number;
    readonly ascension: number;
    /** Validated by the calculator because imported data is untrusted. */
    readonly refinement: number;
  } | null;
  readonly artifacts: readonly EquippedArtifactInput[];
}

export interface CharacterSheetStats {
  readonly maxHp: number;
  readonly attack: number;
  readonly defense: number;
  readonly elementalMastery: number;
  /** Ratios use 1 = 100%. */
  readonly energyRecharge: number;
  readonly critRate: number;
  readonly critDamage: number;
  readonly healingBonus: number;
  readonly shieldStrength: number;
  readonly damageBonus: Readonly<
    Record<Element | "physical", number>
  >;
}

export type CharacterSheetIssueCode =
  | "CHARACTER_NOT_FOUND"
  | "CHARACTER_PROGRESSION_NOT_FOUND"
  | "WEAPON_NOT_FOUND"
  | "WEAPON_PROGRESSION_NOT_FOUND"
  | "WEAPON_TYPE_MISMATCH"
  | "INVALID_REFINEMENT"
  | "INVALID_ARTIFACT_STAT"
  | "DUPLICATE_ARTIFACT_SLOT"
  | "MISSING_WEAPON"
  | "ARTIFACT_SET_CONSTANTS_UNSUPPORTED";

export interface CharacterSheetIssue {
  readonly code: CharacterSheetIssueCode;
  readonly sourceKey?: string;
}

export interface CharacterSheetCalculationValue {
  readonly stats: CharacterSheetStats;
  readonly base: {
    readonly hp: number;
    /** Character base ATK plus equipped weapon base ATK. */
    readonly attack: number;
    readonly defense: number;
  };
  readonly appliedRuleIds: readonly string[];
  readonly coverage: {
    readonly progression: "complete";
    readonly characterConstants: "reviewed";
    readonly weaponConstants: "reviewed" | "not-equipped";
    readonly artifactSetConstants: "not-applicable" | "unsupported";
    readonly gameVersion: string;
    readonly genshinDbVersion: string;
    readonly constantRuleset: string;
  };
  readonly issues: readonly CharacterSheetIssue[];
}

export type CharacterSheetResult =
  | ({ readonly status: "complete" } & CharacterSheetCalculationValue)
  | ({ readonly status: "partial" } & CharacterSheetCalculationValue)
  | {
      readonly status: "invalid";
      readonly issues: readonly CharacterSheetIssue[];
    };

export type RefinementValues = readonly [
  number,
  number,
  number,
  number,
  number,
];

export interface CharacterConstantRule {
  readonly id: string;
  readonly characterKey: string;
  /** Ascension phase, from 0 through 6. */
  readonly minimumAscension: number;
  readonly effects: readonly {
    readonly stat: ConstantEffectStat;
    /** Ratios use 1 = 100%; flat Elemental Mastery uses raw points. */
    readonly value: number;
  }[];
}

export interface WeaponConstantRule {
  readonly id: string;
  readonly weaponKey: string;
  readonly effects: readonly {
    readonly stat: ConstantEffectStat;
    /** R1 through R5. Ratios use 1 = 100%; flat EM uses raw points. */
    readonly valuesByRefinement: RefinementValues;
  }[];
}
