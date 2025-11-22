import { Artifact } from "./artifact";
import { Character } from "./character";
import { Weapon } from "./weapon";

/**
 * Simplified character info parsed from import formats (GOOD, etc.)
 * Similar to GCSimScriptCharacterInfo but without gcsim-specific fields
 */
export interface ImportedCharacterInfo {
  character: Character;
  level: number;
  maxLevel: number;
  constellation: number;
  /** [auto, skill, burst] */
  talents: number[];
}

/**
 * Simplified weapon info parsed from import formats (GOOD, etc.)
 * Similar to GCSimScriptWeaponInfo but with location info
 */
export interface ImportedWeaponInfo {
  weapon: Weapon;
  level: number;
  maxLevel: number;
  refinement: number;
  /** Character who currently has this weapon equipped */
  location: Character;
}

/**
 * Parsed GOOD format data
 */
export interface GOODData {
  format: string;
  version: number;
  source: string;
  characters: ImportedCharacterInfo[];
  weapons: ImportedWeaponInfo[];
  artifacts: Artifact[];
}

/**
 * Result of parsing an artifact/game data file
 */
export interface ParsedImportResult {
  format: 'GOOD' | 'Mona' | null;
  artifacts: Artifact[];
  characters: ImportedCharacterInfo[];
  weapons: ImportedWeaponInfo[];
  error?: string;
}
