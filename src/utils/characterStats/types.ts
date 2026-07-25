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
