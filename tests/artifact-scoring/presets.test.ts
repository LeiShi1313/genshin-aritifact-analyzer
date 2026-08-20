import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test, { after } from "node:test";
import { createServer } from "vite";

import { Build as PortableBuild } from "../../genshin/build";
import { AttributeType } from "../../src/genshin/attribute";
import { Character } from "../../src/genshin/character";
import { Set as ArtifactSet } from "../../src/genshin/set";
import { Weapon } from "../../src/genshin/weapon";
import rawPresets from "../../src/data/presets.js";
import { getPresetBuildNameKey } from "../../src/data/presetNames";
import recommendedPresetHashes from "../../src/data/recommendedPresetHashes.js";
import { recommendedPresetBuilds } from "../../src/data/recommendedPresets";
import {
  BUILD_SET_PLAN,
  classifyBuildSetPlan,
} from "../../src/utils/artifactScoring/setEligibility";
import { validateBuild } from "../../src/utils/artifactScoring/validation";

const vite = await createServer({
  root: fileURLToPath(new URL("../..", import.meta.url)),
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "silent",
});
const presetsModule = await vite.ssrLoadModule(
  "/src/store/reducers/presets.js"
);
const presetsReducer = presetsModule.default;
const { loadPresets } = presetsModule;

after(() => vite.close());

const validPositiveEnumValues = (value: object) =>
  new Set(
    Object.values(value).filter(
      (entry): entry is number =>
        typeof entry === "number" && Number.isInteger(entry) && entry > 0
    )
  );

const VALID_CHARACTERS = validPositiveEnumValues(Character);
const VALID_SETS = validPositiveEnumValues(ArtifactSet);
const VALID_WEAPONS = validPositiveEnumValues(Weapon);

const TARGET_PRESETS = [
  {
    character: Character.KIRARA,
    recipe: [
      { set: ArtifactSet.TENACITY_OF_THE_MILLELITH, count: 2 },
      { set: ArtifactSet.VOURUKASHAS_GLOW, count: 2 },
    ],
    plan: BUILD_SET_PLAN.NEUTRAL,
  },
  {
    character: Character.SIGEWINNE,
    recipe: [{ set: ArtifactSet.OCEAN_HUED_CLAM, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.ARLECCHINO,
    recipe: [{ set: ArtifactSet.FRAGMENT_OF_HARMONIC_WHIMSY, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.SETHOS,
    recipe: [{ set: ArtifactSet.WANDERERS_TROUPE, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.CLORINDE,
    recipe: [{ set: ArtifactSet.FRAGMENT_OF_HARMONIC_WHIMSY, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.EMILIE,
    recipe: [{ set: ArtifactSet.UNFINISHED_REVERIE, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.KACHINA,
    recipe: [{ set: ArtifactSet.SCROLL_OF_THE_HERO_OF_CINDER_CITY, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.KINICH,
    recipe: [{ set: ArtifactSet.OBSIDIAN_CODEX, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.MUALANI,
    recipe: [{ set: ArtifactSet.OBSIDIAN_CODEX, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.ORORON,
    recipe: [{ set: ArtifactSet.SCROLL_OF_THE_HERO_OF_CINDER_CITY, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.XILONEN,
    recipe: [{ set: ArtifactSet.SCROLL_OF_THE_HERO_OF_CINDER_CITY, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.CHASCA,
    recipe: [{ set: ArtifactSet.OBSIDIAN_CODEX, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.MAVUIKA,
    recipe: [{ set: ArtifactSet.OBSIDIAN_CODEX, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.CITLALI,
    recipe: [{ set: ArtifactSet.SCROLL_OF_THE_HERO_OF_CINDER_CITY, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.LAN_YAN,
    recipe: [{ set: ArtifactSet.VIRIDESCENT_VENERER, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.YUMEMIZUKI_MIZUKI,
    recipe: [{ set: ArtifactSet.VIRIDESCENT_VENERER, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.IANSAN,
    recipe: [{ set: ArtifactSet.SCROLL_OF_THE_HERO_OF_CINDER_CITY, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.VARESA,
    recipe: [{ set: ArtifactSet.LONG_NIGHTS_OATH, count: 4 }],
    alternativeRecipes: [[{ set: ArtifactSet.OBSIDIAN_CODEX, count: 4 }]],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.IFA,
    recipe: [{ set: ArtifactSet.VIRIDESCENT_VENERER, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.ESCOFFIER,
    recipe: [{ set: ArtifactSet.GOLDEN_TROUPE, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.SKIRK,
    recipe: [{ set: ArtifactSet.FINALE_OF_THE_DEEP_GALLERIES, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.DAHLIA,
    recipe: [{ set: ArtifactSet.NOBLESSE_OBLIGE, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.INEFFA,
    recipe: [{ set: ArtifactSet.AUBADE_OF_MORNINGSTAR_AND_MOON, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.LAUMA,
    recipe: [{ set: ArtifactSet.SILKEN_MOONS_SERENADE, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.FLINS,
    recipe: [{ set: ArtifactSet.NIGHT_OF_THE_SKYS_UNVEILING, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.AINO,
    recipe: [{ set: ArtifactSet.SILKEN_MOONS_SERENADE, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.NEFER,
    recipe: [{ set: ArtifactSet.NIGHT_OF_THE_SKYS_UNVEILING, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.DURIN,
    recipe: [{ set: ArtifactSet.NOBLESSE_OBLIGE, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.JAHODA,
    recipe: [{ set: ArtifactSet.VIRIDESCENT_VENERER, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.COLUMBINA,
    recipe: [{ set: ArtifactSet.SILKEN_MOONS_SERENADE, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.ZIBAI,
    recipe: [{ set: ArtifactSet.NIGHT_OF_THE_SKYS_UNVEILING, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.ILLUGA,
    recipe: [{ set: ArtifactSet.SILKEN_MOONS_SERENADE, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.VARKA,
    recipe: [{ set: ArtifactSet.A_DAY_CARVED_FROM_RISING_WINDS, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.LINNEA,
    recipe: [{ set: ArtifactSet.HUSK_OF_OPULENT_DREAMS, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.LOHEN,
    recipe: [{ set: ArtifactSet.A_DAY_CARVED_FROM_RISING_WINDS, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.NICOLE,
    recipe: [{ set: ArtifactSet.CELESTIAL_GIFT, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.PRUNE,
    recipe: [{ set: ArtifactSet.VIRIDESCENT_VENERER, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.SANDRONE,
    recipe: [{ set: ArtifactSet.DISENCHANTMENT_IN_DEEP_SHADOW, count: 4 }],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.ALYOSHA,
    recipe: [{ set: ArtifactSet.HEART_OF_THE_FURNACE, count: 4 }],
    alternativeRecipes: [[{ set: ArtifactSet.NOBLESSE_OBLIGE, count: 4 }]],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
  {
    character: Character.ODETTE,
    recipe: [{ set: ArtifactSet.HEART_OF_THE_FURNACE, count: 4 }],
    alternativeRecipes: [[{ set: ArtifactSet.SCARLET_PROOF, count: 4 }]],
    plan: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
  },
] as const;

const EXPECTED_GENERATED_NAMES = new Map<Character, readonly string[]>([
  [Character.KIRARA, ["Shield Support"]],
  [Character.SIGEWINNE, ["Off-Field Healer"]],
  [Character.ARLECCHINO, ["General On-Field DPS", "Vaporize DPS"]],
  [Character.SETHOS, ["Charged Attack Quickswap", "Burst Normal Attack DPS"]],
  [Character.CLORINDE, ["Bond of Life DPS", "Aggravate DPS"]],
  [Character.EMILIE, ["Burning Off-Field DPS"]],
  [Character.KACHINA, ["Scroll Support"]],
  [Character.KINICH, ["Skill Cannon DPS"]],
  [Character.MUALANI, ["Vaporize DPS"]],
  [Character.ORORON, ["Electro-Charged DPS", "Overloaded Trigger"]],
  [Character.XILONEN, ["RES Shred & Healing"]],
  [Character.CHASCA, ["Multi-Element Charged DPS"]],
  [Character.MAVUIKA, ["On-Field Burst DPS", "Off-Field Pyro DPS"]],
  [Character.CITLALI, ["Melt Shield Support"]],
  [Character.LAN_YAN, ["Shield Support", "Swirl Driver"]],
  [Character.YUMEMIZUKI_MIZUKI, ["Swirl Driver"]],
  [Character.IANSAN, ["ATK Support"]],
  [Character.VARESA, ["Plunging Attack DPS"]],
  [Character.IFA, ["Swirl Driver", "Anemo DPS"]],
  [Character.ESCOFFIER, ["Cryo Off-Field DPS & Healer"]],
  [Character.SKIRK, ["Quickswap Burst DPS", "On-Field Normal Attack DPS"]],
  [Character.DAHLIA, ["Shield & ATK SPD Support"]],
  [Character.INEFFA, ["Lunar-Charged DPS", "Hyperbloom Trigger"]],
  [Character.LAUMA, ["Bloom Support"]],
  [Character.FLINS, ["Lunar-Charged DPS"]],
  [Character.AINO, ["Off-Field Hydro Support"]],
  [Character.NEFER, ["Lunar-Bloom Charged DPS"]],
  [Character.DURIN, ["White Dragon Support", "Dark Dragon Reaction DPS"]],
  [Character.JAHODA, ["Off-Field Healer"]],
  [
    Character.COLUMBINA,
    ["Off-Field Lunar Support", "On-Field Lunar-Bloom DPS"],
  ],
  [Character.ZIBAI, ["Lunar-Crystallize DPS"]],
  [Character.ILLUGA, ["Lunar-Crystallize Support", "Geo DPS Support"]],
  [Character.VARKA, ["Dual-Element DPS"]],
  [
    Character.LINNEA,
    ["Off-Field Lunar-Crystallize DPS", "Quickswap Lunar-Crystallize"],
  ],
  [Character.LOHEN, ["Cryo On-Field DPS"]],
  [Character.NICOLE, ["Shield & ATK Support"]],
  [Character.PRUNE, ["Elemental RES Shred Support", "Anemo DPS Support"]],
  [Character.SANDRONE, ["Stellar-Conduct Charged DPS"]],
  [Character.ALYOSHA, ["Stellar-Conduct Support & Healer"]],
  [Character.ODETTE, ["Stellar Glimmer Support"]],
]);

const decodedPresets = rawPresets.map((raw) =>
  PortableBuild.decode(Buffer.from(raw, "hex"))
);

test("generated presets use descriptive names and distinct supported playstyles", () => {
  assert.equal(recommendedPresetBuilds.length, 54);

  for (const [character, expectedNames] of EXPECTED_GENERATED_NAMES) {
    const characterBuilds = recommendedPresetBuilds.filter(
      (build) => build.character === character
    );
    assert.deepEqual(
      characterBuilds.map((build) => getPresetBuildNameKey(build.name)),
      expectedNames,
      Character[character]
    );

    const targetSignatures = characterBuilds.map((build) =>
      JSON.stringify({
        character: build.character,
        weapons: build.weapons,
        suits: build.suits,
        flowerAttributes: build.flowerAttributes,
        plumeAttributes: build.plumeAttributes,
        sandsAttributes: build.sandsAttributes,
        gobletAttributes: build.gobletAttributes,
        circletAttributes: build.circletAttributes,
        subAttributes: build.subAttributes,
      })
    );
    assert.equal(
      new Set(targetSignatures).size,
      characterBuilds.length,
      `${Character[character]} variants must target different artifacts`
    );
  }

  assert.equal(
    recommendedPresetBuilds.some((build) => build.name === "Recommended build"),
    false
  );
});

const getFocusedPreset = (character: Character) => {
  const [primaryName] = EXPECTED_GENERATED_NAMES.get(character) ?? [];
  const candidates = decodedPresets.filter(
    (build) =>
      build.character === character &&
      getPresetBuildNameKey(build.name) === primaryName
  );
  assert.equal(candidates.length, 1, `${Character[character]} preset count`);
  return candidates[0];
};

test("the preset catalog decodes canonically without invalid or duplicate builds", () => {
  assert.deepEqual(
    recommendedPresetHashes,
    recommendedPresetBuilds.map((build) =>
      Buffer.from(PortableBuild.encode(build).finish()).toString("hex")
    ),
    "generated recommended preset hashes are stale"
  );
  assert.equal(new Set(rawPresets).size, rawPresets.length);

  for (const [index, build] of decodedPresets.entries()) {
    const id = `preset-${index}`;
    assert.equal(
      Buffer.from(PortableBuild.encode(build).finish()).toString("hex"),
      rawPresets[index],
      `${id} is not canonical`
    );
    assert.equal(
      VALID_CHARACTERS.has(build.character),
      true,
      `${id} character`
    );
    assert.equal(build.suits.length > 0, true, `${id} has no set recipe`);
    assert.deepEqual(
      build.flowerAttributes,
      [AttributeType.HP],
      `${id} flower`
    );
    assert.deepEqual(build.plumeAttributes, [AttributeType.ATK], `${id} plume`);
    assert.equal(build.sandsAttributes.length > 0, true, `${id} sands`);
    assert.equal(build.gobletAttributes.length > 0, true, `${id} goblet`);
    assert.equal(build.circletAttributes.length > 0, true, `${id} circlet`);
    assert.equal(
      build.subAttributes.some((attribute) => attribute.value > 0),
      true,
      `${id} has no positive substat`
    );

    for (const weapon of build.weapons) {
      assert.equal(VALID_WEAPONS.has(weapon), true, `${id} weapon`);
    }
    for (const suit of build.suits) {
      assert.equal(suit.setCombos.length > 0, true, `${id} empty suit`);
      for (const combo of suit.setCombos) {
        assert.equal(VALID_SETS.has(combo.set), true, `${id} set`);
        assert.equal([2, 4].includes(combo.count), true, `${id} set count`);
      }
    }

    assert.equal(validateBuild(build, id).status, "ok", `${id} validation`);
  }

  const loaded = presetsReducer(undefined, loadPresets(decodedPresets));
  assert.equal(Object.keys(loaded.builds).length, rawPresets.length);
});

test("the current UI-ready release cohort has calibrated preset coverage", () => {
  assert.equal(rawPresets.length, 104 + recommendedPresetBuilds.length);

  for (const expected of TARGET_PRESETS) {
    const [primaryName] =
      EXPECTED_GENERATED_NAMES.get(expected.character) ?? [];
    const candidates = decodedPresets.filter(
      (build) =>
        build.character === expected.character &&
        getPresetBuildNameKey(build.name) === primaryName
    );
    assert.equal(
      candidates.length,
      1,
      `${Character[expected.character]} should have one primary preset`
    );

    const [build] = candidates;
    const recipes = [
      expected.recipe,
      ...("alternativeRecipes" in expected ? expected.alternativeRecipes : []),
    ];
    assert.deepEqual(
      build.suits,
      recipes.map((recipe) => ({ setCombos: [...recipe] }))
    );
    assert.equal(classifyBuildSetPlan(build).kind, expected.plan);

    const characterKey = Character[expected.character].toLowerCase();
    for (const imageType of ["icon", "gacha"]) {
      const imagePath = fileURLToPath(
        new URL(
          `../../src/assets/characters/${characterKey}_${imageType}.png`,
          import.meta.url
        )
      );
      assert.equal(existsSync(imagePath), true, `${characterKey} ${imageType}`);
    }
  }
});

test("every character with complete list UI assets has preset coverage", () => {
  const coveredCharacters = new Set(
    decodedPresets.map((build) => build.character)
  );
  const nonCombatCharacters = new Set([Character.MANEKIN, Character.MANEKINA]);

  for (const characterId of VALID_CHARACTERS) {
    if (nonCombatCharacters.has(characterId)) continue;
    const characterKey = Character[characterId].toLowerCase();
    const hasCompleteListAssets = ["icon", "gacha"].every((imageType) =>
      existsSync(
        fileURLToPath(
          new URL(
            `../../src/assets/characters/${characterKey}_${imageType}.png`,
            import.meta.url
          )
        )
      )
    );

    if (hasCompleteListAssets) {
      assert.equal(
        coveredCharacters.has(characterId),
        true,
        `${Character[characterId]} has UI assets but no preset`
      );
    }
  }
});

test("common guide-approved main-stat alternatives are treated as matches", () => {
  const expected = [
    {
      character: Character.KINICH,
      sands: [AttributeType.ATK_PERCENT],
      goblet: [AttributeType.DENDRO_DAMAGE_BONUS],
      circlet: [AttributeType.CRIT_DAMAGE, AttributeType.CRIT_RATE],
    },
    {
      character: Character.MUALANI,
      sands: [AttributeType.HP_PERCENT, AttributeType.ELEMENTAL_MASTERY],
      goblet: [AttributeType.HYDRO_DAMAGE_BONUS, AttributeType.HP_PERCENT],
      circlet: [AttributeType.CRIT_DAMAGE, AttributeType.HP_PERCENT],
    },
    {
      character: Character.ORORON,
      sands: [AttributeType.ATK_PERCENT, AttributeType.ENERGY_RECHARGE],
      goblet: [AttributeType.ELECTRO_DAMAGE_BONUS],
      circlet: [AttributeType.CRIT_RATE, AttributeType.CRIT_DAMAGE],
    },
    {
      character: Character.XILONEN,
      sands: [AttributeType.ENERGY_RECHARGE, AttributeType.DEF_PERCENT],
      goblet: [AttributeType.DEF_PERCENT],
      circlet: [
        AttributeType.HEALING_BONUS,
        AttributeType.DEF_PERCENT,
        AttributeType.CRIT_RATE,
      ],
    },
    {
      character: Character.MAVUIKA,
      sands: [AttributeType.ATK_PERCENT, AttributeType.ELEMENTAL_MASTERY],
      goblet: [AttributeType.PYRO_DAMAGE_BONUS],
      circlet: [AttributeType.CRIT_RATE, AttributeType.CRIT_DAMAGE],
    },
    {
      character: Character.CITLALI,
      sands: [AttributeType.ELEMENTAL_MASTERY, AttributeType.ENERGY_RECHARGE],
      goblet: [AttributeType.ELEMENTAL_MASTERY],
      circlet: [AttributeType.ELEMENTAL_MASTERY],
    },
    {
      character: Character.LAUMA,
      sands: [AttributeType.ELEMENTAL_MASTERY, AttributeType.ENERGY_RECHARGE],
      goblet: [AttributeType.ELEMENTAL_MASTERY],
      circlet: [AttributeType.ELEMENTAL_MASTERY],
    },
    {
      character: Character.NEFER,
      sands: [AttributeType.ELEMENTAL_MASTERY],
      goblet: [AttributeType.ELEMENTAL_MASTERY],
      circlet: [
        AttributeType.CRIT_RATE,
        AttributeType.CRIT_DAMAGE,
        AttributeType.ELEMENTAL_MASTERY,
      ],
    },
    {
      character: Character.DURIN,
      sands: [
        AttributeType.ATK_PERCENT,
        AttributeType.ELEMENTAL_MASTERY,
        AttributeType.ENERGY_RECHARGE,
      ],
      goblet: [AttributeType.PYRO_DAMAGE_BONUS, AttributeType.ATK_PERCENT],
      circlet: [AttributeType.CRIT_RATE, AttributeType.CRIT_DAMAGE],
    },
    {
      character: Character.JAHODA,
      sands: [AttributeType.ENERGY_RECHARGE, AttributeType.ATK_PERCENT],
      goblet: [AttributeType.ATK_PERCENT],
      circlet: [
        AttributeType.CRIT_RATE,
        AttributeType.HEALING_BONUS,
        AttributeType.ATK_PERCENT,
      ],
    },
    {
      character: Character.COLUMBINA,
      sands: [AttributeType.ENERGY_RECHARGE, AttributeType.HP_PERCENT],
      goblet: [AttributeType.HP_PERCENT],
      circlet: [
        AttributeType.CRIT_RATE,
        AttributeType.CRIT_DAMAGE,
        AttributeType.HP_PERCENT,
      ],
    },
    {
      character: Character.ZIBAI,
      sands: [AttributeType.DEF_PERCENT],
      goblet: [AttributeType.DEF_PERCENT],
      circlet: [AttributeType.CRIT_RATE, AttributeType.CRIT_DAMAGE],
    },
    {
      character: Character.ILLUGA,
      sands: [AttributeType.ELEMENTAL_MASTERY, AttributeType.ENERGY_RECHARGE],
      goblet: [AttributeType.ELEMENTAL_MASTERY],
      circlet: [AttributeType.ELEMENTAL_MASTERY, AttributeType.CRIT_RATE],
    },
    {
      character: Character.VARKA,
      sands: [AttributeType.ATK_PERCENT],
      goblet: [
        AttributeType.PYRO_DAMAGE_BONUS,
        AttributeType.HYDRO_DAMAGE_BONUS,
        AttributeType.ELECTRO_DAMAGE_BONUS,
        AttributeType.CRYO_DAMAGE_BONUS,
        AttributeType.ATK_PERCENT,
      ],
      circlet: [AttributeType.CRIT_RATE, AttributeType.CRIT_DAMAGE],
    },
    {
      character: Character.LINNEA,
      sands: [AttributeType.DEF_PERCENT],
      goblet: [AttributeType.DEF_PERCENT],
      circlet: [
        AttributeType.CRIT_RATE,
        AttributeType.CRIT_DAMAGE,
        AttributeType.DEF_PERCENT,
      ],
    },
    {
      character: Character.LOHEN,
      sands: [AttributeType.ATK_PERCENT, AttributeType.ELEMENTAL_MASTERY],
      goblet: [AttributeType.CRYO_DAMAGE_BONUS, AttributeType.ATK_PERCENT],
      circlet: [AttributeType.CRIT_RATE, AttributeType.CRIT_DAMAGE],
    },
    {
      character: Character.NICOLE,
      sands: [AttributeType.ATK_PERCENT, AttributeType.ENERGY_RECHARGE],
      goblet: [AttributeType.ATK_PERCENT],
      circlet: [AttributeType.ATK_PERCENT],
    },
    {
      character: Character.PRUNE,
      sands: [AttributeType.ATK_PERCENT, AttributeType.ENERGY_RECHARGE],
      goblet: [AttributeType.ATK_PERCENT],
      circlet: [AttributeType.ATK_PERCENT],
    },
    {
      character: Character.SANDRONE,
      sands: [AttributeType.ATK_PERCENT],
      goblet: [AttributeType.ATK_PERCENT],
      circlet: [AttributeType.CRIT_RATE, AttributeType.CRIT_DAMAGE],
    },
  ] as const;

  for (const recommendation of expected) {
    const build = getFocusedPreset(recommendation.character);
    assert.deepEqual(build.sandsAttributes, [...recommendation.sands]);
    assert.deepEqual(build.gobletAttributes, [...recommendation.goblet]);
    assert.deepEqual(build.circletAttributes, [...recommendation.circlet]);
  }
});

test("every artifact set used by the new presets has complete UI assets", () => {
  const setIds = new Set(
    TARGET_PRESETS.flatMap((preset) => preset.recipe.map((combo) => combo.set))
  );

  for (const setId of setIds) {
    const setKey = ArtifactSet[setId].toLowerCase();
    for (const position of ["flower", "plume", "sands", "goblet", "circlet"]) {
      const imagePath = fileURLToPath(
        new URL(
          `../../src/assets/artifacts/${setKey}_${position}.png`,
          import.meta.url
        )
      );
      assert.equal(existsSync(imagePath), true, `${setKey} ${position}`);
    }
  }
});
