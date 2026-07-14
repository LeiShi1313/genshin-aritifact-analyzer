import { AttributeType } from "../../genshin/attribute.js";
import type { Build } from "../../genshin/build.js";
import { Character } from "../../genshin/character.js";
import { Set as ArtifactSet } from "../../genshin/set.js";
import { PRESET_BUILD_IDS, type PresetBuildId } from "./presetNames.js";

type SetRecipe = readonly Readonly<{
  set: ArtifactSet;
  count: 2 | 4;
}>[];

type WeightedSubstat = readonly [type: AttributeType, importance: number];

type PresetInput = Readonly<{
  name: PresetBuildId;
  character: Character;
  recipe: SetRecipe;
  alternativeRecipes?: readonly SetRecipe[];
  sands: readonly AttributeType[];
  goblet: readonly AttributeType[];
  circlet: readonly AttributeType[];
  substats: readonly WeightedSubstat[];
}>;

const preset = ({
  name,
  character,
  recipe,
  alternativeRecipes,
  sands,
  goblet,
  circlet,
  substats,
}: PresetInput): Build => ({
  name,
  character,
  weapons: [],
  suits: [recipe, ...(alternativeRecipes ?? [])].map((setRecipe) => ({
    setCombos: setRecipe.map(({ set, count }) => ({ set, count })),
  })),
  flowerAttributes: [AttributeType.HP],
  plumeAttributes: [AttributeType.ATK],
  sandsAttributes: [...sands],
  gobletAttributes: [...goblet],
  circletAttributes: [...circlet],
  subAttributes: substats.map(([type, value]) => ({ type, value })),
});

const fourPiece = (set: ArtifactSet): SetRecipe => [{ set, count: 4 }];

const critCirclet = [
  AttributeType.CRIT_RATE,
  AttributeType.CRIT_DAMAGE,
] as const;

/**
 * One focused, general-purpose build for every normal playable character added
 * to this catalog through Genshin 6.7.
 *
 * Main stats and priority order are sourced from the linked current guides and
 * calculations. Importance values translate those recommendations into the
 * scorer's relative 0.1 grid: 1.0 is defining, 0.8 is high priority, 0.6 is
 * useful or requirement-dependent, and 0.2-0.4 is a conditional fallback.
 * ER is deliberately not always 1.0 because its value falls sharply after a
 * team-specific requirement is reached, which the build schema cannot encode.
 * Low-weight CRIT fallbacks remain on triple-EM builds: they are not stats to
 * chase over EM or ER, but they still improve direct damage once an EM main
 * stat prevents another EM substat from rolling on that artifact.
 */
export const recommendedPresetBuilds: readonly Build[] = Object.freeze([
  // https://keqingmains.com/q/kirara-quickguide/
  preset({
    name: PRESET_BUILD_IDS.SHIELD_SUPPORT,
    character: Character.KIRARA,
    recipe: [
      { set: ArtifactSet.TENACITY_OF_THE_MILLELITH, count: 2 },
      { set: ArtifactSet.VOURUKASHAS_GLOW, count: 2 },
    ],
    sands: [AttributeType.HP_PERCENT],
    goblet: [AttributeType.HP_PERCENT],
    circlet: [AttributeType.HP_PERCENT],
    substats: [
      [AttributeType.HP_PERCENT, 1],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.CRIT_RATE, 0.6],
      [AttributeType.HP, 0.3],
    ],
  }),

  // https://keqingmains.com/q/sigewinne-quickguide/
  preset({
    name: PRESET_BUILD_IDS.OFF_FIELD_HEALER,
    character: Character.SIGEWINNE,
    recipe: fourPiece(ArtifactSet.OCEAN_HUED_CLAM),
    sands: [AttributeType.HP_PERCENT],
    goblet: [AttributeType.HP_PERCENT],
    circlet: [AttributeType.HP_PERCENT],
    substats: [
      [AttributeType.HP_PERCENT, 1],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.CRIT_RATE, 0.4],
      [AttributeType.CRIT_DAMAGE, 0.4],
      [AttributeType.HP, 0.3],
    ],
  }),

  // https://keqingmains.com/q/arlecchino-quickguide/
  preset({
    name: PRESET_BUILD_IDS.GENERAL_ON_FIELD_DPS,
    character: Character.ARLECCHINO,
    recipe: fourPiece(ArtifactSet.FRAGMENT_OF_HARMONIC_WHIMSY),
    sands: [AttributeType.ATK_PERCENT],
    goblet: [AttributeType.PYRO_DAMAGE_BONUS],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.6],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/arlecchino-quickguide/ — Vaporize
  preset({
    name: PRESET_BUILD_IDS.VAPORIZE_DPS,
    character: Character.ARLECCHINO,
    recipe: fourPiece(ArtifactSet.FRAGMENT_OF_HARMONIC_WHIMSY),
    sands: [AttributeType.ELEMENTAL_MASTERY],
    goblet: [AttributeType.PYRO_DAMAGE_BONUS],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.8],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/sethos-quickguide/
  preset({
    name: PRESET_BUILD_IDS.CHARGED_ATTACK_QUICKSWAP,
    character: Character.SETHOS,
    recipe: fourPiece(ArtifactSet.WANDERERS_TROUPE),
    sands: [AttributeType.ELEMENTAL_MASTERY],
    goblet: [AttributeType.ELECTRO_DAMAGE_BONUS],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.8],
      [AttributeType.ATK_PERCENT, 0.4],
    ],
  }),

  // https://keqingmains.com/q/sethos-quickguide/ — Burst Normal Attacks
  preset({
    name: PRESET_BUILD_IDS.BURST_NORMAL_ATTACK_DPS,
    character: Character.SETHOS,
    recipe: fourPiece(ArtifactSet.DESERT_PAVILION_CHRONICLE),
    sands: [AttributeType.ELEMENTAL_MASTERY],
    goblet: [AttributeType.ELECTRO_DAMAGE_BONUS],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ELEMENTAL_MASTERY, 0.8],
      [AttributeType.ENERGY_RECHARGE, 0.6],
      [AttributeType.ATK_PERCENT, 0.4],
    ],
  }),

  // https://keqingmains.com/q/clorinde-quickguide/
  preset({
    name: PRESET_BUILD_IDS.BOND_OF_LIFE_DPS,
    character: Character.CLORINDE,
    recipe: fourPiece(ArtifactSet.FRAGMENT_OF_HARMONIC_WHIMSY),
    sands: [AttributeType.ATK_PERCENT],
    goblet: [AttributeType.ELECTRO_DAMAGE_BONUS],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ENERGY_RECHARGE, 0.6],
      [AttributeType.ELEMENTAL_MASTERY, 0.6],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/clorinde-quickguide/ — Thundering Fury Aggravate
  preset({
    name: PRESET_BUILD_IDS.AGGRAVATE_DPS,
    character: Character.CLORINDE,
    recipe: fourPiece(ArtifactSet.THUNDERING_FURY),
    sands: [AttributeType.ATK_PERCENT],
    goblet: [AttributeType.ELECTRO_DAMAGE_BONUS],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.6],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/emilie-quickguide/
  preset({
    name: PRESET_BUILD_IDS.BURNING_OFF_FIELD_DPS,
    character: Character.EMILIE,
    recipe: fourPiece(ArtifactSet.UNFINISHED_REVERIE),
    sands: [AttributeType.ATK_PERCENT],
    goblet: [AttributeType.DENDRO_DAMAGE_BONUS],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ENERGY_RECHARGE, 0.6],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/kachina-quickguide/
  preset({
    name: PRESET_BUILD_IDS.SCROLL_SUPPORT,
    character: Character.KACHINA,
    recipe: fourPiece(ArtifactSet.SCROLL_OF_THE_HERO_OF_CINDER_CITY),
    sands: [AttributeType.DEF_PERCENT],
    goblet: [AttributeType.GEO_DAMAGE_BONUS],
    circlet: critCirclet,
    substats: [
      [AttributeType.ENERGY_RECHARGE, 1],
      [AttributeType.CRIT_RATE, 0.8],
      [AttributeType.CRIT_DAMAGE, 0.8],
      [AttributeType.DEF_PERCENT, 0.8],
      [AttributeType.DEF, 0.3],
    ],
  }),

  // https://keqingmains.com/q/kinich-quickguide/
  preset({
    name: PRESET_BUILD_IDS.SKILL_CANNON_DPS,
    character: Character.KINICH,
    recipe: fourPiece(ArtifactSet.OBSIDIAN_CODEX),
    sands: [AttributeType.ATK_PERCENT],
    goblet: [AttributeType.DENDRO_DAMAGE_BONUS],
    circlet: [AttributeType.CRIT_DAMAGE, AttributeType.CRIT_RATE],
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ENERGY_RECHARGE, 0.6],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/mualani-quickguide/
  preset({
    name: PRESET_BUILD_IDS.VAPORIZE_DPS,
    character: Character.MUALANI,
    recipe: fourPiece(ArtifactSet.OBSIDIAN_CODEX),
    sands: [AttributeType.HP_PERCENT, AttributeType.ELEMENTAL_MASTERY],
    goblet: [AttributeType.HYDRO_DAMAGE_BONUS, AttributeType.HP_PERCENT],
    circlet: [AttributeType.CRIT_DAMAGE, AttributeType.HP_PERCENT],
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.HP_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.8],
      [AttributeType.HP, 0.3],
    ],
  }),

  // https://keqingmains.com/q/ororon-quickguide/
  preset({
    name: PRESET_BUILD_IDS.ELECTRO_CHARGED_DPS,
    character: Character.ORORON,
    recipe: fourPiece(ArtifactSet.SCROLL_OF_THE_HERO_OF_CINDER_CITY),
    sands: [AttributeType.ATK_PERCENT, AttributeType.ENERGY_RECHARGE],
    goblet: [AttributeType.ELECTRO_DAMAGE_BONUS],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.6],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/ororon-quickguide/ — Overloaded trigger
  preset({
    name: PRESET_BUILD_IDS.OVERLOADED_TRIGGER,
    character: Character.ORORON,
    recipe: fourPiece(ArtifactSet.SCROLL_OF_THE_HERO_OF_CINDER_CITY),
    sands: [AttributeType.ELEMENTAL_MASTERY],
    goblet: [AttributeType.ELEMENTAL_MASTERY],
    circlet: [AttributeType.ELEMENTAL_MASTERY],
    substats: [
      [AttributeType.ELEMENTAL_MASTERY, 1],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.CRIT_RATE, 0.4],
      [AttributeType.CRIT_DAMAGE, 0.4],
      [AttributeType.ATK_PERCENT, 0.2],
    ],
  }),

  // https://keqingmains.com/q/xilonen-quickguide/
  preset({
    name: PRESET_BUILD_IDS.RES_SHRED_HEALING_SUPPORT,
    character: Character.XILONEN,
    recipe: fourPiece(ArtifactSet.SCROLL_OF_THE_HERO_OF_CINDER_CITY),
    sands: [AttributeType.ENERGY_RECHARGE, AttributeType.DEF_PERCENT],
    goblet: [AttributeType.DEF_PERCENT],
    circlet: [
      AttributeType.HEALING_BONUS,
      AttributeType.DEF_PERCENT,
      AttributeType.CRIT_RATE,
    ],
    substats: [
      [AttributeType.ENERGY_RECHARGE, 1],
      [AttributeType.CRIT_RATE, 0.8],
      [AttributeType.DEF_PERCENT, 0.6],
      [AttributeType.DEF, 0.3],
    ],
  }),

  // https://keqingmains.com/q/chasca-quickguide/
  preset({
    name: PRESET_BUILD_IDS.MULTI_ELEMENT_CHARGED_DPS,
    character: Character.CHASCA,
    recipe: fourPiece(ArtifactSet.OBSIDIAN_CODEX),
    sands: [AttributeType.ATK_PERCENT],
    goblet: [AttributeType.ATK_PERCENT],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.6],
      [AttributeType.ENERGY_RECHARGE, 0.4],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/mavuika-quickguide/
  preset({
    name: PRESET_BUILD_IDS.ON_FIELD_BURST_DPS,
    character: Character.MAVUIKA,
    recipe: fourPiece(ArtifactSet.OBSIDIAN_CODEX),
    sands: [AttributeType.ATK_PERCENT, AttributeType.ELEMENTAL_MASTERY],
    goblet: [AttributeType.PYRO_DAMAGE_BONUS],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.8],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/mavuika-quickguide/ — Off-field Skill DPS
  preset({
    name: PRESET_BUILD_IDS.OFF_FIELD_PYRO_DPS,
    character: Character.MAVUIKA,
    recipe: fourPiece(ArtifactSet.SCROLL_OF_THE_HERO_OF_CINDER_CITY),
    sands: [AttributeType.ATK_PERCENT, AttributeType.ELEMENTAL_MASTERY],
    goblet: [AttributeType.PYRO_DAMAGE_BONUS],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.8],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/citlali-quickguide/
  preset({
    name: PRESET_BUILD_IDS.MELT_SHIELD_SUPPORT,
    character: Character.CITLALI,
    recipe: fourPiece(ArtifactSet.SCROLL_OF_THE_HERO_OF_CINDER_CITY),
    sands: [AttributeType.ELEMENTAL_MASTERY, AttributeType.ENERGY_RECHARGE],
    goblet: [AttributeType.ELEMENTAL_MASTERY],
    circlet: [AttributeType.ELEMENTAL_MASTERY],
    substats: [
      [AttributeType.ELEMENTAL_MASTERY, 1],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.CRIT_RATE, 0.6],
      [AttributeType.CRIT_DAMAGE, 0.3],
    ],
  }),

  // https://keqingmains.com/q/lan-yan-quickguide/
  preset({
    name: PRESET_BUILD_IDS.SHIELD_SUPPORT,
    character: Character.LAN_YAN,
    recipe: fourPiece(ArtifactSet.VIRIDESCENT_VENERER),
    sands: [AttributeType.ATK_PERCENT],
    goblet: [AttributeType.ATK_PERCENT],
    circlet: [AttributeType.ATK_PERCENT],
    substats: [
      [AttributeType.ENERGY_RECHARGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.CRIT_RATE, 0.6],
      [AttributeType.ELEMENTAL_MASTERY, 0.4],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/lan-yan-quickguide/ — On-field Swirl driver
  preset({
    name: PRESET_BUILD_IDS.SWIRL_DRIVER,
    character: Character.LAN_YAN,
    recipe: fourPiece(ArtifactSet.VIRIDESCENT_VENERER),
    sands: [AttributeType.ELEMENTAL_MASTERY],
    goblet: [AttributeType.ELEMENTAL_MASTERY],
    circlet: [AttributeType.ELEMENTAL_MASTERY],
    substats: [
      [AttributeType.ELEMENTAL_MASTERY, 1],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.ATK_PERCENT, 0.6],
      [AttributeType.CRIT_RATE, 0.4],
      [AttributeType.CRIT_DAMAGE, 0.4],
    ],
  }),

  // https://keqingmains.com/q/mizuki-quickguide/
  preset({
    name: PRESET_BUILD_IDS.SWIRL_DRIVER,
    character: Character.YUMEMIZUKI_MIZUKI,
    recipe: fourPiece(ArtifactSet.VIRIDESCENT_VENERER),
    sands: [AttributeType.ELEMENTAL_MASTERY],
    goblet: [AttributeType.ELEMENTAL_MASTERY],
    circlet: [AttributeType.ELEMENTAL_MASTERY],
    substats: [
      [AttributeType.ELEMENTAL_MASTERY, 1],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.CRIT_RATE, 0.6],
      [AttributeType.CRIT_DAMAGE, 0.3],
    ],
  }),

  // https://keqingmains.com/q/iansan-quickguide/
  preset({
    name: PRESET_BUILD_IDS.ATK_SUPPORT,
    character: Character.IANSAN,
    recipe: fourPiece(ArtifactSet.SCROLL_OF_THE_HERO_OF_CINDER_CITY),
    sands: [AttributeType.ENERGY_RECHARGE],
    goblet: [AttributeType.ATK_PERCENT],
    circlet: [AttributeType.ATK_PERCENT],
    substats: [
      [AttributeType.ENERGY_RECHARGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.CRIT_RATE, 0.6],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/varesa-quickguide/
  preset({
    name: PRESET_BUILD_IDS.PLUNGING_ATTACK_DPS,
    character: Character.VARESA,
    recipe: fourPiece(ArtifactSet.LONG_NIGHTS_OATH),
    alternativeRecipes: [fourPiece(ArtifactSet.OBSIDIAN_CODEX)],
    sands: [AttributeType.ATK_PERCENT],
    goblet: [AttributeType.ELECTRO_DAMAGE_BONUS],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.6],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/ifa-quickguide/
  preset({
    name: PRESET_BUILD_IDS.SWIRL_DRIVER,
    character: Character.IFA,
    recipe: fourPiece(ArtifactSet.VIRIDESCENT_VENERER),
    sands: [AttributeType.ELEMENTAL_MASTERY],
    goblet: [AttributeType.ELEMENTAL_MASTERY],
    circlet: [AttributeType.ELEMENTAL_MASTERY],
    substats: [
      [AttributeType.ELEMENTAL_MASTERY, 1],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.CRIT_RATE, 0.6],
      [AttributeType.CRIT_DAMAGE, 0.3],
    ],
  }),

  // https://keqingmains.com/q/ifa-quickguide/ — Talent-damage carry
  preset({
    name: PRESET_BUILD_IDS.ANEMO_DPS,
    character: Character.IFA,
    recipe: fourPiece(ArtifactSet.OBSIDIAN_CODEX),
    sands: [AttributeType.ATK_PERCENT],
    goblet: [AttributeType.ANEMO_DAMAGE_BONUS],
    circlet: critCirclet,
    substats: [
      [AttributeType.ENERGY_RECHARGE, 1],
      [AttributeType.CRIT_RATE, 0.8],
      [AttributeType.CRIT_DAMAGE, 0.8],
      [AttributeType.ATK_PERCENT, 0.6],
      [AttributeType.ELEMENTAL_MASTERY, 0.3],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/escoffier-quickguide/
  preset({
    name: PRESET_BUILD_IDS.CRYO_OFF_FIELD_DPS_HEALER,
    character: Character.ESCOFFIER,
    recipe: fourPiece(ArtifactSet.GOLDEN_TROUPE),
    sands: [AttributeType.ATK_PERCENT],
    goblet: [AttributeType.CRYO_DAMAGE_BONUS],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/skirk-quickguide/
  preset({
    name: PRESET_BUILD_IDS.QUICKSWAP_BURST_DPS,
    character: Character.SKIRK,
    recipe: fourPiece(ArtifactSet.FINALE_OF_THE_DEEP_GALLERIES),
    sands: [AttributeType.ATK_PERCENT],
    goblet: [AttributeType.CRYO_DAMAGE_BONUS],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/skirk-quickguide/ — Furina on-field Normal Attacks
  preset({
    name: PRESET_BUILD_IDS.ON_FIELD_NORMAL_ATTACK_DPS,
    character: Character.SKIRK,
    recipe: fourPiece(ArtifactSet.MARECHAUSSEE_HUNTER),
    sands: [AttributeType.ATK_PERCENT],
    goblet: [AttributeType.CRYO_DAMAGE_BONUS, AttributeType.ATK_PERCENT],
    circlet: [
      AttributeType.CRIT_DAMAGE,
      AttributeType.CRIT_RATE,
      AttributeType.ATK_PERCENT,
    ],
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/dahlia-quickguide/
  preset({
    name: PRESET_BUILD_IDS.SHIELD_ATK_SPEED_SUPPORT,
    character: Character.DAHLIA,
    recipe: fourPiece(ArtifactSet.NOBLESSE_OBLIGE),
    sands: [AttributeType.ENERGY_RECHARGE],
    goblet: [AttributeType.HP_PERCENT],
    circlet: [AttributeType.HP_PERCENT],
    substats: [
      [AttributeType.ENERGY_RECHARGE, 1],
      [AttributeType.CRIT_RATE, 0.8],
      [AttributeType.HP_PERCENT, 0.6],
      [AttributeType.HP, 0.3],
    ],
  }),

  // https://keqingmains.com/q/ineffa-quickguide/
  preset({
    name: PRESET_BUILD_IDS.LUNAR_CHARGED_DPS,
    character: Character.INEFFA,
    recipe: fourPiece(ArtifactSet.AUBADE_OF_MORNINGSTAR_AND_MOON),
    sands: [AttributeType.ATK_PERCENT],
    goblet: [AttributeType.ATK_PERCENT],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ENERGY_RECHARGE, 0.6],
      [AttributeType.ELEMENTAL_MASTERY, 0.6],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/ineffa-quickguide/ — Hyperbloom trigger
  preset({
    name: PRESET_BUILD_IDS.HYPERBLOOM_TRIGGER,
    character: Character.INEFFA,
    recipe: fourPiece(ArtifactSet.GILDED_DREAMS),
    sands: [AttributeType.ELEMENTAL_MASTERY],
    goblet: [AttributeType.ELEMENTAL_MASTERY],
    circlet: [AttributeType.ELEMENTAL_MASTERY],
    substats: [
      [AttributeType.ELEMENTAL_MASTERY, 1],
      [AttributeType.ENERGY_RECHARGE, 0.6],
      [AttributeType.ATK_PERCENT, 0.4],
      [AttributeType.CRIT_RATE, 0.3],
      [AttributeType.CRIT_DAMAGE, 0.3],
    ],
  }),

  // https://keqingmains.com/q/lauma-quickguide/
  preset({
    name: PRESET_BUILD_IDS.BLOOM_SUPPORT,
    character: Character.LAUMA,
    recipe: fourPiece(ArtifactSet.SILKEN_MOONS_SERENADE),
    sands: [AttributeType.ELEMENTAL_MASTERY, AttributeType.ENERGY_RECHARGE],
    goblet: [AttributeType.ELEMENTAL_MASTERY],
    circlet: [AttributeType.ELEMENTAL_MASTERY],
    substats: [
      [AttributeType.ELEMENTAL_MASTERY, 1],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.CRIT_RATE, 0.6],
      [AttributeType.CRIT_DAMAGE, 0.6],
    ],
  }),

  // https://keqingmains.com/q/flins-quickguide/
  preset({
    name: PRESET_BUILD_IDS.LUNAR_CHARGED_DPS,
    character: Character.FLINS,
    recipe: fourPiece(ArtifactSet.NIGHT_OF_THE_SKYS_UNVEILING),
    sands: [AttributeType.ATK_PERCENT],
    goblet: [AttributeType.ATK_PERCENT],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.6],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/aino-quickguide/
  preset({
    name: PRESET_BUILD_IDS.OFF_FIELD_HYDRO_SUPPORT,
    character: Character.AINO,
    recipe: fourPiece(ArtifactSet.SILKEN_MOONS_SERENADE),
    sands: [AttributeType.ENERGY_RECHARGE],
    goblet: [AttributeType.ELEMENTAL_MASTERY],
    circlet: [AttributeType.ELEMENTAL_MASTERY],
    substats: [
      [AttributeType.ENERGY_RECHARGE, 1],
      [AttributeType.CRIT_RATE, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.6],
      [AttributeType.CRIT_DAMAGE, 0.4],
      [AttributeType.ATK_PERCENT, 0.2],
    ],
  }),

  // https://keqingmains.com/q/nefer-quickguide/
  preset({
    name: PRESET_BUILD_IDS.LUNAR_BLOOM_CHARGED_DPS,
    character: Character.NEFER,
    recipe: fourPiece(ArtifactSet.NIGHT_OF_THE_SKYS_UNVEILING),
    sands: [AttributeType.ELEMENTAL_MASTERY],
    goblet: [AttributeType.ELEMENTAL_MASTERY],
    circlet: [...critCirclet, AttributeType.ELEMENTAL_MASTERY],
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ELEMENTAL_MASTERY, 0.8],
      [AttributeType.ENERGY_RECHARGE, 0.4],
    ],
  }),

  // https://keqingmains.com/q/durin-quickguide/
  preset({
    name: PRESET_BUILD_IDS.WHITE_DRAGON_SUPPORT,
    character: Character.DURIN,
    recipe: fourPiece(ArtifactSet.NOBLESSE_OBLIGE),
    sands: [
      AttributeType.ATK_PERCENT,
      AttributeType.ELEMENTAL_MASTERY,
      AttributeType.ENERGY_RECHARGE,
    ],
    goblet: [AttributeType.PYRO_DAMAGE_BONUS, AttributeType.ATK_PERCENT],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ENERGY_RECHARGE, 0.6],
      [AttributeType.ELEMENTAL_MASTERY, 0.6],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/durin-quickguide/ — Dark Dragon reaction DPS
  preset({
    name: PRESET_BUILD_IDS.DARK_DRAGON_REACTION_DPS,
    character: Character.DURIN,
    recipe: fourPiece(ArtifactSet.CRIMSON_WITCH_OF_FLAMES),
    sands: [
      AttributeType.ATK_PERCENT,
      AttributeType.ELEMENTAL_MASTERY,
      AttributeType.ENERGY_RECHARGE,
    ],
    goblet: [AttributeType.PYRO_DAMAGE_BONUS, AttributeType.ATK_PERCENT],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.6],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/jahoda-quickguide/
  preset({
    name: PRESET_BUILD_IDS.OFF_FIELD_HEALER,
    character: Character.JAHODA,
    recipe: fourPiece(ArtifactSet.VIRIDESCENT_VENERER),
    sands: [AttributeType.ENERGY_RECHARGE, AttributeType.ATK_PERCENT],
    goblet: [AttributeType.ATK_PERCENT],
    circlet: [
      AttributeType.CRIT_RATE,
      AttributeType.HEALING_BONUS,
      AttributeType.ATK_PERCENT,
    ],
    substats: [
      [AttributeType.ENERGY_RECHARGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.CRIT_RATE, 0.6],
      [AttributeType.CRIT_DAMAGE, 0.3],
      [AttributeType.ELEMENTAL_MASTERY, 0.3],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/columbina-quickguide/
  preset({
    name: PRESET_BUILD_IDS.OFF_FIELD_LUNAR_SUPPORT,
    character: Character.COLUMBINA,
    recipe: fourPiece(ArtifactSet.SILKEN_MOONS_SERENADE),
    sands: [AttributeType.ENERGY_RECHARGE, AttributeType.HP_PERCENT],
    goblet: [AttributeType.HP_PERCENT],
    circlet: [...critCirclet, AttributeType.HP_PERCENT],
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.HP_PERCENT, 0.8],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.6],
      [AttributeType.HP, 0.3],
    ],
  }),

  // https://keqingmains.com/q/columbina-quickguide/ — On-field Lunar-Bloom
  preset({
    name: PRESET_BUILD_IDS.ON_FIELD_LUNAR_BLOOM_DPS,
    character: Character.COLUMBINA,
    recipe: fourPiece(ArtifactSet.NIGHT_OF_THE_SKYS_UNVEILING),
    sands: [AttributeType.HP_PERCENT, AttributeType.ENERGY_RECHARGE],
    goblet: [AttributeType.HP_PERCENT],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.HP_PERCENT, 0.8],
      [AttributeType.ENERGY_RECHARGE, 0.6],
      [AttributeType.ELEMENTAL_MASTERY, 0.4],
      [AttributeType.HP, 0.3],
    ],
  }),

  // https://keqingmains.com/q/zibai-quickguide/
  preset({
    name: PRESET_BUILD_IDS.LUNAR_CRYSTALLIZE_DPS,
    character: Character.ZIBAI,
    recipe: fourPiece(ArtifactSet.NIGHT_OF_THE_SKYS_UNVEILING),
    sands: [AttributeType.DEF_PERCENT],
    goblet: [AttributeType.DEF_PERCENT],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.DEF_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.6],
      [AttributeType.ENERGY_RECHARGE, 0.3],
      [AttributeType.DEF, 0.2],
    ],
  }),

  // https://keqingmains.com/q/illuga-quickguide/
  preset({
    name: PRESET_BUILD_IDS.LUNAR_CRYSTALLIZE_SUPPORT,
    character: Character.ILLUGA,
    recipe: fourPiece(ArtifactSet.SILKEN_MOONS_SERENADE),
    sands: [AttributeType.ELEMENTAL_MASTERY, AttributeType.ENERGY_RECHARGE],
    goblet: [AttributeType.ELEMENTAL_MASTERY],
    circlet: [AttributeType.ELEMENTAL_MASTERY, AttributeType.CRIT_RATE],
    substats: [
      [AttributeType.ENERGY_RECHARGE, 1],
      [AttributeType.ELEMENTAL_MASTERY, 0.8],
      [AttributeType.CRIT_RATE, 0.6],
      [AttributeType.CRIT_DAMAGE, 0.3],
      [AttributeType.DEF_PERCENT, 0.3],
      [AttributeType.DEF, 0.2],
    ],
  }),

  // https://keqingmains.com/q/illuga-quickguide/ — ATK-scaling Geo carry support
  preset({
    name: PRESET_BUILD_IDS.GEO_DPS_SUPPORT,
    character: Character.ILLUGA,
    recipe: fourPiece(ArtifactSet.NOBLESSE_OBLIGE),
    sands: [AttributeType.ELEMENTAL_MASTERY, AttributeType.ENERGY_RECHARGE],
    goblet: [AttributeType.ELEMENTAL_MASTERY],
    circlet: [AttributeType.ELEMENTAL_MASTERY, AttributeType.CRIT_RATE],
    substats: [
      [AttributeType.ENERGY_RECHARGE, 1],
      [AttributeType.ELEMENTAL_MASTERY, 0.8],
      [AttributeType.CRIT_RATE, 0.6],
      [AttributeType.CRIT_DAMAGE, 0.3],
      [AttributeType.DEF_PERCENT, 0.3],
      [AttributeType.DEF, 0.2],
    ],
  }),

  // https://keqingmains.com/q/varka-quickguide/
  preset({
    name: PRESET_BUILD_IDS.DUAL_ELEMENT_DPS,
    character: Character.VARKA,
    recipe: fourPiece(ArtifactSet.A_DAY_CARVED_FROM_RISING_WINDS),
    sands: [AttributeType.ATK_PERCENT],
    goblet: [
      AttributeType.PYRO_DAMAGE_BONUS,
      AttributeType.HYDRO_DAMAGE_BONUS,
      AttributeType.ELECTRO_DAMAGE_BONUS,
      AttributeType.CRYO_DAMAGE_BONUS,
      AttributeType.ATK_PERCENT,
    ],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.4],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/q/linnea-quickguide/
  preset({
    name: PRESET_BUILD_IDS.OFF_FIELD_LUNAR_CRYSTALLIZE_DPS,
    character: Character.LINNEA,
    recipe: fourPiece(ArtifactSet.HUSK_OF_OPULENT_DREAMS),
    sands: [AttributeType.DEF_PERCENT],
    goblet: [AttributeType.DEF_PERCENT],
    circlet: [...critCirclet, AttributeType.DEF_PERCENT],
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.DEF_PERCENT, 0.8],
      [AttributeType.ENERGY_RECHARGE, 0.6],
      [AttributeType.ELEMENTAL_MASTERY, 0.4],
      [AttributeType.DEF, 0.2],
    ],
  }),

  // https://keqingmains.com/q/linnea-quickguide/ — front-loaded reaction nuke
  preset({
    name: PRESET_BUILD_IDS.QUICKSWAP_LUNAR_CRYSTALLIZE,
    character: Character.LINNEA,
    recipe: fourPiece(ArtifactSet.AUBADE_OF_MORNINGSTAR_AND_MOON),
    sands: [AttributeType.DEF_PERCENT],
    goblet: [AttributeType.DEF_PERCENT],
    circlet: [...critCirclet, AttributeType.DEF_PERCENT],
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.DEF_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.4],
      [AttributeType.DEF, 0.2],
    ],
  }),

  // https://keqingmains.com/q/lohen-quickguide/
  preset({
    name: PRESET_BUILD_IDS.CRYO_ON_FIELD_DPS,
    character: Character.LOHEN,
    recipe: fourPiece(ArtifactSet.A_DAY_CARVED_FROM_RISING_WINDS),
    sands: [AttributeType.ATK_PERCENT, AttributeType.ELEMENTAL_MASTERY],
    goblet: [AttributeType.CRYO_DAMAGE_BONUS, AttributeType.ATK_PERCENT],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.6],
      [AttributeType.ENERGY_RECHARGE, 0.3],
      [AttributeType.ATK, 0.2],
    ],
  }),

  // https://keqingmains.com/i/nicole/
  preset({
    name: PRESET_BUILD_IDS.SHIELD_ATK_SUPPORT,
    character: Character.NICOLE,
    recipe: fourPiece(ArtifactSet.CELESTIAL_GIFT),
    sands: [AttributeType.ATK_PERCENT, AttributeType.ENERGY_RECHARGE],
    goblet: [AttributeType.ATK_PERCENT],
    circlet: [AttributeType.ATK_PERCENT],
    substats: [
      [AttributeType.ATK_PERCENT, 1],
      [AttributeType.ENERGY_RECHARGE, 0.8],
      [AttributeType.ATK, 0.3],
    ],
  }),

  // https://keqingmains.com/q/prune-quickguide/
  preset({
    name: PRESET_BUILD_IDS.ELEMENTAL_RES_SHRED_SUPPORT,
    character: Character.PRUNE,
    recipe: fourPiece(ArtifactSet.VIRIDESCENT_VENERER),
    sands: [AttributeType.ATK_PERCENT, AttributeType.ENERGY_RECHARGE],
    goblet: [AttributeType.ATK_PERCENT],
    circlet: [AttributeType.ATK_PERCENT],
    substats: [
      [AttributeType.ENERGY_RECHARGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.CRIT_RATE, 0.4],
      [AttributeType.ATK, 0.3],
      [AttributeType.CRIT_DAMAGE, 0.2],
    ],
  }),

  // https://keqingmains.com/q/prune-quickguide/ — Anemo carry support
  preset({
    name: PRESET_BUILD_IDS.ANEMO_DPS_SUPPORT,
    character: Character.PRUNE,
    recipe: fourPiece(ArtifactSet.CELESTIAL_GIFT),
    sands: [AttributeType.ATK_PERCENT, AttributeType.ENERGY_RECHARGE],
    goblet: [AttributeType.ATK_PERCENT],
    circlet: [AttributeType.ATK_PERCENT],
    substats: [
      [AttributeType.ENERGY_RECHARGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.CRIT_RATE, 0.4],
      [AttributeType.ATK, 0.3],
      [AttributeType.CRIT_DAMAGE, 0.2],
    ],
  }),

  // https://genshin-impact-helper-team.github.io/genshin-builds/en/sandrone/
  preset({
    name: PRESET_BUILD_IDS.STELLAR_CONDUCT_CHARGED_DPS,
    character: Character.SANDRONE,
    recipe: fourPiece(ArtifactSet.DISENCHANTMENT_IN_DEEP_SHADOW),
    sands: [AttributeType.ATK_PERCENT],
    goblet: [AttributeType.ATK_PERCENT],
    circlet: critCirclet,
    substats: [
      [AttributeType.CRIT_RATE, 1],
      [AttributeType.CRIT_DAMAGE, 1],
      [AttributeType.ATK_PERCENT, 0.8],
      [AttributeType.ELEMENTAL_MASTERY, 0.6],
      [AttributeType.ENERGY_RECHARGE, 0.4],
      [AttributeType.ATK, 0.2],
    ],
  }),
]);
