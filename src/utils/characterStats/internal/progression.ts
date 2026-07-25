import charactersJson from "../../../data/characterStats/characters.generated.json";
import manifestJson from "../../../data/characterStats/manifest.generated.json";
import weaponsJson from "../../../data/characterStats/weapons.generated.json";
import type { ProgressionStatKey } from "../types";

export interface CharacterProgression {
  readonly weaponType: string;
  readonly specializedStat: ProgressionStatKey;
  readonly stats: Readonly<
    Record<string, readonly [number, number, number, number]>
  >;
}

export interface WeaponProgression {
  readonly weaponType: string;
  readonly specializedStat: ProgressionStatKey | null;
  readonly stats: Readonly<Record<string, readonly [number, number]>>;
}

export const characterProgression = charactersJson as unknown as Readonly<
  Record<string, CharacterProgression>
>;

export const weaponProgression = weaponsJson as unknown as Readonly<
  Record<string, WeaponProgression>
>;

export const progressionManifest = manifestJson as Readonly<{
  schemaVersion: 1;
  genshinDbVersion: string;
  gameVersion: string;
}>;
