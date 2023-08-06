import * as math from "mathjs";
import * as defaultConfig from "../config";
import { Artifact } from "../genshin/artifact";
import {
  Attribute, AttributePosition, AttributeType
} from "../genshin/attribute";
import { attirbuteTypeLength, attrToIdx, posToIdx, subAttributeOptions, attributeValueToEffective } from "./attribute";
import { BuildEntry, BuildWeights, getBuildSets } from "./build";
import { getConfig } from "./config";
import { enumToIdx } from "./enum";
import { getConfigHash } from "./hash";
import { getProbability } from "./probability";
import { getAttributeWeights, getMainAttributeWeights, getSubAttributeWeights } from "./weights";


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
    arr.set([0, attrToIdx(attr.type)], attributeValueToEffective(attr));
  }
  return arr;
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
  let maxScore = getConfig(config).scoreOverhead *
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
      (mainFlatten[i] as number) + getConfig(config).scoreOverhead * math.sum(
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


export const getFitness = (
  artifact: Artifact,
  weights: BuildWeights[],
  config?: defaultConfig.ConfigOptions
): Object => {
  const fits = {};
  const mainArr = getAttributeArray([artifact.mainAttribute!]);
  const subArr = getWeightedAttributeArray(artifact.subAttributes);
  // console.log(`mainArr: ${mainArr}`);
  // console.log(`subArr: ${subArr}`);

  for (const weight of weights) {
    let fitness = 0;

    // console.log(`weight: ${JSON.stringify(weight)}`);
    const mainWeight = math.matrix([...weight[artifact.position]]);
    const subWeight = math.matrix([...weight[AttributePosition.SUB]]);
    fitness += math.sum(
      math.add(
        math.multiply(mainArr, mainWeight),
        math.multiply(subArr, subWeight)
      )
    );
    if (artifact.star < 5) fitness -= getConfig(config).nonFiveStarSubstractor;
    if (weight.sets.indexOf(artifact.set) === -1)
      fitness -= getConfig(config).nonSuitSubstractors[artifact.position];

    const bestScore = getBestScore(mainWeight, subWeight, config) + math.max(subWeight) * Math.floor(artifact.level / 4);
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
    for (const pos of enumToIdx(AttributePosition)) {
      const build = builds[hash];
      weight[pos] = getAttributeWeights(
        pos,
        build[`${AttributePosition[pos].toLowerCase()}Attributes`],
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
