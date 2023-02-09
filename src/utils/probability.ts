
import * as math from "mathjs";
import * as percom from "percom";
import * as defaultConfig from "../config";
import { subAttributeOptions } from "./attribute";
import {
  Attribute,
  AttributeType,
  AttributePosition,
} from "../genshin/attribute";
import { posToIdx, attrToIdx } from "./attribute";
import { getConfig } from "./config";

const getRarityWeights = (config?: defaultConfig.ConfigOptions) =>
  math.matrix(math.clone(getConfig(config).rarityWeights));

const subAttributesPermutations = percom.per(
  subAttributeOptions,
  defaultConfig.maximumSubAttribute
);


export const getSubAttributeProbability = (
  subAttributes: Attribute[],
  mainAttribute?: AttributeType,
  config?: defaultConfig.ConfigOptions
): number => {
  const validSubAttributes = subAttributes.filter(
    (sub) => sub.type !== mainAttribute && Number(sub.value) !== 0
  );
  const mustSubAttributes = validSubAttributes.filter(
    (sub) => Number(sub.value) === 1
  );
  if (validSubAttributes.length === 0) return 1;
  const subColumn = math.clone(
    math.column(getRarityWeights(config), defaultConfig.subAttrIdx)
  );
  if (mainAttribute) {
    subColumn.set([mainAttribute - 1, 0], 0);
  }

  let p = 0;
  for (let com of subAttributesPermutations) {
    // The 2 ifs can be merged into 1.
    if (
      math.sum(
        validSubAttributes.map((a) =>
          com.indexOf(Number(a.type)) !== -1 ? 1 : 0
        )
      ) >=
      math.min(defaultConfig.maximumSubAttribute, validSubAttributes.length)
    ) {
      let weightsTotal = math.sum(subColumn);
      let _p = 1;
      for (let sub of com) {
        const subWeight = subColumn.get([sub - 1, 0]);
        _p *= subWeight / weightsTotal;
        weightsTotal -= subWeight;
      }
      p += _p;
    } else if (
      math.sum(
        mustSubAttributes.map((a) =>
          com.indexOf(Number(a.type)) !== -1 ? 1 : 0
        )
      ) >= math.min(defaultConfig.maximumSubAttribute, mustSubAttributes.length)
    ) {
      let weightsTotal = math.sum(subColumn);
      let _p = 1;
      for (let sub of com) {
        const subWeight = subColumn.get([sub - 1, 0]);
        _p *= subWeight / weightsTotal;
        weightsTotal -= subWeight;
      }
      p +=
        _p *
        validSubAttributes
          .map((attr) =>
            Number(attr.value) === 1
              ? 1
              : com.indexOf(Number(attr.type)) !== -1
              ? Number(attr.value)
              : 1 - Number(attr.value)
          )
          .reduce((acc, cur) => acc * cur);
    }
  }
  return p;
};

export const getProbability = (
  position: AttributePosition,
  mainAttributes: AttributeType[],
  subAttributes: Attribute[],
  config?: defaultConfig.ConfigOptions
): number => {
  const posIdx = posToIdx(position);
  const mainColumn = math.column(getRarityWeights(config), posIdx);

  if (mainAttributes.length === 0)
    return getSubAttributeProbability(subAttributes, undefined, config);

  let p = 0;
  for (let attr of mainAttributes) {
    let idx = attrToIdx(attr);
    p +=
      (mainColumn.get([idx, 0]) / math.sum(mainColumn)) *
      getSubAttributeProbability(subAttributes, attr, config);
  }

  return p;
};