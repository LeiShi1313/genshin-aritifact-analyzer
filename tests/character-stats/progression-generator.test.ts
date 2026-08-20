import assert from "node:assert/strict";
import test from "node:test";

import characterMetadata from "../../src/data/characters.json";
import weaponMetadata from "../../src/data/weapons.json";
import {
  buildProgressionCatalogs,
  buildProgressionShards,
  collectSnapshots,
  serializeProgressionCatalog,
} from "../../scripts/generate-character-stats";
import {
  PROGRESSION_SHARD_COUNT,
  progressionShardIndexForKey,
} from "../../src/utils/characterStats/internal/sharding";
import {
  AUDITED_ARTIFACT_SET_CONSTANT_KEYS,
  AUDITED_CHARACTER_CONSTANT_KEYS,
  AUDITED_WEAPON_CONSTANT_KEYS,
  findConstantRuleAuditGaps,
} from "../../src/utils/characterStats/internal/rules/constantRuleCoverage";
import artifactSetMetadata from "../../src/data/sets.json";

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
    schemaVersion: 2,
    genshinDbVersion: "5.2.12",
    gameVersion: "7.0",
    sources: [
      {
        id: "genshin-db",
        role: "primary",
        version: "5.2.12",
        gameVersion: "6.7",
      },
      {
        id: "enka-network",
        revision: "8ecab329af0ffc39b4ad058d46c66a2fdb1379f1",
        role: "fallback",
      },
      {
        id: "genshin-data",
        role: "release-catalog",
        version: "0.62.0",
      },
    ],
  });
});

test("constant-rule audit coverage rejects new and stale catalog keys", () => {
  assert.deepEqual(
    findConstantRuleAuditGaps({
      artifactSetKeys: Object.keys(artifactSetMetadata),
      characterKeys: Object.keys(characterMetadata),
      weaponKeys: Object.keys(weaponMetadata),
    }),
    []
  );

  assert.deepEqual(
    findConstantRuleAuditGaps({
      artifactSetKeys: [
        ...AUDITED_ARTIFACT_SET_CONSTANT_KEYS,
        "future_artifact_set",
      ],
      characterKeys: AUDITED_CHARACTER_CONSTANT_KEYS.filter(
        (key) => key !== "raiden_shogun"
      ),
      weaponKeys: [...AUDITED_WEAPON_CONSTANT_KEYS, "future_weapon"],
    }),
    [
      {
        catalog: "artifact-set",
        kind: "unaudited",
        key: "future_artifact_set",
      },
      { catalog: "character", kind: "stale", key: "raiden_shogun" },
      { catalog: "weapon", kind: "unaudited", key: "future_weapon" },
    ]
  );
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

  const odette = catalogs.characters.odette;
  assert.equal(odette.specializedStat, "critDamage");
  assert.deepEqual(
    odette.stats["90:6"],
    [12980.665588799999, 334.849732, 786.99967488, 0.384]
  );
});

test("weapon snapshots include base attack, secondary stats, and rarity-specific caps", () => {
  const engulfing = catalogs.weapons.engulfing_lightning;
  assert.equal(engulfing.specializedStat, "energyRecharge");
  assert.deepEqual(engulfing.stats["90:6"], [608.0745972, 0.55128]);

  const dullBlade = catalogs.weapons.dull_blade;
  assert.equal(dullBlade.specializedStat, null);
  assert.equal(dullBlade.stats["70:4"][0], 185.42615999999998);
  assert.equal(dullBlade.stats["80:5"], undefined);

  const whitelake = catalogs.weapons.whitelake_frostfeather;
  assert.equal(whitelake.specializedStat, "critRate");
  assert.deepEqual(whitelake.stats["90:6"], [674.3345459999999, 0.220512]);
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

test("progression collection fails loudly when an expected snapshot throws", () => {
  const stats = ((level: number, ascension: number) => {
    if (level === 2) throw new Error("fixture failure");
    return { ascension };
  }) as any;

  assert.throws(
    () =>
      collectSnapshots(
        stats,
        (result) => result.ascension,
        [{ ascension: 0, minimumLevel: 1, maximumLevel: 2 }],
        "Fixture"
      ),
    /Fixture progression 2:0 failed: fixture failure/
  );
});
