import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateCharacterSheetStats,
  type CharacterSheetLoadout,
} from "../../src/utils/characterStats";
import { calculateCharacterSheetStatsFromProgression } from "../../src/utils/characterStats/calculateCharacterSheetStats";
import {
  AUDITED_CHARACTER_CONSTANT_KEYS,
  AUDITED_WEAPON_CONSTANT_KEYS,
} from "../../src/utils/characterStats/internal/rules/constantRuleCoverage";
import { characterProgression, weaponProgression } from "../../src/utils/characterStats/internal/progression";

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
        setKey: "flower_test_set",
        mainStat: { stat: "hpFlat", value: 4780 },
        substats: [
          { stat: "attackPercent", value: 0.1 },
          { stat: "critRate", value: 0.07 },
        ],
      },
      {
        slot: "sands",
        setKey: "sands_test_set",
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

  const inheritedKey = calculateCharacterSheetStats({
    ...raidenLoadout(),
    character: { key: "constructor", level: 90, ascension: 6 },
  });
  assert.deepEqual(inheritedKey, {
    status: "invalid",
    issues: [{ code: "CHARACTER_NOT_FOUND", sourceKey: "constructor" }],
  });
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
        setKey: "second_test_set",
        mainStat: { stat: "hpFlat", value: 100 },
        substats: [],
      },
      {
        slot: "flower",
        setKey: "negative_test_set",
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
        setKey: "negative_test_set",
        mainStat: { stat: "hpFlat", value: -1 },
        substats: [],
      },
    ],
  };
  const invalidSlot = {
    ...loadout,
    artifacts: [
      {
        slot: "invalid-slot",
        setKey: "invalid_slot_test_set",
        mainStat: { stat: "hpFlat", value: 100 },
        substats: [],
      },
    ],
  } as unknown as CharacterSheetLoadout;

  assert.equal(
    calculateCharacterSheetStats(invalidRefinement).status,
    "invalid"
  );
  assert.equal(calculateCharacterSheetStats(duplicateSlots).status, "invalid");
  assert.equal(
    calculateCharacterSheetStats(negativeArtifactValue).status,
    "invalid"
  );
  assert.deepEqual(calculateCharacterSheetStats(invalidSlot), {
    status: "invalid",
    issues: [{ code: "INVALID_ARTIFACT_SLOT", sourceKey: "invalid-slot" }],
  });
  assert.equal(JSON.stringify(duplicateSlots), before);
});

test("rejects finite artifact inputs that overflow the calculated sheet", () => {
  const result = calculateCharacterSheetStats({
    ...raidenLoadout(),
    artifacts: [
      {
        slot: "flower",
        setKey: "overflow_test_set",
        mainStat: { stat: "hpFlat", value: 4780 },
        substats: [{ stat: "hpPercent", value: Number.MAX_VALUE }],
      },
    ],
  });

  assert.deepEqual(result, {
    status: "invalid",
    issues: [{ code: "CALCULATION_OVERFLOW", sourceKey: "stats.maxHp" }],
  });
});

test("rejects impossible artifact main stats and substat combinations", () => {
  const impossibleMain: CharacterSheetLoadout = {
    ...raidenLoadout(),
    artifacts: [
      {
        slot: "flower",
        setKey: "impossible_main_test_set",
        mainStat: { stat: "pyroDamageBonus", value: 0.466 },
        substats: [],
      },
    ],
  };
  const impossibleSubstat: CharacterSheetLoadout = {
    ...raidenLoadout(),
    artifacts: [
      {
        slot: "circlet",
        setKey: "impossible_substat_test_set",
        mainStat: { stat: "critRate", value: 0.311 },
        substats: [
          { stat: "critRate", value: 0.031 },
          { stat: "healingBonus", value: 0.054 },
        ],
      },
    ],
  };
  const duplicateSubstat: CharacterSheetLoadout = {
    ...raidenLoadout(),
    artifacts: [
      {
        slot: "sands",
        setKey: "duplicate_substat_test_set",
        mainStat: { stat: "energyRecharge", value: 0.518 },
        substats: [
          { stat: "critRate", value: 0.031 },
          { stat: "critRate", value: 0.039 },
        ],
      },
    ],
  };
  const tooManySubstats: CharacterSheetLoadout = {
    ...raidenLoadout(),
    artifacts: [
      {
        slot: "sands",
        setKey: "too_many_substats_test_set",
        mainStat: { stat: "energyRecharge", value: 0.518 },
        substats: [
          { stat: "critRate", value: 0.031 },
          { stat: "critDamage", value: 0.062 },
          { stat: "attackPercent", value: 0.047 },
          { stat: "elementalMastery", value: 19 },
          { stat: "hpFlat", value: 239 },
        ],
      },
    ],
  };

  assert.equal(
    calculateCharacterSheetStats(impossibleMain).issues[0]?.code,
    "INVALID_ARTIFACT_MAIN_STAT_FOR_SLOT"
  );
  assert.equal(
    calculateCharacterSheetStats(impossibleSubstat).issues[0]?.code,
    "ARTIFACT_SUBSTAT_MATCHES_MAIN"
  );
  assert.equal(
    calculateCharacterSheetStats(duplicateSubstat).issues[0]?.code,
    "DUPLICATE_ARTIFACT_SUBSTAT"
  );
  assert.equal(
    calculateCharacterSheetStats(tooManySubstats).issues[0]?.code,
    "TOO_MANY_ARTIFACT_SUBSTATS"
  );
});

test("marks missing artifact set identity as partial instead of complete", () => {
  const result = calculateCharacterSheetStats({
    ...raidenLoadout(),
    artifacts: [
      {
        slot: "flower",
        mainStat: { stat: "hpFlat", value: 4780 },
        substats: [],
      },
    ],
  } as unknown as CharacterSheetLoadout);

  assert.equal(result.status, "partial");
  if (result.status === "invalid") return;
  assert.equal(result.coverage.artifactSetConstants, "unknown");
  assert.equal(
    result.issues.some(
      (issue) => issue.code === "ARTIFACT_SET_IDENTITY_MISSING"
    ),
    true
  );

  const invalidRuntimeIdentities = calculateCharacterSheetStats({
    ...raidenLoadout(),
    artifacts: [
      {
        slot: "flower",
        setKey: 1,
        mainStat: { stat: "hpFlat", value: 4780 },
        substats: [],
      },
      {
        slot: "plume",
        setKey: 2,
        mainStat: { stat: "attackFlat", value: 311 },
        substats: [],
      },
    ],
  } as unknown as CharacterSheetLoadout);

  assert.equal(invalidRuntimeIdentities.status, "partial");
  if (invalidRuntimeIdentities.status === "invalid") return;
  assert.equal(invalidRuntimeIdentities.coverage.artifactSetConstants, "unknown");
  assert.deepEqual(
    invalidRuntimeIdentities.issues.map((issue) => issue.code),
    ["ARTIFACT_SET_IDENTITY_MISSING"]
  );
});

test("keeps audited constant coverage explicit and marks future keys partial", () => {
  assert.equal(
    AUDITED_CHARACTER_CONSTANT_KEYS.every((key) => characterProgression[key]),
    true
  );
  assert.equal(
    AUDITED_WEAPON_CONSTANT_KEYS.every((key) => weaponProgression[key]),
    true
  );

  const result = calculateCharacterSheetStatsFromProgression(
    {
      character: { key: "future_character", level: 90, ascension: 6 },
      weapon: {
        key: "future_weapon",
        level: 90,
        ascension: 6,
        refinement: 1,
      },
      artifacts: [],
    },
    {
      characters: {
        future_character: {
          weaponType: "polearm",
          specializedStat: "energyRecharge",
          stats: { "90:6": [10000, 300, 700, 0.32] },
        },
      },
      weapons: {
        future_weapon: {
          weaponType: "polearm",
          specializedStat: "critRate",
          stats: { "90:6": [600, 0.2] },
        },
      },
      manifest: {
        schemaVersion: 1,
        genshinDbVersion: "future",
        gameVersion: "future",
      },
    }
  );

  assert.equal(result.status, "partial");
  if (result.status === "invalid") return;
  assert.equal(result.coverage.characterConstants, "unreviewed");
  assert.equal(result.coverage.weaponConstants, "unreviewed");
  assert.deepEqual(
    result.issues.map((issue) => issue.code),
    ["CHARACTER_CONSTANTS_UNREVIEWED", "WEAPON_CONSTANTS_UNREVIEWED"]
  );
  assert.equal(
    result.coverage.constantRuleset,
    "genshin-artifact-builds/constant-stats@1"
  );
  assert.equal(
    result.coverage.constantRuleSource,
    "miao-plugin@03298720363416755a754324ab14cb08037ca345"
  );
});
