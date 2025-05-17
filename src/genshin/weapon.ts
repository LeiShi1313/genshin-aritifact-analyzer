/* eslint-disable */

export const protobufPackage = "io.leishi.genshin.proto";

export enum WeaponType {
  WEAPON_TYPE_UNSPECIFIED = 0,
  BOW = 1,
  CLAYMORE = 2,
  CATALYST = 3,
  POLEARM = 4,
  SWORD = 5,
  UNRECOGNIZED = -1,
}

export function weaponTypeFromJSON(object: any): WeaponType {
  switch (object) {
    case 0:
    case "WEAPON_TYPE_UNSPECIFIED":
      return WeaponType.WEAPON_TYPE_UNSPECIFIED;
    case 1:
    case "BOW":
      return WeaponType.BOW;
    case 2:
    case "CLAYMORE":
      return WeaponType.CLAYMORE;
    case 3:
    case "CATALYST":
      return WeaponType.CATALYST;
    case 4:
    case "POLEARM":
      return WeaponType.POLEARM;
    case 5:
    case "SWORD":
      return WeaponType.SWORD;
    case -1:
    case "UNRECOGNIZED":
    default:
      return WeaponType.UNRECOGNIZED;
  }
}

export function weaponTypeToJSON(object: WeaponType): string {
  switch (object) {
    case WeaponType.WEAPON_TYPE_UNSPECIFIED:
      return "WEAPON_TYPE_UNSPECIFIED";
    case WeaponType.BOW:
      return "BOW";
    case WeaponType.CLAYMORE:
      return "CLAYMORE";
    case WeaponType.CATALYST:
      return "CATALYST";
    case WeaponType.POLEARM:
      return "POLEARM";
    case WeaponType.SWORD:
      return "SWORD";
    case WeaponType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum Weapon {
  WEAPON_UNSPECIFIED = 0,
  AKUOUMARU = 1,
  ALLEY_HUNTER = 2,
  AMENOMA_KAGEUCHI = 3,
  AMOS_BOW = 4,
  APPRENTICES_NOTES = 5,
  AQUA_SIMULACRA = 6,
  AQUILA_FAVONIA = 7,
  A_THOUSAND_FLOATING_DREAMS = 8,
  BEGINNERS_PROTECTOR = 9,
  BLACKCLIFF_AGATE = 10,
  BLACKCLIFF_LONGSWORD = 11,
  BLACKCLIFF_POLE = 12,
  BLACKCLIFF_SLASHER = 13,
  BLACKCLIFF_WARBOW = 14,
  BLACK_TASSEL = 15,
  BLOODTAINTED_GREATSWORD = 16,
  CALAMITY_QUELLER = 17,
  CINNABAR_SPINDLE = 18,
  COMPOUND_BOW = 19,
  COOL_STEEL = 20,
  CRESCENT_PIKE = 21,
  DARK_IRON_SWORD = 22,
  DEATHMATCH = 23,
  DEBATE_CLUB = 24,
  DODOCO_TALES = 25,
  DRAGONS_BANE = 26,
  DRAGONSPINE_SPEAR = 27,
  DULL_BLADE = 28,
  ELEGY_FOR_THE_END = 29,
  EMERALD_ORB = 30,
  END_OF_THE_LINE = 31,
  ENGULFING_LIGHTNING = 32,
  EVERLASTING_MOONGLOW = 33,
  EYE_OF_PERCEPTION = 34,
  FADING_TWILIGHT = 35,
  FAVONIUS_CODEX = 36,
  FAVONIUS_GREATSWORD = 37,
  FAVONIUS_LANCE = 38,
  FAVONIUS_SWORD = 39,
  FAVONIUS_WARBOW = 40,
  FERROUS_SHADOW = 41,
  FESTERING_DESIRE = 42,
  FILLET_BLADE = 43,
  FOREST_REGALIA = 44,
  FREEDOM_SWORN = 45,
  FROSTBEARER = 46,
  FRUIT_OF_FULFILLMENT = 47,
  HAKUSHIN_RING = 48,
  HALBERD = 49,
  HAMAYUMI = 50,
  HARAN_GEPPAKU_FUTSU = 51,
  HARBINGER_OF_DAWN = 52,
  HUNTERS_BOW = 53,
  HUNTERS_PATH = 54,
  IRON_POINT = 55,
  IRON_STING = 56,
  KAGOTSURUBE_ISSHIN = 57,
  KAGURAS_VERITY = 58,
  KATSURAGIKIRI_NAGAMASA = 59,
  KEY_OF_KHAJ_NISUT = 60,
  KINGS_SQUIRE = 61,
  KITAIN_CROSS_SPEAR = 62,
  LIONS_ROAR = 63,
  LITHIC_BLADE = 64,
  LITHIC_SPEAR = 65,
  LOST_PRAYER_TO_THE_SACRED_WINDS = 66,
  LUXURIOUS_SEA_LORD = 67,
  MAGIC_GUIDE = 68,
  MAKHAIRA_AQUAMARINE = 69,
  MAPPA_MARE = 70,
  MEMORY_OF_DUST = 71,
  MESSENGER = 72,
  MISSIVE_WINDSPEAR = 73,
  MISTSPLITTER_REFORGED = 74,
  MITTERNACHTS_WALTZ = 75,
  MOONPIERCER = 76,
  MOUUNS_MOON = 77,
  OATHSWORN_EYE = 78,
  OLD_MERCS_PAL = 79,
  OTHERWORLDLY_STORY = 80,
  POCKET_GRIMOIRE = 81,
  POLAR_STAR = 82,
  PREDATOR = 83,
  PRIMORDIAL_JADE_CUTTER = 84,
  PRIMORDIAL_JADE_WINGED_SPEAR = 85,
  PRIZED_ISSHIN_BLADE = 86,
  PROTOTYPE_AMBER = 87,
  PROTOTYPE_ARCHAIC = 88,
  PROTOTYPE_CRESCENT = 89,
  PROTOTYPE_RANCOUR = 90,
  PROTOTYPE_STARGLITTER = 91,
  RAINSLASHER = 92,
  RAVEN_BOW = 93,
  RECURVE_BOW = 94,
  REDHORN_STONETHRESHER = 95,
  ROYAL_BOW = 96,
  ROYAL_GREATSWORD = 97,
  ROYAL_GRIMOIRE = 98,
  ROYAL_LONGSWORD = 99,
  ROYAL_SPEAR = 100,
  RUST = 101,
  SACRIFICIAL_BOW = 102,
  SACRIFICIAL_FRAGMENTS = 103,
  SACRIFICIAL_GREATSWORD = 104,
  SACRIFICIAL_SWORD = 105,
  SAPWOOD_BLADE = 106,
  SEASONED_HUNTERS_BOW = 107,
  SERPENT_SPINE = 108,
  SHARPSHOOTERS_OATH = 109,
  SILVER_SWORD = 110,
  SKYRIDER_GREATSWORD = 111,
  SKYRIDER_SWORD = 112,
  SKYWARD_ATLAS = 113,
  SKYWARD_BLADE = 114,
  SKYWARD_HARP = 115,
  SKYWARD_PRIDE = 116,
  SKYWARD_SPINE = 117,
  SLINGSHOT = 118,
  SNOW_TOMBED_STARSILVER = 119,
  SOLAR_PEARL = 120,
  SONG_OF_BROKEN_PINES = 121,
  STAFF_OF_HOMA = 122,
  STAFF_OF_THE_SCARLET_SANDS = 123,
  SUMMIT_SHAPER = 124,
  SWORD_OF_DESCENSION = 125,
  THE_ALLEY_FLASH = 126,
  THE_BELL = 127,
  THE_BLACK_SWORD = 128,
  THE_CATCH = 129,
  THE_FLUTE = 130,
  THE_STRINGLESS = 131,
  THE_UNFORGED = 132,
  THE_VIRIDESCENT_HUNT = 133,
  THE_WIDSITH = 134,
  THRILLING_TALES_OF_DRAGON_SLAYERS = 135,
  THUNDERING_PULSE = 136,
  TOUKABOU_SHIGURE = 137,
  TRAVELERS_HANDY_SWORD = 138,
  TULAYTULLAHS_REMEMBRANCE = 139,
  TWIN_NEPHRITE = 140,
  VORTEX_VANQUISHER = 141,
  WANDERING_EVENSTAR = 142,
  WASTER_GREATSWORD = 143,
  WAVEBREAKERS_FIN = 144,
  WHITEBLIND = 145,
  WHITE_IRON_GREATSWORD = 146,
  WHITE_TASSEL = 147,
  WINDBLUME_ODE = 148,
  WINE_AND_SONG = 149,
  WOLFS_GRAVESTONE = 150,
  XIPHOS_MOONLIGHT = 151,
  LIGHT_OF_FOLIAR_INCISION = 152,
  BEACON_OF_THE_REED_SEA = 153,
  MAILED_FLOWER = 154,
  JADEFALLS_SPLENDOR = 155,
  BALLAD_OF_THE_FJORDS = 156,
  FINALE_OF_THE_DEEP = 157,
  FLEUVE_CENDRE_FERRYMAN = 158,
  FLOWING_PURITY = 159,
  RIGHTFUL_REWARD = 160,
  SACRIFICIAL_JADE = 161,
  SCION_OF_THE_BLAZING_SUN = 162,
  SONG_OF_STILLNESS = 163,
  TALKING_STICK = 164,
  THE_FIRST_GREAT_MAGIC = 165,
  TIDAL_SHADOW = 166,
  WOLF_FANG = 167,
  BALLAD_OF_THE_BOUNDLESS_BLUE = 168,
  CASHFLOW_SUPERVISION = 169,
  PORTABLE_POWER_SAW = 170,
  PROSPECTORS_DRILL = 171,
  RANGE_GAUGE = 172,
  THE_DOCKHANDS_ASSISTANT = 173,
  TOME_OF_THE_ETERNAL_FLOW = 174,
  SPLENDOR_OF_TRANQUIL_WATERS = 175,
  SWORD_OF_NARZISSENKREUZ = 176,
  ULTIMATE_OVERLORDS_MEGA_MAGIC_SWORD = 177,
  VERDICT = 178,
  CRANES_ECHOING_CALL = 179,
  URAKU_MISUGIRI = 180,
  DIALOGUES_OF_THE_DESERT_SAGES = 181,
  ABSOLUTION = 182,
  CRIMSON_MOONS_SEMBLANCE = 183,
  LUMIDOUCE_ELEGY = 184,
  IBIS_PIERCER = 185,
  CLOUDFORGED = 186,
  SILVERSHOWER_HEARTSTRINGS = 187,
  FLUTE_OF_EZPITZAL = 188,
  EARTH_SHAKER = 189,
  FANG_OF_THE_MOUNTAIN_KING = 190,
  FOOTPRINT_OF_THE_RAINBOW = 191,
  ASH_GRAVEN_DRINKING_HORN = 192,
  RING_OF_YAXCHE = 193,
  SURFS_UP = 194,
  CHAIN_BREAKER = 195,
  STURDY_BONE = 196,
  CALAMITY_OF_ESHU = 197,
  PEAK_PATROL_SONG = 198,
  FRUITFUL_HOOK = 199,
  A_THOUSAND_BLAZING_SUNS = 200,
  MOUNTAIN_BRACING_BOLT = 201,
  TAMAYURATEI_NO_OHANASHI = 202,
  SYMPHONIST_OF_SCENTS = 203,
  WAVERIDING_WHIRL = 204,
  STARCALLERS_WATCH = 205,
  SUNNY_MORNING_SLEEP_IN = 206,
  VIVID_NOTIONS = 207,
  FLOWER_WREATHED_FEATHERS = 208,
  SEQUENCE_OF_SOLITUDE = 209,
  ASTRAL_VULTURES_CRIMSON_PLUMAGE = 210,
  UNRECOGNIZED = -1,
}

export function weaponFromJSON(object: any): Weapon {
  switch (object) {
    case 0:
    case "WEAPON_UNSPECIFIED":
      return Weapon.WEAPON_UNSPECIFIED;
    case 1:
    case "AKUOUMARU":
      return Weapon.AKUOUMARU;
    case 2:
    case "ALLEY_HUNTER":
      return Weapon.ALLEY_HUNTER;
    case 3:
    case "AMENOMA_KAGEUCHI":
      return Weapon.AMENOMA_KAGEUCHI;
    case 4:
    case "AMOS_BOW":
      return Weapon.AMOS_BOW;
    case 5:
    case "APPRENTICES_NOTES":
      return Weapon.APPRENTICES_NOTES;
    case 6:
    case "AQUA_SIMULACRA":
      return Weapon.AQUA_SIMULACRA;
    case 7:
    case "AQUILA_FAVONIA":
      return Weapon.AQUILA_FAVONIA;
    case 8:
    case "A_THOUSAND_FLOATING_DREAMS":
      return Weapon.A_THOUSAND_FLOATING_DREAMS;
    case 9:
    case "BEGINNERS_PROTECTOR":
      return Weapon.BEGINNERS_PROTECTOR;
    case 10:
    case "BLACKCLIFF_AGATE":
      return Weapon.BLACKCLIFF_AGATE;
    case 11:
    case "BLACKCLIFF_LONGSWORD":
      return Weapon.BLACKCLIFF_LONGSWORD;
    case 12:
    case "BLACKCLIFF_POLE":
      return Weapon.BLACKCLIFF_POLE;
    case 13:
    case "BLACKCLIFF_SLASHER":
      return Weapon.BLACKCLIFF_SLASHER;
    case 14:
    case "BLACKCLIFF_WARBOW":
      return Weapon.BLACKCLIFF_WARBOW;
    case 15:
    case "BLACK_TASSEL":
      return Weapon.BLACK_TASSEL;
    case 16:
    case "BLOODTAINTED_GREATSWORD":
      return Weapon.BLOODTAINTED_GREATSWORD;
    case 17:
    case "CALAMITY_QUELLER":
      return Weapon.CALAMITY_QUELLER;
    case 18:
    case "CINNABAR_SPINDLE":
      return Weapon.CINNABAR_SPINDLE;
    case 19:
    case "COMPOUND_BOW":
      return Weapon.COMPOUND_BOW;
    case 20:
    case "COOL_STEEL":
      return Weapon.COOL_STEEL;
    case 21:
    case "CRESCENT_PIKE":
      return Weapon.CRESCENT_PIKE;
    case 22:
    case "DARK_IRON_SWORD":
      return Weapon.DARK_IRON_SWORD;
    case 23:
    case "DEATHMATCH":
      return Weapon.DEATHMATCH;
    case 24:
    case "DEBATE_CLUB":
      return Weapon.DEBATE_CLUB;
    case 25:
    case "DODOCO_TALES":
      return Weapon.DODOCO_TALES;
    case 26:
    case "DRAGONS_BANE":
      return Weapon.DRAGONS_BANE;
    case 27:
    case "DRAGONSPINE_SPEAR":
      return Weapon.DRAGONSPINE_SPEAR;
    case 28:
    case "DULL_BLADE":
      return Weapon.DULL_BLADE;
    case 29:
    case "ELEGY_FOR_THE_END":
      return Weapon.ELEGY_FOR_THE_END;
    case 30:
    case "EMERALD_ORB":
      return Weapon.EMERALD_ORB;
    case 31:
    case "END_OF_THE_LINE":
      return Weapon.END_OF_THE_LINE;
    case 32:
    case "ENGULFING_LIGHTNING":
      return Weapon.ENGULFING_LIGHTNING;
    case 33:
    case "EVERLASTING_MOONGLOW":
      return Weapon.EVERLASTING_MOONGLOW;
    case 34:
    case "EYE_OF_PERCEPTION":
      return Weapon.EYE_OF_PERCEPTION;
    case 35:
    case "FADING_TWILIGHT":
      return Weapon.FADING_TWILIGHT;
    case 36:
    case "FAVONIUS_CODEX":
      return Weapon.FAVONIUS_CODEX;
    case 37:
    case "FAVONIUS_GREATSWORD":
      return Weapon.FAVONIUS_GREATSWORD;
    case 38:
    case "FAVONIUS_LANCE":
      return Weapon.FAVONIUS_LANCE;
    case 39:
    case "FAVONIUS_SWORD":
      return Weapon.FAVONIUS_SWORD;
    case 40:
    case "FAVONIUS_WARBOW":
      return Weapon.FAVONIUS_WARBOW;
    case 41:
    case "FERROUS_SHADOW":
      return Weapon.FERROUS_SHADOW;
    case 42:
    case "FESTERING_DESIRE":
      return Weapon.FESTERING_DESIRE;
    case 43:
    case "FILLET_BLADE":
      return Weapon.FILLET_BLADE;
    case 44:
    case "FOREST_REGALIA":
      return Weapon.FOREST_REGALIA;
    case 45:
    case "FREEDOM_SWORN":
      return Weapon.FREEDOM_SWORN;
    case 46:
    case "FROSTBEARER":
      return Weapon.FROSTBEARER;
    case 47:
    case "FRUIT_OF_FULFILLMENT":
      return Weapon.FRUIT_OF_FULFILLMENT;
    case 48:
    case "HAKUSHIN_RING":
      return Weapon.HAKUSHIN_RING;
    case 49:
    case "HALBERD":
      return Weapon.HALBERD;
    case 50:
    case "HAMAYUMI":
      return Weapon.HAMAYUMI;
    case 51:
    case "HARAN_GEPPAKU_FUTSU":
      return Weapon.HARAN_GEPPAKU_FUTSU;
    case 52:
    case "HARBINGER_OF_DAWN":
      return Weapon.HARBINGER_OF_DAWN;
    case 53:
    case "HUNTERS_BOW":
      return Weapon.HUNTERS_BOW;
    case 54:
    case "HUNTERS_PATH":
      return Weapon.HUNTERS_PATH;
    case 55:
    case "IRON_POINT":
      return Weapon.IRON_POINT;
    case 56:
    case "IRON_STING":
      return Weapon.IRON_STING;
    case 57:
    case "KAGOTSURUBE_ISSHIN":
      return Weapon.KAGOTSURUBE_ISSHIN;
    case 58:
    case "KAGURAS_VERITY":
      return Weapon.KAGURAS_VERITY;
    case 59:
    case "KATSURAGIKIRI_NAGAMASA":
      return Weapon.KATSURAGIKIRI_NAGAMASA;
    case 60:
    case "KEY_OF_KHAJ_NISUT":
      return Weapon.KEY_OF_KHAJ_NISUT;
    case 61:
    case "KINGS_SQUIRE":
      return Weapon.KINGS_SQUIRE;
    case 62:
    case "KITAIN_CROSS_SPEAR":
      return Weapon.KITAIN_CROSS_SPEAR;
    case 63:
    case "LIONS_ROAR":
      return Weapon.LIONS_ROAR;
    case 64:
    case "LITHIC_BLADE":
      return Weapon.LITHIC_BLADE;
    case 65:
    case "LITHIC_SPEAR":
      return Weapon.LITHIC_SPEAR;
    case 66:
    case "LOST_PRAYER_TO_THE_SACRED_WINDS":
      return Weapon.LOST_PRAYER_TO_THE_SACRED_WINDS;
    case 67:
    case "LUXURIOUS_SEA_LORD":
      return Weapon.LUXURIOUS_SEA_LORD;
    case 68:
    case "MAGIC_GUIDE":
      return Weapon.MAGIC_GUIDE;
    case 69:
    case "MAKHAIRA_AQUAMARINE":
      return Weapon.MAKHAIRA_AQUAMARINE;
    case 70:
    case "MAPPA_MARE":
      return Weapon.MAPPA_MARE;
    case 71:
    case "MEMORY_OF_DUST":
      return Weapon.MEMORY_OF_DUST;
    case 72:
    case "MESSENGER":
      return Weapon.MESSENGER;
    case 73:
    case "MISSIVE_WINDSPEAR":
      return Weapon.MISSIVE_WINDSPEAR;
    case 74:
    case "MISTSPLITTER_REFORGED":
      return Weapon.MISTSPLITTER_REFORGED;
    case 75:
    case "MITTERNACHTS_WALTZ":
      return Weapon.MITTERNACHTS_WALTZ;
    case 76:
    case "MOONPIERCER":
      return Weapon.MOONPIERCER;
    case 77:
    case "MOUUNS_MOON":
      return Weapon.MOUUNS_MOON;
    case 78:
    case "OATHSWORN_EYE":
      return Weapon.OATHSWORN_EYE;
    case 79:
    case "OLD_MERCS_PAL":
      return Weapon.OLD_MERCS_PAL;
    case 80:
    case "OTHERWORLDLY_STORY":
      return Weapon.OTHERWORLDLY_STORY;
    case 81:
    case "POCKET_GRIMOIRE":
      return Weapon.POCKET_GRIMOIRE;
    case 82:
    case "POLAR_STAR":
      return Weapon.POLAR_STAR;
    case 83:
    case "PREDATOR":
      return Weapon.PREDATOR;
    case 84:
    case "PRIMORDIAL_JADE_CUTTER":
      return Weapon.PRIMORDIAL_JADE_CUTTER;
    case 85:
    case "PRIMORDIAL_JADE_WINGED_SPEAR":
      return Weapon.PRIMORDIAL_JADE_WINGED_SPEAR;
    case 86:
    case "PRIZED_ISSHIN_BLADE":
      return Weapon.PRIZED_ISSHIN_BLADE;
    case 87:
    case "PROTOTYPE_AMBER":
      return Weapon.PROTOTYPE_AMBER;
    case 88:
    case "PROTOTYPE_ARCHAIC":
      return Weapon.PROTOTYPE_ARCHAIC;
    case 89:
    case "PROTOTYPE_CRESCENT":
      return Weapon.PROTOTYPE_CRESCENT;
    case 90:
    case "PROTOTYPE_RANCOUR":
      return Weapon.PROTOTYPE_RANCOUR;
    case 91:
    case "PROTOTYPE_STARGLITTER":
      return Weapon.PROTOTYPE_STARGLITTER;
    case 92:
    case "RAINSLASHER":
      return Weapon.RAINSLASHER;
    case 93:
    case "RAVEN_BOW":
      return Weapon.RAVEN_BOW;
    case 94:
    case "RECURVE_BOW":
      return Weapon.RECURVE_BOW;
    case 95:
    case "REDHORN_STONETHRESHER":
      return Weapon.REDHORN_STONETHRESHER;
    case 96:
    case "ROYAL_BOW":
      return Weapon.ROYAL_BOW;
    case 97:
    case "ROYAL_GREATSWORD":
      return Weapon.ROYAL_GREATSWORD;
    case 98:
    case "ROYAL_GRIMOIRE":
      return Weapon.ROYAL_GRIMOIRE;
    case 99:
    case "ROYAL_LONGSWORD":
      return Weapon.ROYAL_LONGSWORD;
    case 100:
    case "ROYAL_SPEAR":
      return Weapon.ROYAL_SPEAR;
    case 101:
    case "RUST":
      return Weapon.RUST;
    case 102:
    case "SACRIFICIAL_BOW":
      return Weapon.SACRIFICIAL_BOW;
    case 103:
    case "SACRIFICIAL_FRAGMENTS":
      return Weapon.SACRIFICIAL_FRAGMENTS;
    case 104:
    case "SACRIFICIAL_GREATSWORD":
      return Weapon.SACRIFICIAL_GREATSWORD;
    case 105:
    case "SACRIFICIAL_SWORD":
      return Weapon.SACRIFICIAL_SWORD;
    case 106:
    case "SAPWOOD_BLADE":
      return Weapon.SAPWOOD_BLADE;
    case 107:
    case "SEASONED_HUNTERS_BOW":
      return Weapon.SEASONED_HUNTERS_BOW;
    case 108:
    case "SERPENT_SPINE":
      return Weapon.SERPENT_SPINE;
    case 109:
    case "SHARPSHOOTERS_OATH":
      return Weapon.SHARPSHOOTERS_OATH;
    case 110:
    case "SILVER_SWORD":
      return Weapon.SILVER_SWORD;
    case 111:
    case "SKYRIDER_GREATSWORD":
      return Weapon.SKYRIDER_GREATSWORD;
    case 112:
    case "SKYRIDER_SWORD":
      return Weapon.SKYRIDER_SWORD;
    case 113:
    case "SKYWARD_ATLAS":
      return Weapon.SKYWARD_ATLAS;
    case 114:
    case "SKYWARD_BLADE":
      return Weapon.SKYWARD_BLADE;
    case 115:
    case "SKYWARD_HARP":
      return Weapon.SKYWARD_HARP;
    case 116:
    case "SKYWARD_PRIDE":
      return Weapon.SKYWARD_PRIDE;
    case 117:
    case "SKYWARD_SPINE":
      return Weapon.SKYWARD_SPINE;
    case 118:
    case "SLINGSHOT":
      return Weapon.SLINGSHOT;
    case 119:
    case "SNOW_TOMBED_STARSILVER":
      return Weapon.SNOW_TOMBED_STARSILVER;
    case 120:
    case "SOLAR_PEARL":
      return Weapon.SOLAR_PEARL;
    case 121:
    case "SONG_OF_BROKEN_PINES":
      return Weapon.SONG_OF_BROKEN_PINES;
    case 122:
    case "STAFF_OF_HOMA":
      return Weapon.STAFF_OF_HOMA;
    case 123:
    case "STAFF_OF_THE_SCARLET_SANDS":
      return Weapon.STAFF_OF_THE_SCARLET_SANDS;
    case 124:
    case "SUMMIT_SHAPER":
      return Weapon.SUMMIT_SHAPER;
    case 125:
    case "SWORD_OF_DESCENSION":
      return Weapon.SWORD_OF_DESCENSION;
    case 126:
    case "THE_ALLEY_FLASH":
      return Weapon.THE_ALLEY_FLASH;
    case 127:
    case "THE_BELL":
      return Weapon.THE_BELL;
    case 128:
    case "THE_BLACK_SWORD":
      return Weapon.THE_BLACK_SWORD;
    case 129:
    case "THE_CATCH":
      return Weapon.THE_CATCH;
    case 130:
    case "THE_FLUTE":
      return Weapon.THE_FLUTE;
    case 131:
    case "THE_STRINGLESS":
      return Weapon.THE_STRINGLESS;
    case 132:
    case "THE_UNFORGED":
      return Weapon.THE_UNFORGED;
    case 133:
    case "THE_VIRIDESCENT_HUNT":
      return Weapon.THE_VIRIDESCENT_HUNT;
    case 134:
    case "THE_WIDSITH":
      return Weapon.THE_WIDSITH;
    case 135:
    case "THRILLING_TALES_OF_DRAGON_SLAYERS":
      return Weapon.THRILLING_TALES_OF_DRAGON_SLAYERS;
    case 136:
    case "THUNDERING_PULSE":
      return Weapon.THUNDERING_PULSE;
    case 137:
    case "TOUKABOU_SHIGURE":
      return Weapon.TOUKABOU_SHIGURE;
    case 138:
    case "TRAVELERS_HANDY_SWORD":
      return Weapon.TRAVELERS_HANDY_SWORD;
    case 139:
    case "TULAYTULLAHS_REMEMBRANCE":
      return Weapon.TULAYTULLAHS_REMEMBRANCE;
    case 140:
    case "TWIN_NEPHRITE":
      return Weapon.TWIN_NEPHRITE;
    case 141:
    case "VORTEX_VANQUISHER":
      return Weapon.VORTEX_VANQUISHER;
    case 142:
    case "WANDERING_EVENSTAR":
      return Weapon.WANDERING_EVENSTAR;
    case 143:
    case "WASTER_GREATSWORD":
      return Weapon.WASTER_GREATSWORD;
    case 144:
    case "WAVEBREAKERS_FIN":
      return Weapon.WAVEBREAKERS_FIN;
    case 145:
    case "WHITEBLIND":
      return Weapon.WHITEBLIND;
    case 146:
    case "WHITE_IRON_GREATSWORD":
      return Weapon.WHITE_IRON_GREATSWORD;
    case 147:
    case "WHITE_TASSEL":
      return Weapon.WHITE_TASSEL;
    case 148:
    case "WINDBLUME_ODE":
      return Weapon.WINDBLUME_ODE;
    case 149:
    case "WINE_AND_SONG":
      return Weapon.WINE_AND_SONG;
    case 150:
    case "WOLFS_GRAVESTONE":
      return Weapon.WOLFS_GRAVESTONE;
    case 151:
    case "XIPHOS_MOONLIGHT":
      return Weapon.XIPHOS_MOONLIGHT;
    case 152:
    case "LIGHT_OF_FOLIAR_INCISION":
      return Weapon.LIGHT_OF_FOLIAR_INCISION;
    case 153:
    case "BEACON_OF_THE_REED_SEA":
      return Weapon.BEACON_OF_THE_REED_SEA;
    case 154:
    case "MAILED_FLOWER":
      return Weapon.MAILED_FLOWER;
    case 155:
    case "JADEFALLS_SPLENDOR":
      return Weapon.JADEFALLS_SPLENDOR;
    case 156:
    case "BALLAD_OF_THE_FJORDS":
      return Weapon.BALLAD_OF_THE_FJORDS;
    case 157:
    case "FINALE_OF_THE_DEEP":
      return Weapon.FINALE_OF_THE_DEEP;
    case 158:
    case "FLEUVE_CENDRE_FERRYMAN":
      return Weapon.FLEUVE_CENDRE_FERRYMAN;
    case 159:
    case "FLOWING_PURITY":
      return Weapon.FLOWING_PURITY;
    case 160:
    case "RIGHTFUL_REWARD":
      return Weapon.RIGHTFUL_REWARD;
    case 161:
    case "SACRIFICIAL_JADE":
      return Weapon.SACRIFICIAL_JADE;
    case 162:
    case "SCION_OF_THE_BLAZING_SUN":
      return Weapon.SCION_OF_THE_BLAZING_SUN;
    case 163:
    case "SONG_OF_STILLNESS":
      return Weapon.SONG_OF_STILLNESS;
    case 164:
    case "TALKING_STICK":
      return Weapon.TALKING_STICK;
    case 165:
    case "THE_FIRST_GREAT_MAGIC":
      return Weapon.THE_FIRST_GREAT_MAGIC;
    case 166:
    case "TIDAL_SHADOW":
      return Weapon.TIDAL_SHADOW;
    case 167:
    case "WOLF_FANG":
      return Weapon.WOLF_FANG;
    case 168:
    case "BALLAD_OF_THE_BOUNDLESS_BLUE":
      return Weapon.BALLAD_OF_THE_BOUNDLESS_BLUE;
    case 169:
    case "CASHFLOW_SUPERVISION":
      return Weapon.CASHFLOW_SUPERVISION;
    case 170:
    case "PORTABLE_POWER_SAW":
      return Weapon.PORTABLE_POWER_SAW;
    case 171:
    case "PROSPECTORS_DRILL":
      return Weapon.PROSPECTORS_DRILL;
    case 172:
    case "RANGE_GAUGE":
      return Weapon.RANGE_GAUGE;
    case 173:
    case "THE_DOCKHANDS_ASSISTANT":
      return Weapon.THE_DOCKHANDS_ASSISTANT;
    case 174:
    case "TOME_OF_THE_ETERNAL_FLOW":
      return Weapon.TOME_OF_THE_ETERNAL_FLOW;
    case 175:
    case "SPLENDOR_OF_TRANQUIL_WATERS":
      return Weapon.SPLENDOR_OF_TRANQUIL_WATERS;
    case 176:
    case "SWORD_OF_NARZISSENKREUZ":
      return Weapon.SWORD_OF_NARZISSENKREUZ;
    case 177:
    case "ULTIMATE_OVERLORDS_MEGA_MAGIC_SWORD":
      return Weapon.ULTIMATE_OVERLORDS_MEGA_MAGIC_SWORD;
    case 178:
    case "VERDICT":
      return Weapon.VERDICT;
    case 179:
    case "CRANES_ECHOING_CALL":
      return Weapon.CRANES_ECHOING_CALL;
    case 180:
    case "URAKU_MISUGIRI":
      return Weapon.URAKU_MISUGIRI;
    case 181:
    case "DIALOGUES_OF_THE_DESERT_SAGES":
      return Weapon.DIALOGUES_OF_THE_DESERT_SAGES;
    case 182:
    case "ABSOLUTION":
      return Weapon.ABSOLUTION;
    case 183:
    case "CRIMSON_MOONS_SEMBLANCE":
      return Weapon.CRIMSON_MOONS_SEMBLANCE;
    case 184:
    case "LUMIDOUCE_ELEGY":
      return Weapon.LUMIDOUCE_ELEGY;
    case 185:
    case "IBIS_PIERCER":
      return Weapon.IBIS_PIERCER;
    case 186:
    case "CLOUDFORGED":
      return Weapon.CLOUDFORGED;
    case 187:
    case "SILVERSHOWER_HEARTSTRINGS":
      return Weapon.SILVERSHOWER_HEARTSTRINGS;
    case 188:
    case "FLUTE_OF_EZPITZAL":
      return Weapon.FLUTE_OF_EZPITZAL;
    case 189:
    case "EARTH_SHAKER":
      return Weapon.EARTH_SHAKER;
    case 190:
    case "FANG_OF_THE_MOUNTAIN_KING":
      return Weapon.FANG_OF_THE_MOUNTAIN_KING;
    case 191:
    case "FOOTPRINT_OF_THE_RAINBOW":
      return Weapon.FOOTPRINT_OF_THE_RAINBOW;
    case 192:
    case "ASH_GRAVEN_DRINKING_HORN":
      return Weapon.ASH_GRAVEN_DRINKING_HORN;
    case 193:
    case "RING_OF_YAXCHE":
      return Weapon.RING_OF_YAXCHE;
    case 194:
    case "SURFS_UP":
      return Weapon.SURFS_UP;
    case 195:
    case "CHAIN_BREAKER":
      return Weapon.CHAIN_BREAKER;
    case 196:
    case "STURDY_BONE":
      return Weapon.STURDY_BONE;
    case 197:
    case "CALAMITY_OF_ESHU":
      return Weapon.CALAMITY_OF_ESHU;
    case 198:
    case "PEAK_PATROL_SONG":
      return Weapon.PEAK_PATROL_SONG;
    case 199:
    case "FRUITFUL_HOOK":
      return Weapon.FRUITFUL_HOOK;
    case 200:
    case "A_THOUSAND_BLAZING_SUNS":
      return Weapon.A_THOUSAND_BLAZING_SUNS;
    case 201:
    case "MOUNTAIN_BRACING_BOLT":
      return Weapon.MOUNTAIN_BRACING_BOLT;
    case 202:
    case "TAMAYURATEI_NO_OHANASHI":
      return Weapon.TAMAYURATEI_NO_OHANASHI;
    case 203:
    case "SYMPHONIST_OF_SCENTS":
      return Weapon.SYMPHONIST_OF_SCENTS;
    case 204:
    case "WAVERIDING_WHIRL":
      return Weapon.WAVERIDING_WHIRL;
    case 205:
    case "STARCALLERS_WATCH":
      return Weapon.STARCALLERS_WATCH;
    case 206:
    case "SUNNY_MORNING_SLEEP_IN":
      return Weapon.SUNNY_MORNING_SLEEP_IN;
    case 207:
    case "VIVID_NOTIONS":
      return Weapon.VIVID_NOTIONS;
    case 208:
    case "FLOWER_WREATHED_FEATHERS":
      return Weapon.FLOWER_WREATHED_FEATHERS;
    case 209:
    case "SEQUENCE_OF_SOLITUDE":
      return Weapon.SEQUENCE_OF_SOLITUDE;
    case 210:
    case "ASTRAL_VULTURES_CRIMSON_PLUMAGE":
      return Weapon.ASTRAL_VULTURES_CRIMSON_PLUMAGE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Weapon.UNRECOGNIZED;
  }
}

export function weaponToJSON(object: Weapon): string {
  switch (object) {
    case Weapon.WEAPON_UNSPECIFIED:
      return "WEAPON_UNSPECIFIED";
    case Weapon.AKUOUMARU:
      return "AKUOUMARU";
    case Weapon.ALLEY_HUNTER:
      return "ALLEY_HUNTER";
    case Weapon.AMENOMA_KAGEUCHI:
      return "AMENOMA_KAGEUCHI";
    case Weapon.AMOS_BOW:
      return "AMOS_BOW";
    case Weapon.APPRENTICES_NOTES:
      return "APPRENTICES_NOTES";
    case Weapon.AQUA_SIMULACRA:
      return "AQUA_SIMULACRA";
    case Weapon.AQUILA_FAVONIA:
      return "AQUILA_FAVONIA";
    case Weapon.A_THOUSAND_FLOATING_DREAMS:
      return "A_THOUSAND_FLOATING_DREAMS";
    case Weapon.BEGINNERS_PROTECTOR:
      return "BEGINNERS_PROTECTOR";
    case Weapon.BLACKCLIFF_AGATE:
      return "BLACKCLIFF_AGATE";
    case Weapon.BLACKCLIFF_LONGSWORD:
      return "BLACKCLIFF_LONGSWORD";
    case Weapon.BLACKCLIFF_POLE:
      return "BLACKCLIFF_POLE";
    case Weapon.BLACKCLIFF_SLASHER:
      return "BLACKCLIFF_SLASHER";
    case Weapon.BLACKCLIFF_WARBOW:
      return "BLACKCLIFF_WARBOW";
    case Weapon.BLACK_TASSEL:
      return "BLACK_TASSEL";
    case Weapon.BLOODTAINTED_GREATSWORD:
      return "BLOODTAINTED_GREATSWORD";
    case Weapon.CALAMITY_QUELLER:
      return "CALAMITY_QUELLER";
    case Weapon.CINNABAR_SPINDLE:
      return "CINNABAR_SPINDLE";
    case Weapon.COMPOUND_BOW:
      return "COMPOUND_BOW";
    case Weapon.COOL_STEEL:
      return "COOL_STEEL";
    case Weapon.CRESCENT_PIKE:
      return "CRESCENT_PIKE";
    case Weapon.DARK_IRON_SWORD:
      return "DARK_IRON_SWORD";
    case Weapon.DEATHMATCH:
      return "DEATHMATCH";
    case Weapon.DEBATE_CLUB:
      return "DEBATE_CLUB";
    case Weapon.DODOCO_TALES:
      return "DODOCO_TALES";
    case Weapon.DRAGONS_BANE:
      return "DRAGONS_BANE";
    case Weapon.DRAGONSPINE_SPEAR:
      return "DRAGONSPINE_SPEAR";
    case Weapon.DULL_BLADE:
      return "DULL_BLADE";
    case Weapon.ELEGY_FOR_THE_END:
      return "ELEGY_FOR_THE_END";
    case Weapon.EMERALD_ORB:
      return "EMERALD_ORB";
    case Weapon.END_OF_THE_LINE:
      return "END_OF_THE_LINE";
    case Weapon.ENGULFING_LIGHTNING:
      return "ENGULFING_LIGHTNING";
    case Weapon.EVERLASTING_MOONGLOW:
      return "EVERLASTING_MOONGLOW";
    case Weapon.EYE_OF_PERCEPTION:
      return "EYE_OF_PERCEPTION";
    case Weapon.FADING_TWILIGHT:
      return "FADING_TWILIGHT";
    case Weapon.FAVONIUS_CODEX:
      return "FAVONIUS_CODEX";
    case Weapon.FAVONIUS_GREATSWORD:
      return "FAVONIUS_GREATSWORD";
    case Weapon.FAVONIUS_LANCE:
      return "FAVONIUS_LANCE";
    case Weapon.FAVONIUS_SWORD:
      return "FAVONIUS_SWORD";
    case Weapon.FAVONIUS_WARBOW:
      return "FAVONIUS_WARBOW";
    case Weapon.FERROUS_SHADOW:
      return "FERROUS_SHADOW";
    case Weapon.FESTERING_DESIRE:
      return "FESTERING_DESIRE";
    case Weapon.FILLET_BLADE:
      return "FILLET_BLADE";
    case Weapon.FOREST_REGALIA:
      return "FOREST_REGALIA";
    case Weapon.FREEDOM_SWORN:
      return "FREEDOM_SWORN";
    case Weapon.FROSTBEARER:
      return "FROSTBEARER";
    case Weapon.FRUIT_OF_FULFILLMENT:
      return "FRUIT_OF_FULFILLMENT";
    case Weapon.HAKUSHIN_RING:
      return "HAKUSHIN_RING";
    case Weapon.HALBERD:
      return "HALBERD";
    case Weapon.HAMAYUMI:
      return "HAMAYUMI";
    case Weapon.HARAN_GEPPAKU_FUTSU:
      return "HARAN_GEPPAKU_FUTSU";
    case Weapon.HARBINGER_OF_DAWN:
      return "HARBINGER_OF_DAWN";
    case Weapon.HUNTERS_BOW:
      return "HUNTERS_BOW";
    case Weapon.HUNTERS_PATH:
      return "HUNTERS_PATH";
    case Weapon.IRON_POINT:
      return "IRON_POINT";
    case Weapon.IRON_STING:
      return "IRON_STING";
    case Weapon.KAGOTSURUBE_ISSHIN:
      return "KAGOTSURUBE_ISSHIN";
    case Weapon.KAGURAS_VERITY:
      return "KAGURAS_VERITY";
    case Weapon.KATSURAGIKIRI_NAGAMASA:
      return "KATSURAGIKIRI_NAGAMASA";
    case Weapon.KEY_OF_KHAJ_NISUT:
      return "KEY_OF_KHAJ_NISUT";
    case Weapon.KINGS_SQUIRE:
      return "KINGS_SQUIRE";
    case Weapon.KITAIN_CROSS_SPEAR:
      return "KITAIN_CROSS_SPEAR";
    case Weapon.LIONS_ROAR:
      return "LIONS_ROAR";
    case Weapon.LITHIC_BLADE:
      return "LITHIC_BLADE";
    case Weapon.LITHIC_SPEAR:
      return "LITHIC_SPEAR";
    case Weapon.LOST_PRAYER_TO_THE_SACRED_WINDS:
      return "LOST_PRAYER_TO_THE_SACRED_WINDS";
    case Weapon.LUXURIOUS_SEA_LORD:
      return "LUXURIOUS_SEA_LORD";
    case Weapon.MAGIC_GUIDE:
      return "MAGIC_GUIDE";
    case Weapon.MAKHAIRA_AQUAMARINE:
      return "MAKHAIRA_AQUAMARINE";
    case Weapon.MAPPA_MARE:
      return "MAPPA_MARE";
    case Weapon.MEMORY_OF_DUST:
      return "MEMORY_OF_DUST";
    case Weapon.MESSENGER:
      return "MESSENGER";
    case Weapon.MISSIVE_WINDSPEAR:
      return "MISSIVE_WINDSPEAR";
    case Weapon.MISTSPLITTER_REFORGED:
      return "MISTSPLITTER_REFORGED";
    case Weapon.MITTERNACHTS_WALTZ:
      return "MITTERNACHTS_WALTZ";
    case Weapon.MOONPIERCER:
      return "MOONPIERCER";
    case Weapon.MOUUNS_MOON:
      return "MOUUNS_MOON";
    case Weapon.OATHSWORN_EYE:
      return "OATHSWORN_EYE";
    case Weapon.OLD_MERCS_PAL:
      return "OLD_MERCS_PAL";
    case Weapon.OTHERWORLDLY_STORY:
      return "OTHERWORLDLY_STORY";
    case Weapon.POCKET_GRIMOIRE:
      return "POCKET_GRIMOIRE";
    case Weapon.POLAR_STAR:
      return "POLAR_STAR";
    case Weapon.PREDATOR:
      return "PREDATOR";
    case Weapon.PRIMORDIAL_JADE_CUTTER:
      return "PRIMORDIAL_JADE_CUTTER";
    case Weapon.PRIMORDIAL_JADE_WINGED_SPEAR:
      return "PRIMORDIAL_JADE_WINGED_SPEAR";
    case Weapon.PRIZED_ISSHIN_BLADE:
      return "PRIZED_ISSHIN_BLADE";
    case Weapon.PROTOTYPE_AMBER:
      return "PROTOTYPE_AMBER";
    case Weapon.PROTOTYPE_ARCHAIC:
      return "PROTOTYPE_ARCHAIC";
    case Weapon.PROTOTYPE_CRESCENT:
      return "PROTOTYPE_CRESCENT";
    case Weapon.PROTOTYPE_RANCOUR:
      return "PROTOTYPE_RANCOUR";
    case Weapon.PROTOTYPE_STARGLITTER:
      return "PROTOTYPE_STARGLITTER";
    case Weapon.RAINSLASHER:
      return "RAINSLASHER";
    case Weapon.RAVEN_BOW:
      return "RAVEN_BOW";
    case Weapon.RECURVE_BOW:
      return "RECURVE_BOW";
    case Weapon.REDHORN_STONETHRESHER:
      return "REDHORN_STONETHRESHER";
    case Weapon.ROYAL_BOW:
      return "ROYAL_BOW";
    case Weapon.ROYAL_GREATSWORD:
      return "ROYAL_GREATSWORD";
    case Weapon.ROYAL_GRIMOIRE:
      return "ROYAL_GRIMOIRE";
    case Weapon.ROYAL_LONGSWORD:
      return "ROYAL_LONGSWORD";
    case Weapon.ROYAL_SPEAR:
      return "ROYAL_SPEAR";
    case Weapon.RUST:
      return "RUST";
    case Weapon.SACRIFICIAL_BOW:
      return "SACRIFICIAL_BOW";
    case Weapon.SACRIFICIAL_FRAGMENTS:
      return "SACRIFICIAL_FRAGMENTS";
    case Weapon.SACRIFICIAL_GREATSWORD:
      return "SACRIFICIAL_GREATSWORD";
    case Weapon.SACRIFICIAL_SWORD:
      return "SACRIFICIAL_SWORD";
    case Weapon.SAPWOOD_BLADE:
      return "SAPWOOD_BLADE";
    case Weapon.SEASONED_HUNTERS_BOW:
      return "SEASONED_HUNTERS_BOW";
    case Weapon.SERPENT_SPINE:
      return "SERPENT_SPINE";
    case Weapon.SHARPSHOOTERS_OATH:
      return "SHARPSHOOTERS_OATH";
    case Weapon.SILVER_SWORD:
      return "SILVER_SWORD";
    case Weapon.SKYRIDER_GREATSWORD:
      return "SKYRIDER_GREATSWORD";
    case Weapon.SKYRIDER_SWORD:
      return "SKYRIDER_SWORD";
    case Weapon.SKYWARD_ATLAS:
      return "SKYWARD_ATLAS";
    case Weapon.SKYWARD_BLADE:
      return "SKYWARD_BLADE";
    case Weapon.SKYWARD_HARP:
      return "SKYWARD_HARP";
    case Weapon.SKYWARD_PRIDE:
      return "SKYWARD_PRIDE";
    case Weapon.SKYWARD_SPINE:
      return "SKYWARD_SPINE";
    case Weapon.SLINGSHOT:
      return "SLINGSHOT";
    case Weapon.SNOW_TOMBED_STARSILVER:
      return "SNOW_TOMBED_STARSILVER";
    case Weapon.SOLAR_PEARL:
      return "SOLAR_PEARL";
    case Weapon.SONG_OF_BROKEN_PINES:
      return "SONG_OF_BROKEN_PINES";
    case Weapon.STAFF_OF_HOMA:
      return "STAFF_OF_HOMA";
    case Weapon.STAFF_OF_THE_SCARLET_SANDS:
      return "STAFF_OF_THE_SCARLET_SANDS";
    case Weapon.SUMMIT_SHAPER:
      return "SUMMIT_SHAPER";
    case Weapon.SWORD_OF_DESCENSION:
      return "SWORD_OF_DESCENSION";
    case Weapon.THE_ALLEY_FLASH:
      return "THE_ALLEY_FLASH";
    case Weapon.THE_BELL:
      return "THE_BELL";
    case Weapon.THE_BLACK_SWORD:
      return "THE_BLACK_SWORD";
    case Weapon.THE_CATCH:
      return "THE_CATCH";
    case Weapon.THE_FLUTE:
      return "THE_FLUTE";
    case Weapon.THE_STRINGLESS:
      return "THE_STRINGLESS";
    case Weapon.THE_UNFORGED:
      return "THE_UNFORGED";
    case Weapon.THE_VIRIDESCENT_HUNT:
      return "THE_VIRIDESCENT_HUNT";
    case Weapon.THE_WIDSITH:
      return "THE_WIDSITH";
    case Weapon.THRILLING_TALES_OF_DRAGON_SLAYERS:
      return "THRILLING_TALES_OF_DRAGON_SLAYERS";
    case Weapon.THUNDERING_PULSE:
      return "THUNDERING_PULSE";
    case Weapon.TOUKABOU_SHIGURE:
      return "TOUKABOU_SHIGURE";
    case Weapon.TRAVELERS_HANDY_SWORD:
      return "TRAVELERS_HANDY_SWORD";
    case Weapon.TULAYTULLAHS_REMEMBRANCE:
      return "TULAYTULLAHS_REMEMBRANCE";
    case Weapon.TWIN_NEPHRITE:
      return "TWIN_NEPHRITE";
    case Weapon.VORTEX_VANQUISHER:
      return "VORTEX_VANQUISHER";
    case Weapon.WANDERING_EVENSTAR:
      return "WANDERING_EVENSTAR";
    case Weapon.WASTER_GREATSWORD:
      return "WASTER_GREATSWORD";
    case Weapon.WAVEBREAKERS_FIN:
      return "WAVEBREAKERS_FIN";
    case Weapon.WHITEBLIND:
      return "WHITEBLIND";
    case Weapon.WHITE_IRON_GREATSWORD:
      return "WHITE_IRON_GREATSWORD";
    case Weapon.WHITE_TASSEL:
      return "WHITE_TASSEL";
    case Weapon.WINDBLUME_ODE:
      return "WINDBLUME_ODE";
    case Weapon.WINE_AND_SONG:
      return "WINE_AND_SONG";
    case Weapon.WOLFS_GRAVESTONE:
      return "WOLFS_GRAVESTONE";
    case Weapon.XIPHOS_MOONLIGHT:
      return "XIPHOS_MOONLIGHT";
    case Weapon.LIGHT_OF_FOLIAR_INCISION:
      return "LIGHT_OF_FOLIAR_INCISION";
    case Weapon.BEACON_OF_THE_REED_SEA:
      return "BEACON_OF_THE_REED_SEA";
    case Weapon.MAILED_FLOWER:
      return "MAILED_FLOWER";
    case Weapon.JADEFALLS_SPLENDOR:
      return "JADEFALLS_SPLENDOR";
    case Weapon.BALLAD_OF_THE_FJORDS:
      return "BALLAD_OF_THE_FJORDS";
    case Weapon.FINALE_OF_THE_DEEP:
      return "FINALE_OF_THE_DEEP";
    case Weapon.FLEUVE_CENDRE_FERRYMAN:
      return "FLEUVE_CENDRE_FERRYMAN";
    case Weapon.FLOWING_PURITY:
      return "FLOWING_PURITY";
    case Weapon.RIGHTFUL_REWARD:
      return "RIGHTFUL_REWARD";
    case Weapon.SACRIFICIAL_JADE:
      return "SACRIFICIAL_JADE";
    case Weapon.SCION_OF_THE_BLAZING_SUN:
      return "SCION_OF_THE_BLAZING_SUN";
    case Weapon.SONG_OF_STILLNESS:
      return "SONG_OF_STILLNESS";
    case Weapon.TALKING_STICK:
      return "TALKING_STICK";
    case Weapon.THE_FIRST_GREAT_MAGIC:
      return "THE_FIRST_GREAT_MAGIC";
    case Weapon.TIDAL_SHADOW:
      return "TIDAL_SHADOW";
    case Weapon.WOLF_FANG:
      return "WOLF_FANG";
    case Weapon.BALLAD_OF_THE_BOUNDLESS_BLUE:
      return "BALLAD_OF_THE_BOUNDLESS_BLUE";
    case Weapon.CASHFLOW_SUPERVISION:
      return "CASHFLOW_SUPERVISION";
    case Weapon.PORTABLE_POWER_SAW:
      return "PORTABLE_POWER_SAW";
    case Weapon.PROSPECTORS_DRILL:
      return "PROSPECTORS_DRILL";
    case Weapon.RANGE_GAUGE:
      return "RANGE_GAUGE";
    case Weapon.THE_DOCKHANDS_ASSISTANT:
      return "THE_DOCKHANDS_ASSISTANT";
    case Weapon.TOME_OF_THE_ETERNAL_FLOW:
      return "TOME_OF_THE_ETERNAL_FLOW";
    case Weapon.SPLENDOR_OF_TRANQUIL_WATERS:
      return "SPLENDOR_OF_TRANQUIL_WATERS";
    case Weapon.SWORD_OF_NARZISSENKREUZ:
      return "SWORD_OF_NARZISSENKREUZ";
    case Weapon.ULTIMATE_OVERLORDS_MEGA_MAGIC_SWORD:
      return "ULTIMATE_OVERLORDS_MEGA_MAGIC_SWORD";
    case Weapon.VERDICT:
      return "VERDICT";
    case Weapon.CRANES_ECHOING_CALL:
      return "CRANES_ECHOING_CALL";
    case Weapon.URAKU_MISUGIRI:
      return "URAKU_MISUGIRI";
    case Weapon.DIALOGUES_OF_THE_DESERT_SAGES:
      return "DIALOGUES_OF_THE_DESERT_SAGES";
    case Weapon.ABSOLUTION:
      return "ABSOLUTION";
    case Weapon.CRIMSON_MOONS_SEMBLANCE:
      return "CRIMSON_MOONS_SEMBLANCE";
    case Weapon.LUMIDOUCE_ELEGY:
      return "LUMIDOUCE_ELEGY";
    case Weapon.IBIS_PIERCER:
      return "IBIS_PIERCER";
    case Weapon.CLOUDFORGED:
      return "CLOUDFORGED";
    case Weapon.SILVERSHOWER_HEARTSTRINGS:
      return "SILVERSHOWER_HEARTSTRINGS";
    case Weapon.FLUTE_OF_EZPITZAL:
      return "FLUTE_OF_EZPITZAL";
    case Weapon.EARTH_SHAKER:
      return "EARTH_SHAKER";
    case Weapon.FANG_OF_THE_MOUNTAIN_KING:
      return "FANG_OF_THE_MOUNTAIN_KING";
    case Weapon.FOOTPRINT_OF_THE_RAINBOW:
      return "FOOTPRINT_OF_THE_RAINBOW";
    case Weapon.ASH_GRAVEN_DRINKING_HORN:
      return "ASH_GRAVEN_DRINKING_HORN";
    case Weapon.RING_OF_YAXCHE:
      return "RING_OF_YAXCHE";
    case Weapon.SURFS_UP:
      return "SURFS_UP";
    case Weapon.CHAIN_BREAKER:
      return "CHAIN_BREAKER";
    case Weapon.STURDY_BONE:
      return "STURDY_BONE";
    case Weapon.CALAMITY_OF_ESHU:
      return "CALAMITY_OF_ESHU";
    case Weapon.PEAK_PATROL_SONG:
      return "PEAK_PATROL_SONG";
    case Weapon.FRUITFUL_HOOK:
      return "FRUITFUL_HOOK";
    case Weapon.A_THOUSAND_BLAZING_SUNS:
      return "A_THOUSAND_BLAZING_SUNS";
    case Weapon.MOUNTAIN_BRACING_BOLT:
      return "MOUNTAIN_BRACING_BOLT";
    case Weapon.TAMAYURATEI_NO_OHANASHI:
      return "TAMAYURATEI_NO_OHANASHI";
    case Weapon.SYMPHONIST_OF_SCENTS:
      return "SYMPHONIST_OF_SCENTS";
    case Weapon.WAVERIDING_WHIRL:
      return "WAVERIDING_WHIRL";
    case Weapon.STARCALLERS_WATCH:
      return "STARCALLERS_WATCH";
    case Weapon.SUNNY_MORNING_SLEEP_IN:
      return "SUNNY_MORNING_SLEEP_IN";
    case Weapon.VIVID_NOTIONS:
      return "VIVID_NOTIONS";
    case Weapon.FLOWER_WREATHED_FEATHERS:
      return "FLOWER_WREATHED_FEATHERS";
    case Weapon.SEQUENCE_OF_SOLITUDE:
      return "SEQUENCE_OF_SOLITUDE";
    case Weapon.ASTRAL_VULTURES_CRIMSON_PLUMAGE:
      return "ASTRAL_VULTURES_CRIMSON_PLUMAGE";
    case Weapon.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
