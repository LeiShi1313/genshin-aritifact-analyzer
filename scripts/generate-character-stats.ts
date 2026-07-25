import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import genshinDb, { type StatFunction, type StatResult } from "genshin-db";

import characterMetadata from "../src/data/characters.json";
import weaponMetadata from "../src/data/weapons.json";
import { GENSHIN_DB_VERSION, GENSHIN_GAME_VERSION } from "../src/data/version";
import type { ProgressionStatKey } from "../src/utils/characterStats/types";
import {
  PROGRESSION_SHARD_COUNT,
  progressionShardIndexForKey,
} from "../src/utils/characterStats/internal/sharding";

type CharacterSnapshot = readonly [number, number, number, number];
type WeaponSnapshot = readonly [number, number];

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

export interface ProgressionManifest {
  readonly schemaVersion: 1;
  readonly genshinDbVersion: string;
  readonly gameVersion: string;
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

const progressionStatByFightProperty: Readonly<
  Record<string, ProgressionStatKey>
> = {
  FIGHT_PROP_ATTACK_PERCENT: "attackPercent",
  FIGHT_PROP_CHARGE_EFFICIENCY: "energyRecharge",
  FIGHT_PROP_CRITICAL: "critRate",
  FIGHT_PROP_CRITICAL_HURT: "critDamage",
  FIGHT_PROP_DEFENSE_PERCENT: "defensePercent",
  FIGHT_PROP_ELEC_ADD_HURT: "electroDamageBonus",
  FIGHT_PROP_ELEMENT_MASTERY: "elementalMastery",
  FIGHT_PROP_FIRE_ADD_HURT: "pyroDamageBonus",
  FIGHT_PROP_GRASS_ADD_HURT: "dendroDamageBonus",
  FIGHT_PROP_HEAL_ADD: "healingBonus",
  FIGHT_PROP_HP_PERCENT: "hpPercent",
  FIGHT_PROP_ICE_ADD_HURT: "cryoDamageBonus",
  FIGHT_PROP_PHYSICAL_ADD_HURT: "physicalDamageBonus",
  FIGHT_PROP_ROCK_ADD_HURT: "geoDamageBonus",
  FIGHT_PROP_WATER_ADD_HURT: "hydroDamageBonus",
  FIGHT_PROP_WIND_ADD_HURT: "anemoDamageBonus",
};

const characterNames = JSON.parse(
  readFileSync(
    new URL("../public/locales/en/characters.json", import.meta.url),
    "utf8"
  )
) as Record<string, string>;

const weaponNames = JSON.parse(
  readFileSync(
    new URL("../public/locales/en/weapons.json", import.meta.url),
    "utf8"
  )
) as Record<string, string>;

const normalizeSpecialized = (
  stat: ProgressionStatKey,
  value: number
): number => {
  const baseline = stat === "critRate" ? 0.05 : stat === "critDamage" ? 0.5 : 0;
  const normalized = value - baseline;
  return Math.abs(normalized) < 1e-12 ? 0 : normalized;
};

const collectSnapshots = <Snapshot>(
  stats: StatFunction,
  toSnapshot: (result: StatResult) => Snapshot
): Record<string, Snapshot> => {
  const snapshots: Record<string, Snapshot> = {};
  for (let level = 1; level <= 100; level += 1) {
    for (let ascension = 0; ascension <= 6; ascension += 1) {
      let result: StatResult | undefined;
      try {
        result = stats(level, ascension);
      } catch {
        continue;
      }
      if (!result || result.ascension !== ascension) continue;
      snapshots[`${level}:${ascension}`] = toSnapshot(result);
    }
  }
  return snapshots;
};

const requireProgressionStat = (
  fightProperty: string | undefined,
  label: string
): ProgressionStatKey => {
  const stat = fightProperty
    ? progressionStatByFightProperty[fightProperty]
    : undefined;
  if (!stat) throw new Error(`${label} has unsupported stat ${fightProperty}`);
  return stat;
};

const characterEntity = (key: string, name: string) => {
  const query = key.startsWith("traveler_") ? "Aether" : name;
  const character = genshinDb.characters(query);
  if (!character || Array.isArray(character)) {
    throw new Error(`Character ${key} (${query}) is missing from genshin-db`);
  }
  return character;
};

const weaponEntity = (key: string, name: string) => {
  const weapon = genshinDb.weapons(name);
  if (!weapon || Array.isArray(weapon)) {
    throw new Error(`Weapon ${key} (${name}) is missing from genshin-db`);
  }
  return weapon;
};

export const buildProgressionCatalogs = (): ProgressionCatalogs => {
  if (installedGenshinDbVersion !== GENSHIN_DB_VERSION) {
    throw new Error(
      `Installed genshin-db ${installedGenshinDbVersion} does not match generated version ${GENSHIN_DB_VERSION}`
    );
  }

  const characters: Record<string, CharacterProgressionEntry> = {};
  for (const [key, metadata] of Object.entries(characterMetadata)) {
    const name = characterNames[key];
    if (!name) throw new Error(`Character ${key} is missing its English name`);
    const character = characterEntity(key, name);
    const specializedStat = requireProgressionStat(
      character.substatType,
      `Character ${key}`
    );
    const stats = collectSnapshots<CharacterSnapshot>(
      character.stats,
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
      }
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
    const name = weaponNames[key];
    if (!name) throw new Error(`Weapon ${key} is missing its English name`);
    const weapon = weaponEntity(key, name);
    const specializedStat = weapon.mainStatType
      ? requireProgressionStat(weapon.mainStatType, `Weapon ${key}`)
      : null;
    const stats = collectSnapshots<WeaponSnapshot>(weapon.stats, (result) => {
      if (result.attack === undefined || result.specialized === undefined) {
        throw new Error(`Weapon ${key} returned incomplete progression`);
      }
      return [result.attack, result.specialized];
    });
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
      schemaVersion: 1,
      genshinDbVersion: installedGenshinDbVersion,
      gameVersion: GENSHIN_GAME_VERSION,
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
