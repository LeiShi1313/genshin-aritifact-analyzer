import * as math from "mathjs";
import * as percom from "percom";
import * as defaultConfig from "./config";
import { subAttributeOptions } from "./attribute";
import {
  Attribute,
  AttributeType,
  AttributePosition,
} from "../genshin/attribute";
import { Build } from "../genshin/build";
import { BuildWeights, BuildEntry, getBuildSets } from "./build";
import { Artifact } from "../genshin/artifact";
import { enumToIdx } from "./enum";
import { store } from "../store";
import { getConfigHash } from "./hash";

const getConfig = (
  config?: defaultConfig.ConfigOptions
): defaultConfig.ConfigOptions => ({
  ...defaultConfig,
  ...store.getState().configs,
  ...config,
});

const getAttributeWeights = (config?: defaultConfig.ConfigOptions) =>
  math.matrix(math.clone(getConfig(config).attributeWeights));
const getRarityWeights = (config?: defaultConfig.ConfigOptions) =>
  math.matrix(math.clone(getConfig(config).rarityWeights));

const attirbuteTypeLength = Object.keys(AttributeType).filter(
  (key) => !isNaN(Number(key)) && Number(key) > 0
).length;
const posToIdx = (pos: AttributePosition) => pos - 1;
const attrToIdx = (attr: AttributeType) => attr - 1;

const subAttributesPermutations = percom.per(
  subAttributeOptions,
  defaultConfig.maximumSubAttribute
);

export const getMainAttributeWeights = (
  position: AttributePosition,
  mainAttributes: AttributeType[],
  subAttributes: Attribute[],
  config?: defaultConfig.ConfigOptions
): math.Matrix => {
  // if (position <= 0) return math.zeros(0, 19) as math.Matrix;
  const posIdx = posToIdx(position);
  const mainColumn = math.column(getAttributeWeights(config), posIdx);
  const subColumn = math.column(getConfig(config).subAttributeWeights, posIdx);
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
  subAttributes: Attribute[],
  config?: defaultConfig.ConfigOptions
): math.Matrix => {
  const subColume = math.column(
    getAttributeWeights(config),
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

export const getRarity = (
  position: AttributePosition,
  mainAttributes: AttributeType[],
  subAttributes: Attribute[],
  config?: defaultConfig.ConfigOptions
): number =>
  math.log(
    1 / getProbability(position, mainAttributes, subAttributes, config),
    getConfig(config).standardRarity
  );

export const getBestScore = (
  mainWeights: math.Matrix,
  subWeights: math.Matrix,
  config?: defaultConfig.ConfigOptions
): number => {
  const mainFlatten = math.flatten(mainWeights).toArray();
  const subFlatten = math.flatten(subWeights).toArray();
  let maxScore =
    getConfig(config).scoreOverhead *
    math.sum(
      math
        .clone(subFlatten)
        .sort()
        .reverse()
        .slice(0, defaultConfig.maximumSubAttribute)
    );
  for (let i = 0; i < mainFlatten.length; i++) {
    if (mainFlatten[i] === 0) continue;
    let temp = subFlatten[i];
    subFlatten[i] = 0.0;
    maxScore = Math.max(
      maxScore,
      (mainFlatten[i] as number) +
        getConfig(config).scoreOverhead *
          math.sum(
            math
              .clone(subFlatten)
              .sort()
              .reverse()
              .slice(0, defaultConfig.maximumSubAttribute)
          )
    );
    subFlatten[i] = temp;
  }
  return maxScore;
};

export const getFlowserRarity = (
  build: Build,
  config?: defaultConfig.ConfigOptions
): number =>
  getRarity(
    AttributePosition.FLOWER,
    build.flowerAttributes,
    build.subAttributes,
    config
  );
export const getPlumeRarity = (
  build: Build,
  config?: defaultConfig.ConfigOptions
): number =>
  getRarity(
    AttributePosition.PLUME,
    build.plumeAttributes,
    build.subAttributes,
    config
  );
export const getSandsRarity = (
  build: Build,
  config?: defaultConfig.ConfigOptions
): number =>
  getRarity(
    AttributePosition.SANDS,
    build.sandsAttributes,
    build.subAttributes,
    config
  );
export const getGobletRarity = (
  build: Build,
  config?: defaultConfig.ConfigOptions
): number =>
  getRarity(
    AttributePosition.GOBLET,
    build.gobletAttributes,
    build.subAttributes,
    config
  );
export const getCircletRarity = (
  build: Build,
  config?: defaultConfig.ConfigOptions
): number =>
  getRarity(
    AttributePosition.CIRCLET,
    build.circletAttributes,
    build.subAttributes,
    config
  );

export const getPlumeBestScore = (
  build: Build,
  config?: defaultConfig.ConfigOptions
): number =>
  getBestScore(
    getMainAttributeWeights(
      AttributePosition.PLUME,
      build.plumeAttributes,
      build.subAttributes,
      config
    ),
    getSubAttributeWeights(build.subAttributes, config),
    config
  );
export const getSandsBestScore = (
  build: Build,
  config?: defaultConfig.ConfigOptions
): number =>
  getBestScore(
    getMainAttributeWeights(
      AttributePosition.SANDS,
      build.sandsAttributes,
      build.subAttributes,
      config
    ),
    getSubAttributeWeights(build.subAttributes, config),
    config
  );
export const getGobletBestScore = (
  build: Build,
  config?: defaultConfig.ConfigOptions
): number =>
  getBestScore(
    getMainAttributeWeights(
      AttributePosition.GOBLET,
      build.gobletAttributes,
      build.subAttributes,
      config
    ),
    getSubAttributeWeights(build.subAttributes, config),
    config
  );
export const getCircletBestScore = (
  build: Build,
  config?: defaultConfig.ConfigOptions
): number =>
  getBestScore(
    getMainAttributeWeights(
      AttributePosition.CIRCLET,
      build.circletAttributes,
      build.subAttributes,
      config
    ),
    getSubAttributeWeights(build.subAttributes, config),
    config
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
  weights: BuildWeights[],
  config?: defaultConfig.ConfigOptions
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
    if (artifact.star < 5) fitness -= getConfig(config).nonFiveStarSubstractor;
    if (weight.sets.indexOf(artifact.set) === -1)
      fitness -= getConfig(config).nonSuitSubstractors[artifact.position];

    const bestScore = getBestScore(mainWeight, subWeight, config);
    if (fitness > bestScore) {
      console.log(
        `fitness > bestScore: ${fitness} > ${bestScore} for artifact ${JSON.stringify(
          artifact
        )}`
      );
      console.log(getBestScore(mainWeight, subWeight, config));
    }
    fits[weight.hash] = fitness / bestScore;
  }
  return fits;
};

export interface FitsAndRarity {
  allFits: Record<number, number>;
  allRarity: Record<number, number>;
  configHash: string;
}

export const getAllFitsAndAllRarity = (
  artifacts: Artifact[],
  builds: BuildEntry,
  window?: Window,
  config?: defaultConfig.ConfigOptions
): FitsAndRarity => {
  const results = {
    allFits: {},
    allRarity: {},
    configHash: getConfigHash(getConfig(config)),
  };

  const weights = {};
  for (const hash of Object.keys(builds)) {
    const weight = {};
    for (const idx of enumToIdx(AttributePosition)) {
      const build = builds[hash];
      weight[idx] = getMainAttributeWeights(
        idx,
        build[`${AttributePosition[idx].toLowerCase()}Attributes`],
        build.subAttributes,
        config
      ).toArray();
      weight["sub"] = getSubAttributeWeights(
        build.subAttributes,
        config
      ).toArray();
    }
    weights[hash] = weight;
  }

  const len = artifacts.length;
  artifacts.forEach((artifact, index) => {
    const rarity = getRarity(
      artifact.position,
      [artifact.mainAttribute!.type],
      artifact.subAttributes.map((attr) => ({ type: attr.type, value: 1 })),
      config
    );
    const fits = getFitness(
      artifact,
      Object.keys(builds)
        .filter((key) => weights[key] !== undefined)
        .map((key) => ({
          hash: key,
          sets: getBuildSets(builds[key]),
          ...weights[key],
        })),
      config
    );
    results["allRarity"][index] = rarity;
    results["allFits"][index] = fits;
    if (window) window.postMessage(index / len);
  });
  return results;
};
