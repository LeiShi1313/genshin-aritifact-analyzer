import * as math from "mathjs";
import * as defaultConfig from "../config";
import {
  Attribute,
  AttributeType,
  AttributePosition,
} from "../genshin/attribute";
import { getConfig } from "./config";
import { posToIdx, attrToIdx, attirbuteTypeLength } from "./attribute";
import { enumToIdx } from "./enum";


const getAttributeWeightsConfig = (config?: defaultConfig.ConfigOptions) =>
  math.matrix(math.clone(getConfig(config).attributeWeights));


export const getAttributeWeights = (
  position: AttributePosition,
  attibutes: Attribute[] | AttributeType[],
  config?: defaultConfig.ConfigOptions
): math.Matrix => {
  const posIdx = posToIdx(position);
  const column = math.column(getAttributeWeightsConfig(config), posIdx);

  const t = math.zeros(
    attirbuteTypeLength,
    attirbuteTypeLength
  ) as math.Matrix;

  for (let attr of attibutes) {
    if (attr.hasOwnProperty('type') && attr.hasOwnProperty('value')) {
      let idx = attrToIdx((attr as Attribute).type);
      t.set([idx, idx], (attr as Attribute).value);
    } else {
      let idx = attrToIdx(attr as AttributeType);
      t.set([idx, idx], 1);
    }
  }

  return math.multiply(t, column);
}

export const getMainAttributeWeights = (
  position: AttributePosition,
  mainAttributes: AttributeType[],
  subAttributes: Attribute[],
  config?: defaultConfig.ConfigOptions
): math.Matrix => {
  // if (position <= 0) return math.zeros(0, 19) as math.Matrix;
  const posIdx = posToIdx(position);
  const mainColumn = math.column(getAttributeWeightsConfig(config), posIdx);
  const main = math.zeros(
    attirbuteTypeLength,
    attirbuteTypeLength
  ) as math.Matrix;

  for (let attr of mainAttributes) {
    let idx = attrToIdx(attr);
    main.set([idx, idx], 1);
  }
  return math.multiply(main, mainColumn)
};

export const getSubAttributeWeights = (
  subAttributes: Attribute[],
  config?: defaultConfig.ConfigOptions
): math.Matrix => {
  const subColume = math.column(
    getAttributeWeightsConfig(config),
    defaultConfig.subAttrIdx
  );
  const sub = math.zeros(
    attirbuteTypeLength,
    attirbuteTypeLength
  ) as math.Matrix;
  for (let attr of subAttributes) {
    let idx = attrToIdx(attr.type);
    sub.set([idx, idx], 1);
  }
  return math.multiply(sub, subColume);
};

