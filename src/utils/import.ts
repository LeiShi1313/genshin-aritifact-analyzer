import { Artifact } from "../genshin/artifact";
import { Character } from "../genshin/character";
import { Weapon } from "../genshin/weapon";
import {
  ImportedCharacterInfo,
  ImportedWeaponInfo,
  GOODData,
  ParsedImportResult,
} from "../genshin/import";
import { deserializeFromGood, deserializeFromMona } from "./artifact";
import { monaPositionToAttributePosition } from "./attribute";
import { characterFromGoodName } from "./character";
import { enumToStringKey } from "./enum";

/**
 * Convert ascension level to max level
 */
const ascensionToMaxLevel = (ascension: number): number => {
  const maxLevels = [20, 40, 50, 60, 70, 80, 90];
  return maxLevels[Math.min(ascension, 6)] ?? 90;
};

/**
 * Convert GOOD weapon key to Weapon enum
 * GOOD format uses PascalCase (e.g., "TheStringless"), enum uses SCREAMING_SNAKE_CASE (e.g., "THE_STRINGLESS")
 */
export const weaponFromGoodName = (name: string): Weapon => {
  if (!name || name === '') return Weapon.WEAPON_UNSPECIFIED;

  // Build lookup map: normalized key -> Weapon enum value
  const weapons: Record<string, Weapon> = {};
  enumToStringKey(Weapon).forEach((key) => {
    // Remove underscores and convert to uppercase for comparison
    weapons[key.replace(/_/g, '').toUpperCase()] = Weapon[key as keyof typeof Weapon];
  });

  // Normalize GOOD name: remove spaces/special chars and uppercase
  const normalizedName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return weapons[normalizedName] ?? Weapon.WEAPON_UNSPECIFIED;
};

/**
 * Parse a GOOD format character object
 */
export const deserializeCharacterFromGood = (input: any): ImportedCharacterInfo => {
  const character = characterFromGoodName(input.key);
  const ascension = input.ascension ?? 0;
  const talent = input.talent ?? { auto: 1, skill: 1, burst: 1 };

  return {
    character,
    level: input.level ?? 1,
    maxLevel: ascensionToMaxLevel(ascension),
    constellation: input.constellation ?? 0,
    talents: [talent.auto ?? 1, talent.skill ?? 1, talent.burst ?? 1],
  };
};

/**
 * Parse a GOOD format weapon object
 */
export const deserializeWeaponFromGood = (input: any): ImportedWeaponInfo => {
  const weapon = weaponFromGoodName(input.key);
  const ascension = input.ascension ?? 0;

  return {
    weapon,
    level: input.level ?? 1,
    maxLevel: ascensionToMaxLevel(ascension),
    refinement: input.refinement ?? 1,
    location: characterFromGoodName(input.location ?? ''),
  };
};

/**
 * Parse a complete GOOD format JSON object
 */
export const parseGOODFormat = (content: any): GOODData => {
  const characters: ImportedCharacterInfo[] = [];
  const weapons: ImportedWeaponInfo[] = [];
  const artifacts: Artifact[] = [];

  // Parse characters
  if (Array.isArray(content.characters)) {
    for (const char of content.characters) {
      characters.push(deserializeCharacterFromGood(char));
    }
  }

  // Parse weapons
  if (Array.isArray(content.weapons)) {
    for (const weap of content.weapons) {
      weapons.push(deserializeWeaponFromGood(weap));
    }
  }

  // Parse artifacts
  if (Array.isArray(content.artifacts)) {
    for (const art of content.artifacts) {
      artifacts.push(deserializeFromGood(art));
    }
  }

  return {
    format: content.format ?? 'GOOD',
    version: content.version ?? 1,
    source: content.source ?? 'Unknown',
    characters,
    weapons,
    artifacts,
  };
};

/**
 * Check if content is in GOOD format
 */
export const isGOODFormat = (content: any): boolean => {
  return content?.format === 'GOOD';
};

/**
 * Check if content is in Mona format (produced by tools like YAS scanner)
 */
export const isMonaFormat = (content: any): boolean => {
  return (
    content?.version === '1' &&
    Object.keys(monaPositionToAttributePosition).every((k) => k in content)
  );
};

/**
 * Parse artifact file content (supports GOOD and Mona formats)
 */
export const parseImportFile = (content: any): ParsedImportResult => {
  if (isGOODFormat(content)) {
    const goodData = parseGOODFormat(content);
    return {
      format: 'GOOD',
      artifacts: goodData.artifacts,
      characters: goodData.characters,
      weapons: goodData.weapons,
    };
  }

  if (isMonaFormat(content)) {
    const artifacts: Artifact[] = [];
    for (const k of Object.keys(content)) {
      if (k === 'version') continue;
      for (const art of content[k]) {
        artifacts.push(deserializeFromMona(art));
      }
    }
    return {
      format: 'Mona',
      artifacts,
      characters: [],
      weapons: [],
    };
  }

  return {
    format: null,
    artifacts: [],
    characters: [],
    weapons: [],
    error: 'Unsupported file format',
  };
};

// Re-export types for convenience
export type {
  ImportedCharacterInfo,
  ImportedWeaponInfo,
  GOODData,
  ParsedImportResult,
} from "../genshin/import";
