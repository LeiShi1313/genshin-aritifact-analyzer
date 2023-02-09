import {
  Attribute,
  AttributeType,
  AttributePosition,
} from "../genshin/attribute";
import * as defaultConfig from "../config";

export const monaAttributeToAttributeType = {
  lifeStatic: AttributeType.HP,
  attackStatic: AttributeType.ATK,
  defendStatic: AttributeType.DEF,
  elementalMastery: AttributeType.ELEMENTAL_MASTERY,
  recharge: AttributeType.ENERGY_RECHARGE,
  lifePercentage: AttributeType.HP_PERCENT,
  attackPercentage: AttributeType.ATK_PERCENT,
  defendPercentage: AttributeType.DEF_PERCENT,
  critical: AttributeType.CRIT_RATE,
  criticalDamage: AttributeType.CRIT_DAMAGE,
  cureEffect: AttributeType.HEALING_BONUS,
  fireBonus: AttributeType.PYRO_DAMAGE_BONUS,
  dendroBonus: AttributeType.DENDRO_DAMAGE_BONUS,
  waterBonus: AttributeType.HYDRO_DAMAGE_BONUS,
  thunderBonus: AttributeType.ELECTRO_DAMAGE_BONUS,
  iceBonus: AttributeType.CRYO_DAMAGE_BONUS,
  windBonus: AttributeType.ANEMO_DAMAGE_BONUS,
  rockBonus: AttributeType.GEO_DAMAGE_BONUS,
  physicalBonus: AttributeType.PHYSICAL_DAMAGE_BONUS,
};

export const goodAttributeToAttributeType = {
  hp: AttributeType.HP,
  atk: AttributeType.ATK,
  def: AttributeType.DEF,
  hp_: AttributeType.HP_PERCENT,
  atk_: AttributeType.ATK_PERCENT,
  def_: AttributeType.DEF_PERCENT,
  eleMas: AttributeType.ELEMENTAL_MASTERY,
  enerRech_: AttributeType.ENERGY_RECHARGE,
  critRate_: AttributeType.CRIT_RATE,
  critDMG_: AttributeType.CRIT_DAMAGE,
  heal_: AttributeType.HEALING_BONUS,
  pyro_dmg_: AttributeType.PYRO_DAMAGE_BONUS,
  hydro_dmg_: AttributeType.HYDRO_DAMAGE_BONUS,
  electro_dmg_: AttributeType.ELECTRO_DAMAGE_BONUS,
  cryo_dmg_: AttributeType.CRYO_DAMAGE_BONUS,
  anemo_dmg_: AttributeType.ANEMO_DAMAGE_BONUS,
  geo_dmg_: AttributeType.GEO_DAMAGE_BONUS,
  dendro_dmg_: AttributeType.DENDRO_DAMAGE_BONUS,
  physical_dmg_: AttributeType.PHYSICAL_DAMAGE_BONUS,
};

export const sandsMainAttributes = [
  AttributeType.HP_PERCENT,
  AttributeType.ATK_PERCENT,
  AttributeType.DEF_PERCENT,
  AttributeType.ELEMENTAL_MASTERY,
  AttributeType.ENERGY_RECHARGE,
];
export const gobletMainAttributes = [
  AttributeType.HP_PERCENT,
  AttributeType.ATK_PERCENT,
  AttributeType.DEF_PERCENT,
  AttributeType.ELEMENTAL_MASTERY,
  AttributeType.PYRO_DAMAGE_BONUS,
  AttributeType.HYDRO_DAMAGE_BONUS,
  AttributeType.ELECTRO_DAMAGE_BONUS,
  AttributeType.CRYO_DAMAGE_BONUS,
  AttributeType.ANEMO_DAMAGE_BONUS,
  AttributeType.GEO_DAMAGE_BONUS,
  AttributeType.DENDRO_DAMAGE_BONUS,
  AttributeType.PHYSICAL_DAMAGE_BONUS,
];
export const circletMainAttributes = [
  AttributeType.HP_PERCENT,
  AttributeType.ATK_PERCENT,
  AttributeType.DEF_PERCENT,
  AttributeType.ELEMENTAL_MASTERY,
  AttributeType.CRIT_RATE,
  AttributeType.CRIT_DAMAGE,
  AttributeType.HEALING_BONUS,
];

export enum MonaAttributePosition {
  feather = "feather",
  flower = "flower",
  sand = "sand",
  cup = "cup",
  head = "head",
}

export const monaPositionToAttributePosition = {
  feather: AttributePosition.PLUME,
  flower: AttributePosition.FLOWER,
  sand: AttributePosition.SANDS,
  cup: AttributePosition.GOBLET,
  head: AttributePosition.CIRCLET,
};

export const mainAttributeOptions = {
  [AttributePosition.FLOWER]: [AttributeType.HP],
  [AttributePosition.PLUME]: [AttributeType.ATK],
  [AttributePosition.SANDS]: sandsMainAttributes,
  [AttributePosition.GOBLET]: gobletMainAttributes,
  [AttributePosition.CIRCLET]: circletMainAttributes,
};

export const subAttributeOptions = [
  AttributeType.HP,
  AttributeType.ATK,
  AttributeType.DEF,
  AttributeType.HP_PERCENT,
  AttributeType.ATK_PERCENT,
  AttributeType.DEF_PERCENT,
  AttributeType.ELEMENTAL_MASTERY,
  AttributeType.ENERGY_RECHARGE,
  AttributeType.CRIT_RATE,
  AttributeType.CRIT_DAMAGE,
];

export const posToIdx = (pos: AttributePosition) => pos - 1;
export const attrToIdx = (attr: AttributeType) => attr - 1;
export const attirbuteTypeLength = Object.keys(AttributeType).filter(
  (key) => !isNaN(Number(key)) && Number(key) > 0
).length;

export const attributeValueFromStarAndLevel = (
  attr: AttributeType,
  star: number,
  level: number
): number => {
  // TODO: finish this
  switch (attr) {
    case AttributeType.HP:
      return 203.15 * 0.9 ** (star - 5) * level + 717 * 0.9 ** (star - 5);
    case AttributeType.ATK:
      return 13.2 * 0.9 ** (star - 5) * level + 47.4 * 0.9 ** (star - 5);
    case AttributeType.HP_PERCENT:
    case AttributeType.ATK_PERCENT:
      return 0.0198 * 0.9 ** (star - 5) * level + 0.069 * 0.9 ** (star - 5);
    case AttributeType.DEF_PERCENT:
    case AttributeType.PHYSICAL_DAMAGE_BONUS:
      return 0.0248 * 0.9 ** (star - 5) * level + 0.086 * 0.9 ** (star - 5);
    case AttributeType.ELEMENTAL_MASTERY:
      return 7.95 * 0.9 ** (star - 5) * level + 27.2 * 0.9 ** (star - 5);
    case AttributeType.ENERGY_RECHARGE:
      return 0.022 * 0.9 ** (star - 5) * level + 0.078 * 0.9 ** (star - 5);
    case AttributeType.CRIT_RATE:
      return 0.0132 * 0.9 ** (star - 5) * level + 0.046 * 0.9 ** (star - 5);
    case AttributeType.CRIT_DAMAGE:
      return 0.02645 * 0.9 ** (star - 5) * level + 0.092 * 0.9 ** (star - 5);
    case AttributeType.HEALING_BONUS:
      return 0.01525 * 0.9 ** (star - 5) * level + 0.053 * 0.9 ** (star - 5);
    case AttributeType.PYRO_DAMAGE_BONUS:
    case AttributeType.HYDRO_DAMAGE_BONUS:
    case AttributeType.ELECTRO_DAMAGE_BONUS:
    case AttributeType.CRYO_DAMAGE_BONUS:
    case AttributeType.ANEMO_DAMAGE_BONUS:
    case AttributeType.GEO_DAMAGE_BONUS:
    case AttributeType.DENDRO_DAMAGE_BONUS:
      return 0.0198 * 0.9 ** (star - 5) * level + 0.069 * 0.9 ** (star - 5);
    default:
      return 0;
  }
};

export const attributeFromMona = (input: string | Object): Attribute => {
  if (typeof input === "string" || input instanceof String)
    input = JSON.parse(input as string);
  return {
    type: monaAttributeToAttributeType[input["name"]],
    value: Number(input["value"]),
  };
};

export const attributeFromGood = (
  key: string,
  level: number,
  star: number
): Attribute => {
  return {
    type: goodAttributeToAttributeType[key],
    value: attributeValueFromStarAndLevel(
      goodAttributeToAttributeType[key],
      star,
      level
    ),
  };
};

export const formatAttributeValue = (attr: Attribute): string => {
  if (
    attr.type === AttributeType.HP ||
    attr.type === AttributeType.ATK ||
    attr.type === AttributeType.DEF ||
    attr.type === AttributeType.ELEMENTAL_MASTERY
  ) {
    return attr.value.toFixed(0);
  }
  return (attr.value * 100).toFixed(1) + "%";
};

export const attributeValueToEffective = (attr: Attribute): number => {
  const divisor = defaultConfig.effectiveStatDivisor[AttributeType[attr.type]];
  if (divisor !== undefined) {
    return attr.value / divisor;
  }
  return 0;
}