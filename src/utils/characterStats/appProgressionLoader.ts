import manifestJson from "../../data/characterStats/manifest.generated.json";
import type {
  CharacterProgression,
  CharacterSheetLoadout,
  CharacterSheetProgressionData,
  ProgressionManifest,
  WeaponProgression,
} from "./types";
import {
  PROGRESSION_SHARD_COUNT,
  progressionShardIndexForKey,
} from "./internal/sharding";

type ShardLoader = () => Promise<unknown>;

const ownEntry = <Entry>(
  entries: Readonly<Record<string, Entry>>,
  key: string
): Entry | undefined =>
  Object.prototype.hasOwnProperty.call(entries, key) ? entries[key] : undefined;

const characterShardLoaders: readonly ShardLoader[] = [
  () => import("../../data/characterStats/shards/characters-00.generated.json"),
  () => import("../../data/characterStats/shards/characters-01.generated.json"),
  () => import("../../data/characterStats/shards/characters-02.generated.json"),
  () => import("../../data/characterStats/shards/characters-03.generated.json"),
  () => import("../../data/characterStats/shards/characters-04.generated.json"),
  () => import("../../data/characterStats/shards/characters-05.generated.json"),
  () => import("../../data/characterStats/shards/characters-06.generated.json"),
  () => import("../../data/characterStats/shards/characters-07.generated.json"),
  () => import("../../data/characterStats/shards/characters-08.generated.json"),
  () => import("../../data/characterStats/shards/characters-09.generated.json"),
  () => import("../../data/characterStats/shards/characters-10.generated.json"),
  () => import("../../data/characterStats/shards/characters-11.generated.json"),
  () => import("../../data/characterStats/shards/characters-12.generated.json"),
  () => import("../../data/characterStats/shards/characters-13.generated.json"),
  () => import("../../data/characterStats/shards/characters-14.generated.json"),
  () => import("../../data/characterStats/shards/characters-15.generated.json"),
];

const weaponShardLoaders: readonly ShardLoader[] = [
  () => import("../../data/characterStats/shards/weapons-00.generated.json"),
  () => import("../../data/characterStats/shards/weapons-01.generated.json"),
  () => import("../../data/characterStats/shards/weapons-02.generated.json"),
  () => import("../../data/characterStats/shards/weapons-03.generated.json"),
  () => import("../../data/characterStats/shards/weapons-04.generated.json"),
  () => import("../../data/characterStats/shards/weapons-05.generated.json"),
  () => import("../../data/characterStats/shards/weapons-06.generated.json"),
  () => import("../../data/characterStats/shards/weapons-07.generated.json"),
  () => import("../../data/characterStats/shards/weapons-08.generated.json"),
  () => import("../../data/characterStats/shards/weapons-09.generated.json"),
  () => import("../../data/characterStats/shards/weapons-10.generated.json"),
  () => import("../../data/characterStats/shards/weapons-11.generated.json"),
  () => import("../../data/characterStats/shards/weapons-12.generated.json"),
  () => import("../../data/characterStats/shards/weapons-13.generated.json"),
  () => import("../../data/characterStats/shards/weapons-14.generated.json"),
  () => import("../../data/characterStats/shards/weapons-15.generated.json"),
];

if (
  characterShardLoaders.length !== PROGRESSION_SHARD_COUNT ||
  weaponShardLoaders.length !== PROGRESSION_SHARD_COUNT
) {
  throw new Error("Progression shard loader registry is incomplete");
}

const loadShard = async <Entry>(
  loaders: readonly ShardLoader[],
  key: string
): Promise<Readonly<Record<string, Entry>>> => {
  const shardIndex = progressionShardIndexForKey(key);
  const loader = loaders[shardIndex];
  if (!loader) {
    throw new Error(`Progression shard loader ${shardIndex} is missing`);
  }
  const module = (await loader()) as {
    readonly default: Readonly<Record<string, Entry>>;
  };
  return module.default;
};

/** Loads only the character and weapon buckets needed by the active card. */
export const loadAppCharacterSheetProgression = async (
  loadout: CharacterSheetLoadout
): Promise<CharacterSheetProgressionData> => {
  const [characterShard, weaponShard] = await Promise.all([
    loadShard<CharacterProgression>(
      characterShardLoaders,
      loadout.character.key
    ),
    loadout.weapon
      ? loadShard<WeaponProgression>(weaponShardLoaders, loadout.weapon.key)
      : Promise.resolve({}),
  ]);
  const character = ownEntry(characterShard, loadout.character.key);
  const weapon = loadout.weapon
    ? ownEntry(weaponShard, loadout.weapon.key)
    : undefined;

  return {
    characters: character
      ? { [loadout.character.key]: character }
      : Object.freeze({}),
    weapons:
      loadout.weapon && weapon
        ? { [loadout.weapon.key]: weapon }
        : Object.freeze({}),
    manifest: manifestJson as ProgressionManifest,
  };
};
