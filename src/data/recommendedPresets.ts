import { AttributeType } from "../../genshin/attribute.js";
import type { Build } from "../../genshin/build.js";
import { Character } from "../../genshin/character.js";
import { Set as ArtifactSet } from "../../genshin/set.js";
import { RECOMMENDED_BUILD_NAME } from "./presetNames.js";

type SetRecipe = readonly Readonly<{
  set: ArtifactSet;
  count: 2 | 4;
}>[];

type WeightedSubstat = readonly [type: AttributeType, importance: number];

type PresetInput = Readonly<{
  character: Character;
  recipe: SetRecipe;
  alternativeRecipes?: readonly SetRecipe[];
  sands: readonly AttributeType[];
  goblet: readonly AttributeType[];
  circlet: readonly AttributeType[];
  substats: readonly WeightedSubstat[];
}>;

const preset = ({
  character,
  recipe,
  alternativeRecipes,
  sands,
  goblet,
  circlet,
  substats,
}: PresetInput): Build => ({
  name: RECOMMENDED_BUILD_NAME,
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

const critCirclet = [AttributeType.CRIT_RATE, AttributeType.CRIT_DAMAGE] as const;

/**
 * One focused, general-purpose build for every normal playable character that
 * was missing while the repository still has complete character UI assets.
 *
 * Main stats and priority order are sourced from the linked current KQM quick
 * guides. Importance values translate those ordered recommendations into the
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

  // https://keqingmains.com/q/sethos-quickguide/
  preset({
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

  // https://keqingmains.com/q/clorinde-quickguide/
  preset({
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

  // https://keqingmains.com/q/emilie-quickguide/
  preset({
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

  // https://keqingmains.com/q/xilonen-quickguide/
  preset({
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

  // https://keqingmains.com/q/citlali-quickguide/
  preset({
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

  // https://keqingmains.com/q/mizuki-quickguide/
  preset({
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

  // https://keqingmains.com/q/escoffier-quickguide/
  preset({
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

  // https://keqingmains.com/q/dahlia-quickguide/
  preset({
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

  // https://keqingmains.com/q/lauma-quickguide/
  preset({
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
]);
