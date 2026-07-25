import { calculateCharacterSheetStatsFromProgression } from "./calculateCharacterSheetStats";
import {
  characterProgression,
  progressionManifest,
  weaponProgression,
} from "./internal/progression";
import type { CharacterSheetLoadout, CharacterSheetResult } from "./types";

/**
 * Calculates an unbuffed sheet from character/weapon progression, resolved
 * artifact stats, and reviewed always-active character/weapon rules.
 *
 * Derived, conditional, talent, constellation, team, and artifact-set effects
 * are intentionally excluded. Unsupported coverage is returned as `partial`.
 */
export const calculateCharacterSheetStats = (
  loadout: CharacterSheetLoadout
): CharacterSheetResult =>
  calculateCharacterSheetStatsFromProgression(loadout, {
    characters: characterProgression,
    weapons: weaponProgression,
    manifest: progressionManifest,
  });
