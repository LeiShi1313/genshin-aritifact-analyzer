import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import characterMetadata from "../src/data/characters.json";
import artifactSetMetadata from "../src/data/sets.json";
import weaponMetadata from "../src/data/weapons.json";
import {
  GENSHIN_DATA_SOURCES,
  GENSHIN_DB_VERSION,
  GENSHIN_GAME_VERSION,
} from "../src/data/version";
import type {
  ProgressionManifest,
  ProgressionStatKey,
} from "../src/utils/characterStats/types";
import {
  PROGRESSION_SHARD_COUNT,
  progressionShardIndexForKey,
} from "../src/utils/characterStats/internal/sharding";
import { findConstantRuleAuditGaps } from "../src/utils/characterStats/internal/rules/constantRuleCoverage";
import { createGameDataCatalog } from "./game-data/catalog.mjs";

type CharacterSnapshot = readonly [number, number, number, number];
type WeaponSnapshot = readonly [number, number];
interface CatalogStatResult {
  readonly ascension: number;
  readonly hp?: number;
  readonly attack?: number;
  readonly defense?: number;
  readonly specialized?: number;
}
type CatalogStatFunction = (
  level: number,
  ascension: number
) => CatalogStatResult;

export interface CharacterProgressionEntry {
  readonly weaponType: string;
  readonly specializedStat: ProgressionStatKey;
  readonly stats: Readonly<Record<string, CharacterSnapshot>>;
}

export interface WeaponProgressionEntry {
  readonly weaponType: string;
  readonly specializedStat: ProgressionStatKey | null;
  readonly stats: Readonly<Record<string, WeaponSnapshot>>;
}

export interface ProgressionCatalogs {
  readonly manifest: ProgressionManifest;
  readonly characters: Readonly<Record<string, CharacterProgressionEntry>>;
  readonly weapons: Readonly<Record<string, WeaponProgressionEntry>>;
}

const require = createRequire(import.meta.url);
const installedGenshinDbVersion = JSON.parse(
  readFileSync(require.resolve("genshin-db/package.json"), "utf8")
).version as string;
const gameDataCatalog = createGameDataCatalog({ includeTranslations: false });
const charactersByKey = new Map(
  gameDataCatalog.characters.map((record) => [record.key, record])
);
const weaponsByKey = new Map(
  gameDataCatalog.weapons.map((record) => [record.key, record])
);

const normalizeSpecialized = (
  stat: ProgressionStatKey,
  value: number
): number => {
  const baseline = stat === "critRate" ? 0.05 : stat === "critDamage" ? 0.5 : 0;
  const normalized = value - baseline;
  return Math.abs(normalized) < 1e-12 ? 0 : normalized;
};

export interface ExpectedProgressionRange {
  readonly ascension: number;
  readonly minimumLevel: number;
  readonly maximumLevel: number;
}

const progressionRangesThrough = (
  finalAscension: number,
  finalLevel: number
): readonly ExpectedProgressionRange[] => [
  { ascension: 0, minimumLevel: 1, maximumLevel: 20 },
  { ascension: 1, minimumLevel: 20, maximumLevel: 40 },
  { ascension: 2, minimumLevel: 40, maximumLevel: 50 },
  { ascension: 3, minimumLevel: 50, maximumLevel: 60 },
  { ascension: 4, minimumLevel: 60, maximumLevel: 70 },
  ...(finalAscension >= 5
    ? [{ ascension: 5, minimumLevel: 70, maximumLevel: 80 }]
    : []),
  ...(finalAscension >= 6
    ? [{ ascension: 6, minimumLevel: 80, maximumLevel: finalLevel }]
    : []),
];

const CHARACTER_PROGRESSION_RANGES = progressionRangesThrough(6, 100);
const STANDARD_WEAPON_PROGRESSION_RANGES = progressionRangesThrough(6, 90);
const LOW_RARITY_WEAPON_PROGRESSION_RANGES = progressionRangesThrough(4, 70);

export const collectSnapshots = <Snapshot>(
  stats: CatalogStatFunction,
  toSnapshot: (result: CatalogStatResult) => Snapshot,
  ranges: readonly ExpectedProgressionRange[],
  label: string
): Record<string, Snapshot> => {
  const snapshots: Record<string, Snapshot> = {};
  for (const { ascension, minimumLevel, maximumLevel } of ranges) {
    for (let level = minimumLevel; level <= maximumLevel; level += 1) {
      let result: CatalogStatResult | undefined;
      try {
        result = stats(level, ascension);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(
          `${label} progression ${level}:${ascension} failed: ${reason}`
        );
      }
      if (!result || result.ascension !== ascension) {
        throw new Error(
          `${label} progression ${level}:${ascension} returned an invalid phase`
        );
      }
      snapshots[`${level}:${ascension}`] = toSnapshot(result);
    }
  }
  return snapshots;
};

const characterEntity = (key: string) => {
  const character = charactersByKey.get(key);
  if (!character)
    throw new Error(`Character ${key} is missing from the catalog`);
  return character;
};

const weaponEntity = (key: string) => {
  const weapon = weaponsByKey.get(key);
  if (!weapon) throw new Error(`Weapon ${key} is missing from the catalog`);
  return weapon;
};

export const buildProgressionCatalogs = (): ProgressionCatalogs => {
  if (installedGenshinDbVersion !== GENSHIN_DB_VERSION) {
    throw new Error(
      `Installed genshin-db ${installedGenshinDbVersion} does not match generated version ${GENSHIN_DB_VERSION}`
    );
  }
  if (gameDataCatalog.manifest.gameVersion !== GENSHIN_GAME_VERSION) {
    throw new Error(
      `Catalog game version ${gameDataCatalog.manifest.gameVersion} does not match ` +
        `generated version ${GENSHIN_GAME_VERSION}`
    );
  }

  const auditGaps = findConstantRuleAuditGaps({
    artifactSetKeys: Object.keys(artifactSetMetadata),
    characterKeys: Object.keys(characterMetadata),
    weaponKeys: Object.keys(weaponMetadata),
  });
  if (auditGaps.length > 0) {
    throw new Error(
      `Constant-rule audit coverage is out of date:\n${auditGaps
        .map(({ catalog, kind, key }) => `- ${catalog} ${kind}: ${key}`)
        .join("\n")}`
    );
  }

  const characters: Record<string, CharacterProgressionEntry> = {};
  for (const [key, metadata] of Object.entries(characterMetadata)) {
    const character = characterEntity(key);
    const specializedStat = character.progression
      .specializedStat as ProgressionStatKey;
    const stats = collectSnapshots<CharacterSnapshot>(
      character.progression.stats,
      (result) => {
        if (
          result.hp === undefined ||
          result.attack === undefined ||
          result.defense === undefined ||
          result.specialized === undefined
        ) {
          throw new Error(`Character ${key} returned incomplete progression`);
        }
        return [
          result.hp,
          result.attack,
          result.defense,
          normalizeSpecialized(specializedStat, result.specialized),
        ];
      },
      CHARACTER_PROGRESSION_RANGES,
      `Character ${key}`
    );
    if (Object.keys(stats).length === 0) {
      throw new Error(`Character ${key} has no progression snapshots`);
    }
    characters[key] = {
      weaponType: metadata.weapontype,
      specializedStat,
      stats,
    };
  }

  const weapons: Record<string, WeaponProgressionEntry> = {};
  for (const [key, metadata] of Object.entries(weaponMetadata)) {
    const weapon = weaponEntity(key);
    const specializedStat = weapon.progression
      .specializedStat as ProgressionStatKey | null;
    const stats = collectSnapshots<WeaponSnapshot>(
      weapon.progression.stats,
      (result) => {
        if (result.attack === undefined || result.specialized === undefined) {
          throw new Error(`Weapon ${key} returned incomplete progression`);
        }
        return [result.attack, result.specialized];
      },
      Number(metadata.rarity) <= 2
        ? LOW_RARITY_WEAPON_PROGRESSION_RANGES
        : STANDARD_WEAPON_PROGRESSION_RANGES,
      `Weapon ${key}`
    );
    if (Object.keys(stats).length === 0) {
      throw new Error(`Weapon ${key} has no progression snapshots`);
    }
    weapons[key] = {
      weaponType: metadata.weapontype,
      specializedStat,
      stats,
    };
  }

  return {
    manifest: {
      schemaVersion: 2,
      genshinDbVersion: installedGenshinDbVersion,
      gameVersion: GENSHIN_GAME_VERSION,
      sources: GENSHIN_DATA_SOURCES,
    },
    characters,
    weapons,
  };
};

const stableValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, stableValue(entry)])
    );
  }
  return value;
};

export const serializeProgressionCatalog = (catalog: unknown): string =>
  `${JSON.stringify(stableValue(catalog))}\n`;

export const buildProgressionShards = <Entry>(
  catalog: Readonly<Record<string, Entry>>
): readonly Record<string, Entry>[] => {
  const shards = Array.from(
    { length: PROGRESSION_SHARD_COUNT },
    () => ({} as Record<string, Entry>)
  );
  for (const [key, entry] of Object.entries(catalog)) {
    shards[progressionShardIndexForKey(key)][key] = entry;
  }
  return shards;
};

const outputFiles = {
  characters: "src/data/characterStats/characters.generated.json",
  weapons: "src/data/characterStats/weapons.generated.json",
  manifest: "src/data/characterStats/manifest.generated.json",
} as const;

export const writeProgressionCatalogs = (check = false): void => {
  const catalogs = buildProgressionCatalogs();
  const writeGeneratedFile = (relativePath: string, value: unknown) => {
    const content = serializeProgressionCatalog(value);
    const path = resolve(relativePath);
    if (check) {
      if (!existsSync(path) || readFileSync(path, "utf8") !== content) {
        throw new Error(`${relativePath} is out of date`);
      }
      return;
    }
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content, "utf8");
  };

  for (const [catalog, relativePath] of Object.entries(outputFiles)) {
    writeGeneratedFile(
      relativePath,
      catalogs[catalog as keyof ProgressionCatalogs]
    );
  }

  const writeShards = <Entry>(
    catalog: "characters" | "weapons",
    entries: Readonly<Record<string, Entry>>
  ) => {
    buildProgressionShards(entries).forEach((shard, index) => {
      writeGeneratedFile(
        `src/data/characterStats/shards/${catalog}-${String(index).padStart(
          2,
          "0"
        )}.generated.json`,
        shard
      );
    });
  };
  writeShards("characters", catalogs.characters);
  writeShards("weapons", catalogs.weapons);
};

const isDirectExecution =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  writeProgressionCatalogs(process.argv.includes("--check"));
}
