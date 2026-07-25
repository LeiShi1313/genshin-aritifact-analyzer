import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { AttributeType } from "../../src/genshin/attribute";
import { Character } from "../../src/genshin/character";
import { getArtifactMainStatValue } from "../../src/utils/artifactMainStat";
import { calculateCharacterSheetStats } from "../../src/utils/characterStats";
import { adaptAppCharacterSheetLoadout } from "../../src/utils/characterStats/appAdapter";

test("uses canonical artifact main-stat values across rarities", () => {
  assert.equal(getArtifactMainStatValue(AttributeType.HP, 1, 4), 324);
  assert.equal(getArtifactMainStatValue(AttributeType.ATK, 2, 4), 36);
  assert.equal(
    getArtifactMainStatValue(AttributeType.DEF_PERCENT, 3, 12),
    0.288
  );
  assert.equal(
    getArtifactMainStatValue(AttributeType.ENERGY_RECHARGE, 4, 16),
    0.387
  );

  assert.equal(getArtifactMainStatValue(AttributeType.HP, 5, 20), 4780);
  assert.equal(getArtifactMainStatValue(AttributeType.ATK, 5, 20), 311);
  assert.equal(
    getArtifactMainStatValue(AttributeType.ATK_PERCENT, 5, 20),
    0.466
  );
  assert.equal(
    getArtifactMainStatValue(AttributeType.ELEMENTAL_MASTERY, 5, 20),
    186.5
  );
  assert.equal(
    getArtifactMainStatValue(AttributeType.ENERGY_RECHARGE, 5, 20),
    0.518
  );
  assert.equal(
    getArtifactMainStatValue(AttributeType.CRIT_RATE, 5, 20),
    0.311
  );
  assert.equal(
    getArtifactMainStatValue(AttributeType.CRIT_DAMAGE, 5, 20),
    0.622
  );
  assert.equal(
    getArtifactMainStatValue(AttributeType.HEALING_BONUS, 5, 20),
    0.359
  );
  assert.equal(
    getArtifactMainStatValue(AttributeType.ELECTRO_DAMAGE_BONUS, 5, 20),
    0.466
  );

  assert.equal(getArtifactMainStatValue(AttributeType.CRIT_RATE, 5, 21), undefined);
  assert.equal(getArtifactMainStatValue(AttributeType.ATK, 2, 5), undefined);
  assert.equal(getArtifactMainStatValue(AttributeType.CRIT_RATE, 0, 0), undefined);
});

test("GOOD parser through adapter and calculator produces exact sheet totals", async () => {
  // Keep the legacy import parser outside this focused strict-TS project while
  // still exercising it at runtime as part of the real production pipeline.
  const importModulePath = "../../src/utils/" + "import";
  const { parseGOODFormat } = await import(importModulePath);
  const fixture = JSON.parse(
    readFileSync(
      new URL("../fixtures/character-showcase.good.json", import.meta.url),
      "utf8"
    )
  );
  const parsed = parseGOODFormat(fixture);
  const character = parsed.characters.find(
    (entry: any) => entry.character === Character.RAIDEN_SHOGUN
  );
  const weapon = parsed.weapons.find(
    (entry: any) => entry.location === Character.RAIDEN_SHOGUN
  );
  const artifacts = parsed.artifacts.filter(
    (entry: any) => entry.character === Character.RAIDEN_SHOGUN
  );

  assert.ok(character);
  assert.ok(weapon);
  assert.deepEqual(
    artifacts.map((entry: any) => entry.mainAttribute?.value),
    [4780, 311, 0.518, 0.466, 0.311]
  );

  // Simulate artifacts persisted by the former approximate importer. The app
  // adapter must derive deterministic main stats instead of trusting them.
  for (const artifact of artifacts) {
    if (artifact.mainAttribute) artifact.mainAttribute.value = 999;
  }
  const adapted = adaptAppCharacterSheetLoadout({
    character,
    weapon,
    artifacts,
  });
  assert.equal(adapted.status, "ok");
  if (adapted.status !== "ok") return;
  assert.deepEqual(
    adapted.loadout.artifacts.map((entry) => entry.mainStat.value),
    [4780, 311, 0.518, 0.466, 0.311]
  );

  const result = calculateCharacterSheetStats(adapted.loadout);
  assert.equal(result.status, "partial");
  if (result.status === "invalid") return;
  assert.equal(Math.round(result.stats.maxHp), 17687);
  assert.equal(Math.round(result.stats.attack), 1530);
  assert.equal(result.stats.elementalMastery, 46);
  assert.equal(result.stats.critRate, 1.176);
  assert.equal(result.stats.critDamage, 1.278);
  assert.equal(result.stats.damageBonus.electro, 0.466);
});

test("GOOD character imports preserve post-90 progression caps", async () => {
  const importModulePath = "../../src/utils/" + "import";
  const { parseGOODFormat } = await import(importModulePath);
  const parsed = parseGOODFormat({
    format: "GOOD",
    characters: [
      { key: "RaidenShogun", level: 93, ascension: 6 },
      { key: "Furina", level: 100, ascension: 6 },
    ],
  });

  assert.deepEqual(
    parsed.characters.map((entry: any) => [entry.level, entry.maxLevel]),
    [
      [93, 95],
      [100, 100],
    ]
  );
});
