import type { Artifact } from "../genshin/artifact";
import type { Character } from "../genshin/character";
import type { Weapon } from "../genshin/weapon";

export interface ImportedCharacterInfo {
  character: Character;
  level: number;
  ascension: number;
  maxLevel: number;
  constellation: number;
  talents: [number, number, number];
}

export interface ImportedWeaponInfo {
  weapon: Weapon;
  level: number;
  ascension: number;
  maxLevel: number;
  refinement: number;
  location: Character;
}

export interface GOODData {
  format: string;
  version: number;
  source: string;
  characters: ImportedCharacterInfo[];
  weapons: ImportedWeaponInfo[];
  artifacts: Artifact[];
}

export interface ParsedImportResult {
  format: "GOOD" | "Mona" | null;
  artifacts: Artifact[];
  characters: ImportedCharacterInfo[];
  weapons: ImportedWeaponInfo[];
  error?: string;
}
