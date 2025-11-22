import { Weapon } from "../../genshin/weapon";
import { Set } from "../../genshin/set";

/**
 * Set override configuration
 * Can have 1 or 2 sets, total count must be 2 or 4
 * If 1 set: count is 2 or 4
 * If 2 sets: each count is 2
 */
export interface SetOverride {
  set: Set;
  count: 2 | 4;
}

/**
 * Weapon override configuration
 */
export interface WeaponOverride {
  weapon: Weapon;
  level?: number;       // 1-90
  maxLevel?: number;    // 20, 40, 50, 60, 70, 80, 90
  refinement?: number;  // 1-5
}

/**
 * Character override configuration
 * All fields are optional - only override what's set
 */
export interface CharacterOverride {
  /** Whether this character should override script character settings */
  enabled: boolean;

  /** Character level (1-90) */
  level?: number;

  /** Character max level for ascension (20, 40, 50, 60, 70, 80, 90) */
  maxLevel?: number;

  /** Constellation (0-6) */
  constellation?: number;

  /** Talents [attack, skill, burst] each 1-10 */
  talents?: [number, number, number];

  /** Weapon override */
  weapon?: WeaponOverride;

  /** Set overrides (max 2 sets) */
  sets?: SetOverride[];
}

/**
 * Map of character ID to their override settings
 */
export type CharacterOverrides = {
  [characterId: number]: CharacterOverride;
};

/**
 * Valid max level values for character ascension
 */
export const MAX_LEVEL_OPTIONS = [20, 40, 50, 60, 70, 80, 90] as const;

/**
 * Valid set count values
 */
export const SET_COUNT_OPTIONS = [2, 4] as const;
