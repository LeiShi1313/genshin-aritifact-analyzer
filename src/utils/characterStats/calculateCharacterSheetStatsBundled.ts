import { calculateCharacterSheetStatsFromProgression } from "./calculateCharacterSheetStats";
import {
  characterProgression,
  progressionManifest,
  weaponProgression,
} from "./internal/progression";
import type { CharacterSheetLoadout, CharacterSheetResult } from "./types";

/** Synchronous convenience API backed by the complete generated catalogs. */
export const calculateCharacterSheetStats = (
  loadout: CharacterSheetLoadout
): CharacterSheetResult =>
  calculateCharacterSheetStatsFromProgression(loadout, {
    characters: characterProgression,
    weapons: weaponProgression,
    manifest: progressionManifest,
  });
