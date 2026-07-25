import assert from "node:assert/strict";
import test from "node:test";

import characterMetadata from "../../src/data/characters.json";
import weaponMetadata from "../../src/data/weapons.json";
import {
  buildProgressionCatalogs,
  buildProgressionShards,
  serializeProgressionCatalog,
} from "../../scripts/generate-character-stats";
import {
  PROGRESSION_SHARD_COUNT,
  progressionShardIndexForKey,
} from "../../src/utils/characterStats/internal/sharding";

const catalogs = buildProgressionCatalogs();

test("progression generation covers every supported character and weapon", () => {
  assert.equal(
    Object.keys(catalogs.characters).length,
    Object.keys(characterMetadata).length
  );
  assert.equal(
    Object.keys(catalogs.weapons).length,
    Object.keys(weaponMetadata).length
  );
  assert.deepEqual(catalogs.manifest, {
    schemaVersion: 1,
    genshinDbVersion: "5.2.12",
    gameVersion: "6.7",
  });
});

test("character snapshots preserve ascension boundaries and normalize built-in crit baselines", () => {
  const raiden = catalogs.characters.raiden_shogun;
  assert.equal(raiden.specializedStat, "energyRecharge");
  assert.deepEqual(
    raiden.stats["90:6"],
    [12907.189733140001, 337.2415138, 789.30533799, 0.32]
  );
  assert.notDeepEqual(raiden.stats["20:0"], raiden.stats["20:1"]);

  const sandrone = catalogs.characters.sandrone;
  assert.equal(sandrone.specializedStat, "critRate");
  assert.equal(sandrone.stats["1:0"][3], 0);
  assert.equal(sandrone.stats["90:6"][3], 0.192);
});

test("weapon snapshots include base attack, secondary stats, and rarity-specific caps", () => {
  const engulfing = catalogs.weapons.engulfing_lightning;
  assert.equal(engulfing.specializedStat, "energyRecharge");
  assert.deepEqual(engulfing.stats["90:6"], [608.0745972, 0.55128]);

  const dullBlade = catalogs.weapons.dull_blade;
  assert.equal(dullBlade.specializedStat, null);
  assert.equal(dullBlade.stats["70:4"][0], 185.42615999999998);
  assert.equal(dullBlade.stats["80:5"], undefined);
});

test("generated catalogs serialize deterministically", () => {
  const first = serializeProgressionCatalog(catalogs.characters);
  const second = serializeProgressionCatalog(catalogs.characters);

  assert.equal(first, second);
  assert.equal(first.endsWith("\n"), true);
});

test("progression catalogs split deterministically into browser-loadable shards", () => {
  const characterShards = buildProgressionShards(catalogs.characters);
  const weaponShards = buildProgressionShards(catalogs.weapons);

  assert.equal(characterShards.length, PROGRESSION_SHARD_COUNT);
  assert.equal(weaponShards.length, PROGRESSION_SHARD_COUNT);
  assert.strictEqual(
    characterShards[progressionShardIndexForKey("raiden_shogun")].raiden_shogun,
    catalogs.characters.raiden_shogun
  );
  assert.strictEqual(
    weaponShards[progressionShardIndexForKey("engulfing_lightning")]
      .engulfing_lightning,
    catalogs.weapons.engulfing_lightning
  );
  assert.equal(
    characterShards.reduce(
      (count, shard) => count + Object.keys(shard).length,
      0
    ),
    Object.keys(catalogs.characters).length
  );
  assert.equal(
    weaponShards.reduce((count, shard) => count + Object.keys(shard).length, 0),
    Object.keys(catalogs.weapons).length
  );
});
