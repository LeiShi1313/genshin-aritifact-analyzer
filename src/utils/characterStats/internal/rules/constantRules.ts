import type {
  ArtifactSetConstantRule,
  CharacterConstantRule,
  ConstantEffectStat,
  WeaponConstantRule,
} from "../../types";

// Rebuilt from miao-plugin's static character/weapon rules at commit
// 03298720363416755a754324ab14cb08037ca345. Values are normalized from
// percentage points to ratios. See THIRD_PARTY_NOTICES.md for provenance.
export const CHARACTER_CONSTANT_RULES: readonly CharacterConstantRule[] = [
  {
    id: "character.sangonomiya_kokomi.flawless_strategy",
    characterKey: "sangonomiya_kokomi",
    minimumAscension: 0,
    effects: [
      { stat: "critRate", value: -1 },
      { stat: "healingBonus", value: 0.25 },
    ],
  },
  {
    id: "character.xingqiu.blades_amidst_raindrops",
    characterKey: "xingqiu",
    minimumAscension: 4,
    effects: [{ stat: "hydroDamageBonus", value: 0.2 }],
  },
  {
    id: "character.lauma.intrinsic_mastery",
    characterKey: "lauma",
    minimumAscension: 0,
    effects: [{ stat: "elementalMastery", value: 200 }],
  },
  {
    id: "character.nefer.intrinsic_mastery",
    characterKey: "nefer",
    minimumAscension: 0,
    effects: [{ stat: "elementalMastery", value: 100 }],
  },
] as const;

const artifactSetRules = (
  stat: ConstantEffectStat,
  value: number,
  setKeys: readonly string[]
): readonly ArtifactSetConstantRule[] =>
  setKeys.map((setKey) => ({
    id: `artifact_set.${setKey}.two_piece`,
    setKey,
    requiredPieces: 2,
    effects: [{ stat, value }],
  }));

// Rebuilt from the always-active two-piece descriptions in the generated
// Genshin set catalog. Only bonuses represented on the character stat sheet
// are included; attack-type damage, resistance, energy restoration, and
// conditional effects do not alter this calculator's sheet fields.
export const ARTIFACT_SET_CONSTANT_RULE_SOURCE =
  "genshin-db@5.2.12/artifact-set-two-piece";

export const ARTIFACT_SET_CONSTANT_RULES: readonly ArtifactSetConstantRule[] = [
  ...artifactSetRules("geoDamageBonus", 0.15, ["archaic_petra"]),
  ...artifactSetRules("critRate", 0.12, ["berserker"]),
  ...artifactSetRules("cryoDamageBonus", 0.15, [
    "blizzard_strayer",
    "finale_of_the_deep_galleries",
  ]),
  ...artifactSetRules("physicalDamageBonus", 0.25, [
    "bloodstained_chivalry",
    "pale_flame",
  ]),
  ...artifactSetRules("attackPercent", 0.18, [
    "brave_heart",
    "echoes_of_an_offering",
    "gladiators_finale",
    "resolution_of_sojourner",
    "shimenawas_reminiscence",
    "vermillion_hereafter",
    "nighttime_whispers_in_the_echoing_woods",
    "fragment_of_harmonic_whimsy",
    "unfinished_reverie",
    "a_day_carved_from_rising_winds",
    "disenchantment_in_deep_shadow",
  ]),
  ...artifactSetRules("pyroDamageBonus", 0.15, [
    "crimson_witch_of_flames",
  ]),
  ...artifactSetRules("dendroDamageBonus", 0.15, ["deepwood_memories"]),
  ...artifactSetRules("defensePercent", 0.3, [
    "defenders_will",
    "husk_of_opulent_dreams",
  ]),
  ...artifactSetRules("anemoDamageBonus", 0.15, [
    "desert_pavilion_chronicle",
    "viridescent_venerer",
  ]),
  ...artifactSetRules("energyRecharge", 0.2, [
    "emblem_of_severed_fate",
    "scholar",
    "the_exile",
    "silken_moons_serenade",
    "celestial_gift",
  ]),
  ...artifactSetRules("elementalMastery", 80, [
    "flower_of_paradise_lost",
    "gilded_dreams",
    "instructor",
    "wanderers_troupe",
    "night_of_the_skys_unveiling",
    "aubade_of_morningstar_and_moon",
  ]),
  ...artifactSetRules("hydroDamageBonus", 0.15, [
    "heart_of_depth",
    "nymphs_dream",
  ]),
  ...artifactSetRules("healingBonus", 0.15, [
    "maiden_beloved",
    "ocean_hued_clam",
    "song_of_days_past",
  ]),
  ...artifactSetRules("shieldStrength", 0.35, ["retracing_bolide"]),
  ...artifactSetRules("hpPercent", 0.2, [
    "tenacity_of_the_millelith",
    "vourukashas_glow",
  ]),
  ...artifactSetRules("electroDamageBonus", 0.15, ["thundering_fury"]),
  ...artifactSetRules("hpFlat", 1000, ["adventurer"]),
  ...artifactSetRules("defenseFlat", 100, ["lucky_dog"]),
];

const pct12 = [0.12, 0.15, 0.18, 0.21, 0.24] as const;
const pct16 = [0.16, 0.2, 0.24, 0.28, 0.32] as const;
const pct20 = [0.2, 0.25, 0.3, 0.35, 0.4] as const;
const pct28 = [0.28, 0.35, 0.42, 0.49, 0.56] as const;
const crit4 = [0.04, 0.05, 0.06, 0.07, 0.08] as const;
const crit8 = [0.08, 0.1, 0.12, 0.14, 0.16] as const;

export const WEAPON_CONSTANT_RULES: readonly WeaponConstantRule[] = [
  {
    id: "weapon.haran_geppaku_futsu.all_elemental_damage",
    weaponKey: "haran_geppaku_futsu",
    effects: [
      { stat: "allElementalDamageBonus", valuesByRefinement: pct12 },
    ],
  },
  {
    id: "weapon.mistsplitter_reforged.all_elemental_damage",
    weaponKey: "mistsplitter_reforged",
    effects: [
      { stat: "allElementalDamageBonus", valuesByRefinement: pct12 },
    ],
  },
  {
    id: "weapon.primordial_jade_cutter.hp",
    weaponKey: "primordial_jade_cutter",
    effects: [{ stat: "hpPercent", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.light_of_foliar_incision.crit_rate",
    weaponKey: "light_of_foliar_incision",
    effects: [{ stat: "critRate", valuesByRefinement: crit4 }],
  },
  {
    id: "weapon.summit_shaper.shield_strength",
    weaponKey: "summit_shaper",
    effects: [{ stat: "shieldStrength", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.skyward_blade.crit_rate",
    weaponKey: "skyward_blade",
    effects: [{ stat: "critRate", valuesByRefinement: crit4 }],
  },
  {
    id: "weapon.aquila_favonia.attack",
    weaponKey: "aquila_favonia",
    effects: [{ stat: "attackPercent", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.key_of_khaj_nisut.hp",
    weaponKey: "key_of_khaj_nisut",
    effects: [{ stat: "hpPercent", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.uraku_misugiri.defense",
    weaponKey: "uraku_misugiri",
    effects: [{ stat: "defensePercent", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.absolution.crit_damage",
    weaponKey: "absolution",
    effects: [{ stat: "critDamage", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.lightbearing_moonshard.defense",
    weaponKey: "lightbearing_moonshard",
    effects: [{ stat: "defensePercent", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.wolfs_gravestone.attack",
    weaponKey: "wolfs_gravestone",
    effects: [{ stat: "attackPercent", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.the_unforged.shield_strength",
    weaponKey: "the_unforged",
    effects: [{ stat: "shieldStrength", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.song_of_broken_pines.attack",
    weaponKey: "song_of_broken_pines",
    effects: [{ stat: "attackPercent", valuesByRefinement: pct16 }],
  },
  {
    id: "weapon.redhorn_stonethresher.defense",
    weaponKey: "redhorn_stonethresher",
    effects: [{ stat: "defensePercent", valuesByRefinement: pct28 }],
  },
  {
    id: "weapon.verdict.attack",
    weaponKey: "verdict",
    effects: [{ stat: "attackPercent", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.a_teaspoon_of_transcendence.attack",
    weaponKey: "a_teaspoon_of_transcendence",
    effects: [{ stat: "attackPercent", valuesByRefinement: pct28 }],
  },
  {
    id: "weapon.vortex_vanquisher.shield_strength",
    weaponKey: "vortex_vanquisher",
    effects: [{ stat: "shieldStrength", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.staff_of_homa.hp",
    weaponKey: "staff_of_homa",
    effects: [{ stat: "hpPercent", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.skyward_spine.crit_rate",
    weaponKey: "skyward_spine",
    effects: [{ stat: "critRate", valuesByRefinement: crit8 }],
  },
  {
    id: "weapon.calamity_queller.all_elemental_damage",
    weaponKey: "calamity_queller",
    effects: [
      { stat: "allElementalDamageBonus", valuesByRefinement: pct12 },
    ],
  },
  {
    id: "weapon.lumidouce_elegy.attack",
    weaponKey: "lumidouce_elegy",
    effects: [
      {
        stat: "attackPercent",
        valuesByRefinement: [0.15, 0.1875, 0.225, 0.2625, 0.3],
      },
    ],
  },
  {
    id: "weapon.symphonist_of_scents.attack",
    weaponKey: "symphonist_of_scents",
    effects: [{ stat: "attackPercent", valuesByRefinement: pct12 }],
  },
  {
    id: "weapon.skyward_harp.crit_damage",
    weaponKey: "skyward_harp",
    effects: [{ stat: "critDamage", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.elegy_for_the_end.elemental_mastery",
    weaponKey: "elegy_for_the_end",
    effects: [
      {
        stat: "elementalMastery",
        valuesByRefinement: [60, 75, 90, 105, 120],
      },
    ],
  },
  {
    id: "weapon.thundering_pulse.attack",
    weaponKey: "thundering_pulse",
    effects: [{ stat: "attackPercent", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.aqua_simulacra.hp",
    weaponKey: "aqua_simulacra",
    effects: [{ stat: "hpPercent", valuesByRefinement: pct16 }],
  },
  {
    id: "weapon.hunters_path.all_elemental_damage",
    weaponKey: "hunters_path",
    effects: [
      { stat: "allElementalDamageBonus", valuesByRefinement: pct12 },
    ],
  },
  {
    id: "weapon.golden_frostbound_oath.defense",
    weaponKey: "golden_frostbound_oath",
    effects: [{ stat: "defensePercent", valuesByRefinement: pct16 }],
  },
  {
    id: "weapon.skyward_atlas.all_elemental_damage",
    weaponKey: "skyward_atlas",
    effects: [
      { stat: "allElementalDamageBonus", valuesByRefinement: pct12 },
    ],
  },
  {
    id: "weapon.memory_of_dust.shield_strength",
    weaponKey: "memory_of_dust",
    effects: [{ stat: "shieldStrength", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.everlasting_moonglow.healing_bonus",
    weaponKey: "everlasting_moonglow",
    effects: [
      {
        stat: "healingBonus",
        valuesByRefinement: [0.1, 0.125, 0.15, 0.175, 0.2],
      },
    ],
  },
  {
    id: "weapon.cashflow_supervision.attack",
    weaponKey: "cashflow_supervision",
    effects: [{ stat: "attackPercent", valuesByRefinement: pct16 }],
  },
  {
    id: "weapon.tome_of_the_eternal_flow.hp",
    weaponKey: "tome_of_the_eternal_flow",
    effects: [{ stat: "hpPercent", valuesByRefinement: pct16 }],
  },
  {
    id: "weapon.surfs_up.hp",
    weaponKey: "surfs_up",
    effects: [{ stat: "hpPercent", valuesByRefinement: pct20 }],
  },
  {
    id: "weapon.starcallers_watch.elemental_mastery",
    weaponKey: "starcallers_watch",
    effects: [
      {
        stat: "elementalMastery",
        valuesByRefinement: [100, 125, 150, 175, 200],
      },
    ],
  },
  {
    id: "weapon.vivid_notions.attack",
    weaponKey: "vivid_notions",
    effects: [{ stat: "attackPercent", valuesByRefinement: pct28 }],
  },
  {
    id: "weapon.reliquary_of_truth.crit_rate",
    weaponKey: "reliquary_of_truth",
    effects: [{ stat: "critRate", valuesByRefinement: crit8 }],
  },
  {
    id: "weapon.nocturnes_curtain_call.hp",
    weaponKey: "nocturnes_curtain_call",
    effects: [
      {
        stat: "hpPercent",
        valuesByRefinement: [0.1, 0.12, 0.14, 0.16, 0.18],
      },
    ],
  },
  {
    id: "weapon.angelos_heptades.attack",
    weaponKey: "angelos_heptades",
    effects: [{ stat: "attackPercent", valuesByRefinement: pct12 }],
  },
] as const;
