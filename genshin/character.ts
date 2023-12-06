/* eslint-disable */

export const protobufPackage = "io.leishi.genshin.proto";

export enum Character {
  CHARACTER_UNSPECIFIED = 0,
  TRAVELER_ANEMO = 1,
  TRAVELER_GEO = 2,
  TRAVELER_ELECTRO = 3,
  TRAVELER_DENDRO = 4,
  AETHER = 5,
  LUMINE = 6,
  ALBEDO = 7,
  ALOY = 8,
  AMBER = 9,
  BARBARA = 10,
  BEIDOU = 11,
  BENNETT = 12,
  CHONGYUN = 13,
  DILUC = 14,
  DIONA = 15,
  EULA = 16,
  FISCHL = 17,
  GANYU = 18,
  HU_TAO = 19,
  JEAN = 20,
  KAEDEHARA_KAZUHA = 21,
  KAEYA = 22,
  KAMISATO_AYAKA = 23,
  KEQING = 24,
  KLEE = 25,
  KUJOU_SARA = 26,
  LISA = 27,
  MONA = 28,
  NINGGUANG = 29,
  NOELLE = 30,
  QIQI = 31,
  RAIDEN_SHOGUN = 32,
  RAZOR = 33,
  ROSARIA = 34,
  SANGONOMIYA_KOKOMI = 35,
  SAYU = 36,
  SUCROSE = 37,
  TARTAGLIA = 38,
  THOMA = 39,
  VENTI = 40,
  XIANGLING = 41,
  XIAO = 42,
  XINGQIU = 43,
  XINYAN = 44,
  YANFEI = 45,
  YOIMIYA = 46,
  ZHONGLI = 47,
  GOROU = 48,
  ARATAKI_ITTO = 49,
  SHENHE = 50,
  YUN_JIN = 51,
  YAE_MIKO = 52,
  KAMISATO_AYATO = 53,
  YELAN = 54,
  KUKI_SHINOBU = 55,
  SHIKANOIN_HEIZOU = 56,
  COLLEI = 57,
  DORI = 58,
  TIGHNARI = 59,
  CANDACE = 60,
  CYNO = 61,
  NILOU = 62,
  NAHIDA = 63,
  LAYLA = 64,
  FARUZAN = 65,
  WANDERER = 66,
  ALHAITHAM = 67,
  YAOYAO = 68,
  DEHYA = 69,
  MIKA = 70,
  BAIZHU = 71,
  KAVEH = 72,
  KIRARA = 73,
  TRAVELER_HYDRO = 74,
  LYNEY = 75,
  LYNETTE = 76,
  FREMINET = 77,
  NEUVILLETTE = 78,
  WRIOTHESLEY = 79,
  FURINA = 80,
  CHARLOTTE = 81,
  UNRECOGNIZED = -1,
}

export function characterFromJSON(object: any): Character {
  switch (object) {
    case 0:
    case "CHARACTER_UNSPECIFIED":
      return Character.CHARACTER_UNSPECIFIED;
    case 1:
    case "TRAVELER_ANEMO":
      return Character.TRAVELER_ANEMO;
    case 2:
    case "TRAVELER_GEO":
      return Character.TRAVELER_GEO;
    case 3:
    case "TRAVELER_ELECTRO":
      return Character.TRAVELER_ELECTRO;
    case 4:
    case "TRAVELER_DENDRO":
      return Character.TRAVELER_DENDRO;
    case 5:
    case "AETHER":
      return Character.AETHER;
    case 6:
    case "LUMINE":
      return Character.LUMINE;
    case 7:
    case "ALBEDO":
      return Character.ALBEDO;
    case 8:
    case "ALOY":
      return Character.ALOY;
    case 9:
    case "AMBER":
      return Character.AMBER;
    case 10:
    case "BARBARA":
      return Character.BARBARA;
    case 11:
    case "BEIDOU":
      return Character.BEIDOU;
    case 12:
    case "BENNETT":
      return Character.BENNETT;
    case 13:
    case "CHONGYUN":
      return Character.CHONGYUN;
    case 14:
    case "DILUC":
      return Character.DILUC;
    case 15:
    case "DIONA":
      return Character.DIONA;
    case 16:
    case "EULA":
      return Character.EULA;
    case 17:
    case "FISCHL":
      return Character.FISCHL;
    case 18:
    case "GANYU":
      return Character.GANYU;
    case 19:
    case "HU_TAO":
      return Character.HU_TAO;
    case 20:
    case "JEAN":
      return Character.JEAN;
    case 21:
    case "KAEDEHARA_KAZUHA":
      return Character.KAEDEHARA_KAZUHA;
    case 22:
    case "KAEYA":
      return Character.KAEYA;
    case 23:
    case "KAMISATO_AYAKA":
      return Character.KAMISATO_AYAKA;
    case 24:
    case "KEQING":
      return Character.KEQING;
    case 25:
    case "KLEE":
      return Character.KLEE;
    case 26:
    case "KUJOU_SARA":
      return Character.KUJOU_SARA;
    case 27:
    case "LISA":
      return Character.LISA;
    case 28:
    case "MONA":
      return Character.MONA;
    case 29:
    case "NINGGUANG":
      return Character.NINGGUANG;
    case 30:
    case "NOELLE":
      return Character.NOELLE;
    case 31:
    case "QIQI":
      return Character.QIQI;
    case 32:
    case "RAIDEN_SHOGUN":
      return Character.RAIDEN_SHOGUN;
    case 33:
    case "RAZOR":
      return Character.RAZOR;
    case 34:
    case "ROSARIA":
      return Character.ROSARIA;
    case 35:
    case "SANGONOMIYA_KOKOMI":
      return Character.SANGONOMIYA_KOKOMI;
    case 36:
    case "SAYU":
      return Character.SAYU;
    case 37:
    case "SUCROSE":
      return Character.SUCROSE;
    case 38:
    case "TARTAGLIA":
      return Character.TARTAGLIA;
    case 39:
    case "THOMA":
      return Character.THOMA;
    case 40:
    case "VENTI":
      return Character.VENTI;
    case 41:
    case "XIANGLING":
      return Character.XIANGLING;
    case 42:
    case "XIAO":
      return Character.XIAO;
    case 43:
    case "XINGQIU":
      return Character.XINGQIU;
    case 44:
    case "XINYAN":
      return Character.XINYAN;
    case 45:
    case "YANFEI":
      return Character.YANFEI;
    case 46:
    case "YOIMIYA":
      return Character.YOIMIYA;
    case 47:
    case "ZHONGLI":
      return Character.ZHONGLI;
    case 48:
    case "GOROU":
      return Character.GOROU;
    case 49:
    case "ARATAKI_ITTO":
      return Character.ARATAKI_ITTO;
    case 50:
    case "SHENHE":
      return Character.SHENHE;
    case 51:
    case "YUN_JIN":
      return Character.YUN_JIN;
    case 52:
    case "YAE_MIKO":
      return Character.YAE_MIKO;
    case 53:
    case "KAMISATO_AYATO":
      return Character.KAMISATO_AYATO;
    case 54:
    case "YELAN":
      return Character.YELAN;
    case 55:
    case "KUKI_SHINOBU":
      return Character.KUKI_SHINOBU;
    case 56:
    case "SHIKANOIN_HEIZOU":
      return Character.SHIKANOIN_HEIZOU;
    case 57:
    case "COLLEI":
      return Character.COLLEI;
    case 58:
    case "DORI":
      return Character.DORI;
    case 59:
    case "TIGHNARI":
      return Character.TIGHNARI;
    case 60:
    case "CANDACE":
      return Character.CANDACE;
    case 61:
    case "CYNO":
      return Character.CYNO;
    case 62:
    case "NILOU":
      return Character.NILOU;
    case 63:
    case "NAHIDA":
      return Character.NAHIDA;
    case 64:
    case "LAYLA":
      return Character.LAYLA;
    case 65:
    case "FARUZAN":
      return Character.FARUZAN;
    case 66:
    case "WANDERER":
      return Character.WANDERER;
    case 67:
    case "ALHAITHAM":
      return Character.ALHAITHAM;
    case 68:
    case "YAOYAO":
      return Character.YAOYAO;
    case 69:
    case "DEHYA":
      return Character.DEHYA;
    case 70:
    case "MIKA":
      return Character.MIKA;
    case 71:
    case "BAIZHU":
      return Character.BAIZHU;
    case 72:
    case "KAVEH":
      return Character.KAVEH;
    case 73:
    case "KIRARA":
      return Character.KIRARA;
    case 74:
    case "TRAVELER_HYDRO":
      return Character.TRAVELER_HYDRO;
    case 75:
    case "LYNEY":
      return Character.LYNEY;
    case 76:
    case "LYNETTE":
      return Character.LYNETTE;
    case 77:
    case "FREMINET":
      return Character.FREMINET;
    case 78:
    case "NEUVILLETTE":
      return Character.NEUVILLETTE;
    case 79:
    case "WRIOTHESLEY":
      return Character.WRIOTHESLEY;
    case 80:
    case "FURINA":
      return Character.FURINA;
    case 81:
    case "CHARLOTTE":
      return Character.CHARLOTTE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Character.UNRECOGNIZED;
  }
}

export function characterToJSON(object: Character): string {
  switch (object) {
    case Character.CHARACTER_UNSPECIFIED:
      return "CHARACTER_UNSPECIFIED";
    case Character.TRAVELER_ANEMO:
      return "TRAVELER_ANEMO";
    case Character.TRAVELER_GEO:
      return "TRAVELER_GEO";
    case Character.TRAVELER_ELECTRO:
      return "TRAVELER_ELECTRO";
    case Character.TRAVELER_DENDRO:
      return "TRAVELER_DENDRO";
    case Character.AETHER:
      return "AETHER";
    case Character.LUMINE:
      return "LUMINE";
    case Character.ALBEDO:
      return "ALBEDO";
    case Character.ALOY:
      return "ALOY";
    case Character.AMBER:
      return "AMBER";
    case Character.BARBARA:
      return "BARBARA";
    case Character.BEIDOU:
      return "BEIDOU";
    case Character.BENNETT:
      return "BENNETT";
    case Character.CHONGYUN:
      return "CHONGYUN";
    case Character.DILUC:
      return "DILUC";
    case Character.DIONA:
      return "DIONA";
    case Character.EULA:
      return "EULA";
    case Character.FISCHL:
      return "FISCHL";
    case Character.GANYU:
      return "GANYU";
    case Character.HU_TAO:
      return "HU_TAO";
    case Character.JEAN:
      return "JEAN";
    case Character.KAEDEHARA_KAZUHA:
      return "KAEDEHARA_KAZUHA";
    case Character.KAEYA:
      return "KAEYA";
    case Character.KAMISATO_AYAKA:
      return "KAMISATO_AYAKA";
    case Character.KEQING:
      return "KEQING";
    case Character.KLEE:
      return "KLEE";
    case Character.KUJOU_SARA:
      return "KUJOU_SARA";
    case Character.LISA:
      return "LISA";
    case Character.MONA:
      return "MONA";
    case Character.NINGGUANG:
      return "NINGGUANG";
    case Character.NOELLE:
      return "NOELLE";
    case Character.QIQI:
      return "QIQI";
    case Character.RAIDEN_SHOGUN:
      return "RAIDEN_SHOGUN";
    case Character.RAZOR:
      return "RAZOR";
    case Character.ROSARIA:
      return "ROSARIA";
    case Character.SANGONOMIYA_KOKOMI:
      return "SANGONOMIYA_KOKOMI";
    case Character.SAYU:
      return "SAYU";
    case Character.SUCROSE:
      return "SUCROSE";
    case Character.TARTAGLIA:
      return "TARTAGLIA";
    case Character.THOMA:
      return "THOMA";
    case Character.VENTI:
      return "VENTI";
    case Character.XIANGLING:
      return "XIANGLING";
    case Character.XIAO:
      return "XIAO";
    case Character.XINGQIU:
      return "XINGQIU";
    case Character.XINYAN:
      return "XINYAN";
    case Character.YANFEI:
      return "YANFEI";
    case Character.YOIMIYA:
      return "YOIMIYA";
    case Character.ZHONGLI:
      return "ZHONGLI";
    case Character.GOROU:
      return "GOROU";
    case Character.ARATAKI_ITTO:
      return "ARATAKI_ITTO";
    case Character.SHENHE:
      return "SHENHE";
    case Character.YUN_JIN:
      return "YUN_JIN";
    case Character.YAE_MIKO:
      return "YAE_MIKO";
    case Character.KAMISATO_AYATO:
      return "KAMISATO_AYATO";
    case Character.YELAN:
      return "YELAN";
    case Character.KUKI_SHINOBU:
      return "KUKI_SHINOBU";
    case Character.SHIKANOIN_HEIZOU:
      return "SHIKANOIN_HEIZOU";
    case Character.COLLEI:
      return "COLLEI";
    case Character.DORI:
      return "DORI";
    case Character.TIGHNARI:
      return "TIGHNARI";
    case Character.CANDACE:
      return "CANDACE";
    case Character.CYNO:
      return "CYNO";
    case Character.NILOU:
      return "NILOU";
    case Character.NAHIDA:
      return "NAHIDA";
    case Character.LAYLA:
      return "LAYLA";
    case Character.FARUZAN:
      return "FARUZAN";
    case Character.WANDERER:
      return "WANDERER";
    case Character.ALHAITHAM:
      return "ALHAITHAM";
    case Character.YAOYAO:
      return "YAOYAO";
    case Character.DEHYA:
      return "DEHYA";
    case Character.MIKA:
      return "MIKA";
    case Character.BAIZHU:
      return "BAIZHU";
    case Character.KAVEH:
      return "KAVEH";
    case Character.KIRARA:
      return "KIRARA";
    case Character.TRAVELER_HYDRO:
      return "TRAVELER_HYDRO";
    case Character.LYNEY:
      return "LYNEY";
    case Character.LYNETTE:
      return "LYNETTE";
    case Character.FREMINET:
      return "FREMINET";
    case Character.NEUVILLETTE:
      return "NEUVILLETTE";
    case Character.WRIOTHESLEY:
      return "WRIOTHESLEY";
    case Character.FURINA:
      return "FURINA";
    case Character.CHARLOTTE:
      return "CHARLOTTE";
    case Character.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
