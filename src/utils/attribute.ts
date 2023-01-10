import {
  Attribute,
  AttributeType,
  AttributePosition,
} from "../genshin/attribute";

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
  waterBonus: AttributeType.HYDRO_DAMAGE_BONUS,
  thunderBonus: AttributeType.ELECTRO_DAMAGE_BONUS,
  iceBonus: AttributeType.CRYO_DAMAGE_BONUS,
  windBonus: AttributeType.ANEMO_DAMAGE_BONUS,
  rockBonus: AttributeType.GEO_DAMAGE_BONUS,
  physicalBonus: AttributeType.PHYSICAL_DAMAGE_BONUS,
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

export const attributeFromMona = (input: string | Object): Attribute => {
  if (typeof input === "string" || input instanceof String)
    input = JSON.parse(input as string);
  return {
    type: monaAttributeToAttributeType[input["name"]],
    value: Number(input["value"]),
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
