import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateCharacterSheetStats,
  type CharacterSheetLoadout,
} from "../../src/utils/characterStats";

const closeTo = (actual: number, expected: number, tolerance = 1e-10) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} was not within ${tolerance} of ${expected}`
  );
};

const raidenLoadout = (): CharacterSheetLoadout => ({
  character: { key: "raiden_shogun", level: 90, ascension: 6 },
  weapon: {
    key: "engulfing_lightning",
    level: 90,
    ascension: 6,
    refinement: 1,
  },
  artifacts: [],
});

test("calculates an unbuffed character sheet from character and weapon progression", () => {
  const result = calculateCharacterSheetStats(raidenLoadout());

  assert.equal(result.status, "complete");
  if (result.status === "invalid") return;
  closeTo(result.stats.maxHp, 12907.189733140001);
  closeTo(result.base.attack, 337.2415138 + 608.0745972);
  closeTo(result.stats.attack, result.base.attack);
  closeTo(result.stats.defense, 789.30533799);
  closeTo(result.stats.energyRecharge, 1.87128);
  closeTo(result.stats.critRate, 0.05);
  closeTo(result.stats.critDamage, 0.5);
  assert.deepEqual(result.appliedRuleIds, []);
});

test("combines artifact flat and percent stats without depending on artifact order", () => {
  const first: CharacterSheetLoadout = {
    ...raidenLoadout(),
    artifacts: [
      {
        slot: "flower",
        mainStat: { stat: "hpFlat", value: 4780 },
        substats: [
          { stat: "attackPercent", value: 0.1 },
          { stat: "critRate", value: 0.07 },
        ],
      },
      {
        slot: "sands",
        mainStat: { stat: "attackPercent", value: 0.466 },
        substats: [
          { stat: "attackFlat", value: 40 },
          { stat: "elementalMastery", value: 42 },
        ],
      },
    ],
  };
  const second = { ...first, artifacts: [...first.artifacts].reverse() };

  const firstResult = calculateCharacterSheetStats(first);
  const secondResult = calculateCharacterSheetStats(second);

  assert.equal(firstResult.status, "complete");
  assert.deepEqual(secondResult, firstResult);
  if (firstResult.status === "invalid") return;
  closeTo(firstResult.stats.maxHp, firstResult.base.hp + 4780);
  closeTo(firstResult.stats.attack, firstResult.base.attack * (1 + 0.566) + 40);
  closeTo(firstResult.stats.critRate, 0.12);
  assert.equal(firstResult.stats.elementalMastery, 42);
});

test("applies direct weapon constants but excludes derived weapon effects", () => {
  const loadout: CharacterSheetLoadout = {
    ...raidenLoadout(),
    weapon: {
      key: "staff_of_homa",
      level: 90,
      ascension: 6,
      refinement: 1,
    },
  };

  const result = calculateCharacterSheetStats(loadout);

  assert.equal(result.status, "complete");
  if (result.status === "invalid") return;
  closeTo(result.stats.maxHp, result.base.hp * 1.2);
  closeTo(result.stats.attack, result.base.attack);
  assert.equal(result.appliedRuleIds.includes("weapon.staff_of_homa.hp"), true);
});

test("applies ascension-gated character constants and expands all-element damage", () => {
  const calculateXingqiu = (ascension: number) =>
    calculateCharacterSheetStats({
      character: { key: "xingqiu", level: ascension >= 4 ? 70 : 60, ascension },
      weapon: {
        key: "mistsplitter_reforged",
        level: 90,
        ascension: 6,
        refinement: 1,
      },
      artifacts: [],
    });

  const beforeA4 = calculateXingqiu(3);
  const afterA4 = calculateXingqiu(4);

  assert.notEqual(beforeA4.status, "invalid");
  assert.notEqual(afterA4.status, "invalid");
  if (beforeA4.status === "invalid" || afterA4.status === "invalid") return;
  assert.equal(beforeA4.stats.damageBonus.hydro, 0.12);
  assert.equal(afterA4.stats.damageBonus.hydro, 0.32);
  for (const element of [
    "anemo",
    "cryo",
    "dendro",
    "electro",
    "geo",
    "pyro",
  ] as const) {
    assert.equal(afterA4.stats.damageBonus[element], 0.12);
  }
  assert.equal(afterA4.stats.damageBonus.physical, 0);
});

test("combines Kokomi's innate modifiers with direct weapon constants", () => {
  const result = calculateCharacterSheetStats({
    character: { key: "sangonomiya_kokomi", level: 90, ascension: 6 },
    weapon: {
      key: "everlasting_moonglow",
      level: 90,
      ascension: 6,
      refinement: 1,
    },
    artifacts: [],
  });

  assert.equal(result.status, "complete");
  if (result.status === "invalid") return;
  closeTo(result.stats.critRate, -0.95);
  closeTo(result.stats.healingBonus, 0.35);
});

test("returns structured invalid and partial results instead of silent zeroes", () => {
  const wrongWeapon = calculateCharacterSheetStats({
    ...raidenLoadout(),
    weapon: {
      key: "mistsplitter_reforged",
      level: 90,
      ascension: 6,
      refinement: 1,
    },
  });
  assert.equal(wrongWeapon.status, "invalid");
  assert.equal(wrongWeapon.issues[0]?.code, "WEAPON_TYPE_MISMATCH");

  const missingWeapon = calculateCharacterSheetStats({
    ...raidenLoadout(),
    weapon: null,
  });
  assert.equal(missingWeapon.status, "partial");
  assert.equal(missingWeapon.issues[0]?.code, "MISSING_WEAPON");

  const activeSet = calculateCharacterSheetStats({
    ...raidenLoadout(),
    artifacts: [
      {
        slot: "flower",
        setKey: "emblem_of_severed_fate",
        mainStat: { stat: "hpFlat", value: 4780 },
        substats: [],
      },
      {
        slot: "plume",
        setKey: "emblem_of_severed_fate",
        mainStat: { stat: "attackFlat", value: 311 },
        substats: [],
      },
    ],
  });
  assert.equal(activeSet.status, "partial");
  assert.equal(
    activeSet.issues.some(
      (issue) => issue.code === "ARTIFACT_SET_CONSTANTS_UNSUPPORTED"
    ),
    true
  );
});

test("rejects invalid refinement and duplicate artifact slots without mutating input", () => {
  const loadout = raidenLoadout();
  const invalidRefinement = {
    ...loadout,
    weapon: { ...loadout.weapon!, refinement: 6 },
  } as unknown as CharacterSheetLoadout;
  const duplicateSlots: CharacterSheetLoadout = {
    ...loadout,
    artifacts: [
      {
        slot: "flower",
        mainStat: { stat: "hpFlat", value: 100 },
        substats: [],
      },
      {
        slot: "flower",
        mainStat: { stat: "hpFlat", value: 200 },
        substats: [],
      },
    ],
  };
  const before = JSON.stringify(duplicateSlots);
  const negativeArtifactValue: CharacterSheetLoadout = {
    ...loadout,
    artifacts: [
      {
        slot: "flower",
        mainStat: { stat: "hpFlat", value: -1 },
        substats: [],
      },
    ],
  };

  assert.equal(
    calculateCharacterSheetStats(invalidRefinement).status,
    "invalid"
  );
  assert.equal(calculateCharacterSheetStats(duplicateSlots).status, "invalid");
  assert.equal(
    calculateCharacterSheetStats(negativeArtifactValue).status,
    "invalid"
  );
  assert.equal(JSON.stringify(duplicateSlots), before);
});
