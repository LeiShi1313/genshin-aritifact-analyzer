import * as math from "mathjs";
import * as percom from "percom";
import * as config from "./config";
import { subAttributeOptions } from "./attribute";
import {
  Attribute,
  AttributeType,
  AttributePosition,
} from "../genshin/attribute";
import { Build } from "../genshin/build";
import { BuildWeights } from "./build";
import { Artifact } from "../genshin/artifact";

const attirbuteTypeLength = Object.keys(AttributeType).filter(
  (key) => !isNaN(Number(key)) && Number(key) > 0
).length;
const posToIdx = (pos: AttributePosition) => pos - 1;
const attrToIdx = (attr: AttributeType) => attr - 1;
const subAttrIdx = 5;

const subAttributesPermutations = percom.per(
  subAttributeOptions,
  config.maximumSubAttribute
);

export const getMainAttributeWeights = (
  position: AttributePosition,
  mainAttributes: AttributeType[],
  subAttributes: Attribute[]
): math.Matrix => {
  // if (position <= 0) return math.zeros(0, 19) as math.Matrix;
  const posIdx = posToIdx(position);
  const mainColumn = math.column(config.mainAttributeWeights, posIdx);
  const subColumn = math.column(config.subAttributeWeights, posIdx);
  const main = math.zeros(
    attirbuteTypeLength,
    attirbuteTypeLength
  ) as math.Matrix;
  const sub = math.zeros(
    attirbuteTypeLength,
    attirbuteTypeLength
  ) as math.Matrix;
  for (let attr of mainAttributes) {
    let idx = attrToIdx(attr);
    main.set([idx, idx], 1);
  }
  for (let attr of subAttributes) {
    if (mainAttributes.indexOf(attr.type) !== -1) continue;
    let idx = attrToIdx(attr.type);
    sub.set([idx, idx], 1);
  }
  return math.add(
    math.multiply(main, mainColumn),
    math.multiply(sub, subColumn)
  );
};

export const getSubAttributeWeights = (
  subAttributes: Attribute[]
): math.Matrix => {
  const subColume = math.column(config.subAttributeWeights, subAttrIdx);
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

export const getSubAttributeProbability = (
  subAttributes: Attribute[],
  mainAttribute?: AttributeType
): number => {
  const validSubAttributes = subAttributes.filter(
    (sub) => sub.type !== mainAttribute && Number(sub.value) !== 0
  );
  const mustSubAttributes = validSubAttributes.filter(
    (sub) => Number(sub.value) === 1
  );
  if (validSubAttributes.length === 0) return 1;
  const subColumn = math.clone(math.column(config.rarityWeights, 5));
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
      ) >= math.min(config.maximumSubAttribute, validSubAttributes.length)
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
      ) >= math.min(config.maximumSubAttribute, mustSubAttributes.length)
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
  subAttributes: Attribute[]
): number => {
  const posIdx = posToIdx(position);
  const mainColumn = math.column(config.rarityWeights, posIdx);

  if (mainAttributes.length === 0)
    return getSubAttributeProbability(subAttributes);

  let p = 0;
  for (let attr of mainAttributes) {
    let idx = attrToIdx(attr);
    p +=
      (mainColumn.get([idx, 0]) / math.sum(mainColumn)) *
      getSubAttributeProbability(subAttributes, attr);
  }

  return p;
};

export const getRarity = (
  position: AttributePosition,
  mainAttributes: AttributeType[],
  subAttributes: Attribute[]
): number =>
  math.log(
    1 / getProbability(position, mainAttributes, subAttributes),
    config.standardRarity
  );

export const getBestScore = (
  mainWeights: math.Matrix,
  subWeights: math.Matrix
): number => {
  const mainFlatten = math.flatten(mainWeights).toArray();
  const subFlatten = math.flatten(subWeights).toArray();
  const maxMain = math.max(mainFlatten);
  subFlatten[mainFlatten.indexOf(maxMain)] = 0.0;
  return (
    maxMain +
    config.scoreOverhead * math.sum(subFlatten.sort().reverse().slice(0, 4))
  );
};

export const getFlowserRarity = (build: Build): number =>
  getRarity(
    AttributePosition.FLOWER,
    build.flowerAttributes,
    build.subAttributes
  );
export const getPlumeRarity = (build: Build): number =>
  getRarity(
    AttributePosition.PLUME,
    build.plumeAttributes,
    build.subAttributes
  );
export const getSandsRarity = (build: Build): number =>
  getRarity(
    AttributePosition.SANDS,
    build.sandsAttributes,
    build.subAttributes
  );
export const getGobletRarity = (build: Build): number =>
  getRarity(
    AttributePosition.GOBLET,
    build.gobletAttributes,
    build.subAttributes
  );
export const getCircletRarity = (build: Build): number =>
  getRarity(
    AttributePosition.CIRCLET,
    build.circletAttributes,
    build.subAttributes
  );

export const getPlumeBestScore = (build: Build): number =>
  getBestScore(
    getMainAttributeWeights(
      AttributePosition.PLUME,
      build.plumeAttributes,
      build.subAttributes
    ),
    getSubAttributeWeights(build.subAttributes)
  );
export const getSandsBestScore = (build: Build): number =>
  getBestScore(
    getMainAttributeWeights(
      AttributePosition.SANDS,
      build.sandsAttributes,
      build.subAttributes
    ),
    getSubAttributeWeights(build.subAttributes)
  );
export const getGobletBestScore = (build: Build): number =>
  getBestScore(
    getMainAttributeWeights(
      AttributePosition.GOBLET,
      build.gobletAttributes,
      build.subAttributes
    ),
    getSubAttributeWeights(build.subAttributes)
  );
export const getCircletBestScore = (build: Build): number =>
  getBestScore(
    getMainAttributeWeights(
      AttributePosition.CIRCLET,
      build.circletAttributes,
      build.subAttributes
    ),
    getSubAttributeWeights(build.subAttributes)
  );

const getAttributeArray = (attributes: Attribute[]): math.Matrix => {
  const arr = math.zeros(1, attirbuteTypeLength) as math.Matrix;
  for (const attr of attributes) {
    arr.set([0, attrToIdx(attr.type)], 1);
  }
  return arr;
};
const getWeightedAttributeArray = (attributes: Attribute[]): math.Matrix => {
  const arr = math.zeros(1, attirbuteTypeLength) as math.Matrix;
  for (const attr of attributes) {
    arr.set([0, attrToIdx(attr.type)], attr.value);
  }
  return arr;
};

export const getFitness = (
  artifact: Artifact,
  weights: BuildWeights[]
): Object => {
  const fits = {};
  const mainArr = getAttributeArray([artifact.mainAttribute!]);
  const subArr = getAttributeArray(artifact.subAttributes);

  for (const weight of weights) {
    let fitness = 0;

    const mainWeight = math.matrix([...weight[artifact.position]]);
    const subWeight = math.matrix([...weight.sub]);
    fitness += math.sum(
      math.add(
        math.multiply(mainArr, mainWeight),
        math.multiply(subArr, subWeight)
      )
    );
    if (artifact.star < 5) fitness -= config.nonFiveStarSubstractor;
    if (weight.sets.indexOf(artifact.set) === -1) fitness -= config.nonSuitSubstractors[artifact.position];

    const bestScore = getBestScore(mainWeight, subWeight)
    fits[weight.hash] = fitness / bestScore;
  }
  return fits;
};
