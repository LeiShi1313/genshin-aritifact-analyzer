import assert from "node:assert/strict";
import test from "node:test";

import {
  ARTIFACT_SET_CONSTANT_RULES,
  CHARACTER_CONSTANT_RULES,
  WEAPON_CONSTANT_RULES,
} from "../../src/utils/characterStats/internal/rules/constantRules";

const weaponRule = (weaponKey: string) => {
  const rule = WEAPON_CONSTANT_RULES.find(
    (candidate) => candidate.weaponKey === weaponKey
  );
  assert.ok(rule, `missing constant rule for ${weaponKey}`);
  return rule;
};

const artifactSetRule = (setKey: string) => {
  const rule = ARTIFACT_SET_CONSTANT_RULES.find(
    (candidate) => candidate.setKey === setKey
  );
  assert.ok(rule, `missing constant rule for ${setKey}`);
  return rule;
};

test("the pinned miao ruleset contains four character cases and forty weapon cases", () => {
  assert.equal(CHARACTER_CONSTANT_RULES.length, 4);
  assert.equal(
    CHARACTER_CONSTANT_RULES.flatMap((rule) => rule.effects).length,
    5
  );
  assert.equal(WEAPON_CONSTANT_RULES.length, 40);
  assert.equal(new Set(WEAPON_CONSTANT_RULES.map((rule) => rule.id)).size, 40);
  assert.equal(
    new Set(WEAPON_CONSTANT_RULES.map((rule) => rule.weaponKey)).size,
    40
  );
});

test("character constants preserve miao values while fixing Xingqiu's A4 eligibility", () => {
  const byCharacter = new Map(
    CHARACTER_CONSTANT_RULES.map((rule) => [rule.characterKey, rule])
  );

  assert.deepEqual(byCharacter.get("sangonomiya_kokomi"), {
    id: "character.sangonomiya_kokomi.flawless_strategy",
    characterKey: "sangonomiya_kokomi",
    minimumAscension: 0,
    effects: [
      { stat: "critRate", value: -1 },
      { stat: "healingBonus", value: 0.25 },
    ],
  });
  assert.deepEqual(byCharacter.get("xingqiu"), {
    id: "character.xingqiu.blades_amidst_raindrops",
    characterKey: "xingqiu",
    minimumAscension: 4,
    effects: [{ stat: "hydroDamageBonus", value: 0.2 }],
  });
  assert.deepEqual(byCharacter.get("lauma")?.effects, [
    { stat: "elementalMastery", value: 200 },
  ]);
  assert.deepEqual(byCharacter.get("nefer")?.effects, [
    { stat: "elementalMastery", value: 100 },
  ]);
});

test("weapon constants cover every audited modifier family", () => {
  const counts = new Map<string, number>();
  for (const effect of WEAPON_CONSTANT_RULES.flatMap((rule) => rule.effects)) {
    counts.set(effect.stat, (counts.get(effect.stat) ?? 0) + 1);
  }

  assert.deepEqual(Object.fromEntries([...counts.entries()].sort()), {
    allElementalDamageBonus: 5,
    attackPercent: 11,
    critDamage: 2,
    critRate: 4,
    defensePercent: 4,
    elementalMastery: 2,
    healingBonus: 1,
    hpPercent: 7,
    shieldStrength: 4,
  });
});

test("weapon refinement values are explicit R1-R5 ratio tuples", () => {
  for (const rule of WEAPON_CONSTANT_RULES) {
    for (const effect of rule.effects) {
      assert.equal(effect.valuesByRefinement.length, 5, rule.id);
      for (const value of effect.valuesByRefinement) {
        assert.equal(Number.isFinite(value), true, rule.id);
      }
    }
  }

  assert.deepEqual(weaponRule("staff_of_homa").effects, [
    {
      stat: "hpPercent",
      valuesByRefinement: [0.2, 0.25, 0.3, 0.35, 0.4],
    },
  ]);
  assert.deepEqual(weaponRule("lumidouce_elegy").effects, [
    {
      stat: "attackPercent",
      valuesByRefinement: [0.15, 0.1875, 0.225, 0.2625, 0.3],
    },
  ]);
  assert.deepEqual(weaponRule("nocturnes_curtain_call").effects, [
    {
      stat: "hpPercent",
      valuesByRefinement: [0.1, 0.12, 0.14, 0.16, 0.18],
    },
  ]);
  assert.deepEqual(weaponRule("starcallers_watch").effects, [
    {
      stat: "elementalMastery",
      valuesByRefinement: [100, 125, 150, 175, 200],
    },
  ]);
});

test("artifact set constants cover every always-active character-sheet bonus", () => {
  assert.equal(ARTIFACT_SET_CONSTANT_RULES.length, 45);
  assert.equal(
    new Set(ARTIFACT_SET_CONSTANT_RULES.map((rule) => rule.id)).size,
    ARTIFACT_SET_CONSTANT_RULES.length
  );
  assert.equal(
    new Set(ARTIFACT_SET_CONSTANT_RULES.map((rule) => rule.setKey)).size,
    ARTIFACT_SET_CONSTANT_RULES.length
  );

  assert.deepEqual(artifactSetRule("emblem_of_severed_fate").effects, [
    { stat: "energyRecharge", value: 0.2 },
  ]);
  assert.deepEqual(artifactSetRule("gladiators_finale").effects, [
    { stat: "attackPercent", value: 0.18 },
  ]);
  assert.deepEqual(artifactSetRule("adventurer").effects, [
    { stat: "hpFlat", value: 1000 },
  ]);
  assert.deepEqual(artifactSetRule("lucky_dog").effects, [
    { stat: "defenseFlat", value: 100 },
  ]);
});

test("constant rule data is platform-neutral JSON without executable callbacks", () => {
  const serialized = JSON.stringify({
    artifactSets: ARTIFACT_SET_CONSTANT_RULES,
    characters: CHARACTER_CONSTANT_RULES,
    weapons: WEAPON_CONSTANT_RULES,
  });
  const parsed = JSON.parse(serialized);

  assert.deepEqual(parsed.artifactSets, ARTIFACT_SET_CONSTANT_RULES);
  assert.deepEqual(parsed.characters, CHARACTER_CONSTANT_RULES);
  assert.deepEqual(parsed.weapons, WEAPON_CONSTANT_RULES);
  assert.equal(serialized.includes("function"), false);
});
