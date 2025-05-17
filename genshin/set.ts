/* eslint-disable */

export const protobufPackage = "io.leishi.genshin.proto";

export enum Set {
  SET_UNSPECIFIED = 0,
  ARCHAIC_PETRA = 1,
  BERSERKER = 2,
  BLIZZARD_STRAYER = 3,
  BLOODSTAINED_CHIVALRY = 4,
  BRAVE_HEART = 5,
  CRIMSON_WITCH_OF_FLAMES = 6,
  DEEPWOOD_MEMORIES = 7,
  DEFENDERS_WILL = 8,
  DESERT_PAVILION_CHRONICLE = 9,
  ECHOES_OF_AN_OFFERING = 10,
  EMBLEM_OF_SEVERED_FATE = 11,
  FLOWER_OF_PARADISE_LOST = 12,
  GAMBLER = 13,
  GILDED_DREAMS = 14,
  GLADIATORS_FINALE = 15,
  HEART_OF_DEPTH = 16,
  HUSK_OF_OPULENT_DREAMS = 17,
  INSTRUCTOR = 18,
  LAVAWALKER = 19,
  MAIDEN_BELOVED = 20,
  MARTIAL_ARTIST = 21,
  NOBLESSE_OBLIGE = 22,
  OCEAN_HUED_CLAM = 23,
  PALE_FLAME = 24,
  PRAYERS_FOR_DESTINY = 25,
  PRAYERS_FOR_ILLUMINATION = 26,
  PRAYERS_FOR_WISDOM = 27,
  PRAYERS_TO_SPRINGTIME = 28,
  RESOLUTION_OF_SOJOURNER = 29,
  RETRACING_BOLIDE = 30,
  SCHOLAR = 31,
  SHIMENAWAS_REMINISCENCE = 32,
  TENACITY_OF_THE_MILLELITH = 33,
  THE_EXILE = 34,
  THUNDERING_FURY = 35,
  THUNDERSOOTHER = 36,
  TINY_MIRACLE = 37,
  VERMILLION_HEREAFTER = 38,
  VIRIDESCENT_VENERER = 39,
  WANDERERS_TROUPE = 40,
  NYMPHS_DREAM = 41,
  VOURUKASHAS_GLOW = 42,
  GOLDEN_TROUPE = 43,
  MARECHAUSSEE_HUNTER = 44,
  SONG_OF_DAYS_PAST = 45,
  NIGHTTIME_WHISPERS_IN_THE_ECHOING_WOODS = 46,
  ADVENTURER = 47,
  LUCKY_DOG = 48,
  TRAVELING_DOCTOR = 49,
  FRAGMENT_OF_HARMONIC_WHIMSY = 50,
  UNFINISHED_REVERIE = 51,
  SCROLL_OF_THE_HERO_OF_CINDER_CITY = 52,
  OBSIDIAN_CODEX = 53,
  LONG_NIGHTS_OATH = 54,
  FINALE_OF_THE_DEEP_GALLERIES = 55,
  UNRECOGNIZED = -1,
}

export function setFromJSON(object: any): Set {
  switch (object) {
    case 0:
    case "SET_UNSPECIFIED":
      return Set.SET_UNSPECIFIED;
    case 1:
    case "ARCHAIC_PETRA":
      return Set.ARCHAIC_PETRA;
    case 2:
    case "BERSERKER":
      return Set.BERSERKER;
    case 3:
    case "BLIZZARD_STRAYER":
      return Set.BLIZZARD_STRAYER;
    case 4:
    case "BLOODSTAINED_CHIVALRY":
      return Set.BLOODSTAINED_CHIVALRY;
    case 5:
    case "BRAVE_HEART":
      return Set.BRAVE_HEART;
    case 6:
    case "CRIMSON_WITCH_OF_FLAMES":
      return Set.CRIMSON_WITCH_OF_FLAMES;
    case 7:
    case "DEEPWOOD_MEMORIES":
      return Set.DEEPWOOD_MEMORIES;
    case 8:
    case "DEFENDERS_WILL":
      return Set.DEFENDERS_WILL;
    case 9:
    case "DESERT_PAVILION_CHRONICLE":
      return Set.DESERT_PAVILION_CHRONICLE;
    case 10:
    case "ECHOES_OF_AN_OFFERING":
      return Set.ECHOES_OF_AN_OFFERING;
    case 11:
    case "EMBLEM_OF_SEVERED_FATE":
      return Set.EMBLEM_OF_SEVERED_FATE;
    case 12:
    case "FLOWER_OF_PARADISE_LOST":
      return Set.FLOWER_OF_PARADISE_LOST;
    case 13:
    case "GAMBLER":
      return Set.GAMBLER;
    case 14:
    case "GILDED_DREAMS":
      return Set.GILDED_DREAMS;
    case 15:
    case "GLADIATORS_FINALE":
      return Set.GLADIATORS_FINALE;
    case 16:
    case "HEART_OF_DEPTH":
      return Set.HEART_OF_DEPTH;
    case 17:
    case "HUSK_OF_OPULENT_DREAMS":
      return Set.HUSK_OF_OPULENT_DREAMS;
    case 18:
    case "INSTRUCTOR":
      return Set.INSTRUCTOR;
    case 19:
    case "LAVAWALKER":
      return Set.LAVAWALKER;
    case 20:
    case "MAIDEN_BELOVED":
      return Set.MAIDEN_BELOVED;
    case 21:
    case "MARTIAL_ARTIST":
      return Set.MARTIAL_ARTIST;
    case 22:
    case "NOBLESSE_OBLIGE":
      return Set.NOBLESSE_OBLIGE;
    case 23:
    case "OCEAN_HUED_CLAM":
      return Set.OCEAN_HUED_CLAM;
    case 24:
    case "PALE_FLAME":
      return Set.PALE_FLAME;
    case 25:
    case "PRAYERS_FOR_DESTINY":
      return Set.PRAYERS_FOR_DESTINY;
    case 26:
    case "PRAYERS_FOR_ILLUMINATION":
      return Set.PRAYERS_FOR_ILLUMINATION;
    case 27:
    case "PRAYERS_FOR_WISDOM":
      return Set.PRAYERS_FOR_WISDOM;
    case 28:
    case "PRAYERS_TO_SPRINGTIME":
      return Set.PRAYERS_TO_SPRINGTIME;
    case 29:
    case "RESOLUTION_OF_SOJOURNER":
      return Set.RESOLUTION_OF_SOJOURNER;
    case 30:
    case "RETRACING_BOLIDE":
      return Set.RETRACING_BOLIDE;
    case 31:
    case "SCHOLAR":
      return Set.SCHOLAR;
    case 32:
    case "SHIMENAWAS_REMINISCENCE":
      return Set.SHIMENAWAS_REMINISCENCE;
    case 33:
    case "TENACITY_OF_THE_MILLELITH":
      return Set.TENACITY_OF_THE_MILLELITH;
    case 34:
    case "THE_EXILE":
      return Set.THE_EXILE;
    case 35:
    case "THUNDERING_FURY":
      return Set.THUNDERING_FURY;
    case 36:
    case "THUNDERSOOTHER":
      return Set.THUNDERSOOTHER;
    case 37:
    case "TINY_MIRACLE":
      return Set.TINY_MIRACLE;
    case 38:
    case "VERMILLION_HEREAFTER":
      return Set.VERMILLION_HEREAFTER;
    case 39:
    case "VIRIDESCENT_VENERER":
      return Set.VIRIDESCENT_VENERER;
    case 40:
    case "WANDERERS_TROUPE":
      return Set.WANDERERS_TROUPE;
    case 41:
    case "NYMPHS_DREAM":
      return Set.NYMPHS_DREAM;
    case 42:
    case "VOURUKASHAS_GLOW":
      return Set.VOURUKASHAS_GLOW;
    case 43:
    case "GOLDEN_TROUPE":
      return Set.GOLDEN_TROUPE;
    case 44:
    case "MARECHAUSSEE_HUNTER":
      return Set.MARECHAUSSEE_HUNTER;
    case 45:
    case "SONG_OF_DAYS_PAST":
      return Set.SONG_OF_DAYS_PAST;
    case 46:
    case "NIGHTTIME_WHISPERS_IN_THE_ECHOING_WOODS":
      return Set.NIGHTTIME_WHISPERS_IN_THE_ECHOING_WOODS;
    case 47:
    case "ADVENTURER":
      return Set.ADVENTURER;
    case 48:
    case "LUCKY_DOG":
      return Set.LUCKY_DOG;
    case 49:
    case "TRAVELING_DOCTOR":
      return Set.TRAVELING_DOCTOR;
    case 50:
    case "FRAGMENT_OF_HARMONIC_WHIMSY":
      return Set.FRAGMENT_OF_HARMONIC_WHIMSY;
    case 51:
    case "UNFINISHED_REVERIE":
      return Set.UNFINISHED_REVERIE;
    case 52:
    case "SCROLL_OF_THE_HERO_OF_CINDER_CITY":
      return Set.SCROLL_OF_THE_HERO_OF_CINDER_CITY;
    case 53:
    case "OBSIDIAN_CODEX":
      return Set.OBSIDIAN_CODEX;
    case 54:
    case "LONG_NIGHTS_OATH":
      return Set.LONG_NIGHTS_OATH;
    case 55:
    case "FINALE_OF_THE_DEEP_GALLERIES":
      return Set.FINALE_OF_THE_DEEP_GALLERIES;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Set.UNRECOGNIZED;
  }
}

export function setToJSON(object: Set): string {
  switch (object) {
    case Set.SET_UNSPECIFIED:
      return "SET_UNSPECIFIED";
    case Set.ARCHAIC_PETRA:
      return "ARCHAIC_PETRA";
    case Set.BERSERKER:
      return "BERSERKER";
    case Set.BLIZZARD_STRAYER:
      return "BLIZZARD_STRAYER";
    case Set.BLOODSTAINED_CHIVALRY:
      return "BLOODSTAINED_CHIVALRY";
    case Set.BRAVE_HEART:
      return "BRAVE_HEART";
    case Set.CRIMSON_WITCH_OF_FLAMES:
      return "CRIMSON_WITCH_OF_FLAMES";
    case Set.DEEPWOOD_MEMORIES:
      return "DEEPWOOD_MEMORIES";
    case Set.DEFENDERS_WILL:
      return "DEFENDERS_WILL";
    case Set.DESERT_PAVILION_CHRONICLE:
      return "DESERT_PAVILION_CHRONICLE";
    case Set.ECHOES_OF_AN_OFFERING:
      return "ECHOES_OF_AN_OFFERING";
    case Set.EMBLEM_OF_SEVERED_FATE:
      return "EMBLEM_OF_SEVERED_FATE";
    case Set.FLOWER_OF_PARADISE_LOST:
      return "FLOWER_OF_PARADISE_LOST";
    case Set.GAMBLER:
      return "GAMBLER";
    case Set.GILDED_DREAMS:
      return "GILDED_DREAMS";
    case Set.GLADIATORS_FINALE:
      return "GLADIATORS_FINALE";
    case Set.HEART_OF_DEPTH:
      return "HEART_OF_DEPTH";
    case Set.HUSK_OF_OPULENT_DREAMS:
      return "HUSK_OF_OPULENT_DREAMS";
    case Set.INSTRUCTOR:
      return "INSTRUCTOR";
    case Set.LAVAWALKER:
      return "LAVAWALKER";
    case Set.MAIDEN_BELOVED:
      return "MAIDEN_BELOVED";
    case Set.MARTIAL_ARTIST:
      return "MARTIAL_ARTIST";
    case Set.NOBLESSE_OBLIGE:
      return "NOBLESSE_OBLIGE";
    case Set.OCEAN_HUED_CLAM:
      return "OCEAN_HUED_CLAM";
    case Set.PALE_FLAME:
      return "PALE_FLAME";
    case Set.PRAYERS_FOR_DESTINY:
      return "PRAYERS_FOR_DESTINY";
    case Set.PRAYERS_FOR_ILLUMINATION:
      return "PRAYERS_FOR_ILLUMINATION";
    case Set.PRAYERS_FOR_WISDOM:
      return "PRAYERS_FOR_WISDOM";
    case Set.PRAYERS_TO_SPRINGTIME:
      return "PRAYERS_TO_SPRINGTIME";
    case Set.RESOLUTION_OF_SOJOURNER:
      return "RESOLUTION_OF_SOJOURNER";
    case Set.RETRACING_BOLIDE:
      return "RETRACING_BOLIDE";
    case Set.SCHOLAR:
      return "SCHOLAR";
    case Set.SHIMENAWAS_REMINISCENCE:
      return "SHIMENAWAS_REMINISCENCE";
    case Set.TENACITY_OF_THE_MILLELITH:
      return "TENACITY_OF_THE_MILLELITH";
    case Set.THE_EXILE:
      return "THE_EXILE";
    case Set.THUNDERING_FURY:
      return "THUNDERING_FURY";
    case Set.THUNDERSOOTHER:
      return "THUNDERSOOTHER";
    case Set.TINY_MIRACLE:
      return "TINY_MIRACLE";
    case Set.VERMILLION_HEREAFTER:
      return "VERMILLION_HEREAFTER";
    case Set.VIRIDESCENT_VENERER:
      return "VIRIDESCENT_VENERER";
    case Set.WANDERERS_TROUPE:
      return "WANDERERS_TROUPE";
    case Set.NYMPHS_DREAM:
      return "NYMPHS_DREAM";
    case Set.VOURUKASHAS_GLOW:
      return "VOURUKASHAS_GLOW";
    case Set.GOLDEN_TROUPE:
      return "GOLDEN_TROUPE";
    case Set.MARECHAUSSEE_HUNTER:
      return "MARECHAUSSEE_HUNTER";
    case Set.SONG_OF_DAYS_PAST:
      return "SONG_OF_DAYS_PAST";
    case Set.NIGHTTIME_WHISPERS_IN_THE_ECHOING_WOODS:
      return "NIGHTTIME_WHISPERS_IN_THE_ECHOING_WOODS";
    case Set.ADVENTURER:
      return "ADVENTURER";
    case Set.LUCKY_DOG:
      return "LUCKY_DOG";
    case Set.TRAVELING_DOCTOR:
      return "TRAVELING_DOCTOR";
    case Set.FRAGMENT_OF_HARMONIC_WHIMSY:
      return "FRAGMENT_OF_HARMONIC_WHIMSY";
    case Set.UNFINISHED_REVERIE:
      return "UNFINISHED_REVERIE";
    case Set.SCROLL_OF_THE_HERO_OF_CINDER_CITY:
      return "SCROLL_OF_THE_HERO_OF_CINDER_CITY";
    case Set.OBSIDIAN_CODEX:
      return "OBSIDIAN_CODEX";
    case Set.LONG_NIGHTS_OATH:
      return "LONG_NIGHTS_OATH";
    case Set.FINALE_OF_THE_DEEP_GALLERIES:
      return "FINALE_OF_THE_DEEP_GALLERIES";
    case Set.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
