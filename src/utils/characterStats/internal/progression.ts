import charactersJson from "../../../data/characterStats/characters.generated.json";
import manifestJson from "../../../data/characterStats/manifest.generated.json";
import weaponsJson from "../../../data/characterStats/weapons.generated.json";
import type {
  CharacterProgression,
  ProgressionManifest,
  WeaponProgression,
} from "../types";

export const characterProgression = charactersJson as unknown as Readonly<
  Record<string, CharacterProgression>
>;

export const weaponProgression = weaponsJson as unknown as Readonly<
  Record<string, WeaponProgression>
>;

export const progressionManifest = manifestJson as ProgressionManifest;
