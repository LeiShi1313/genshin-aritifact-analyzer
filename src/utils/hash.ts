import md5 from "crypto-js/md5";
import { Build } from "../genshin/build";
import { Suit, SetCombo } from "../genshin/suit";
import { ConfigOptions } from "../config";

const setComboComparator = (a: SetCombo, b: SetCombo) =>
  a.set - b.set ? a.set - b.set : a.count - b.count;

const suitComparator = (a: Suit, b: Suit, idx: number = 0) => {
  if (idx >= a.setCombos.length) return 0;
  if (idx >= b.setCombos.length) return 0;
  const result = setComboComparator(a.setCombos[idx], b.setCombos[idx]);
  if (result === 0) return suitComparator(a, b, idx + 1);
  return result;
};

const sortSuits = (suits: Suit[]): Suit[] =>
  suits
    .map<Suit>((suit) => ({
      setCombos: [...suit.setCombos].sort(setComboComparator),
    }))
    .sort(suitComparator);

export function hashBuild(build: Build): string {
  return md5(
    JSON.stringify({
      name: build.name,
      character: build.character,
      weapons: [...build.weapons].sort(),
      suits: sortSuits([...build.suits]),
      flowerAttributes: [...build.flowerAttributes].sort(),
      plumeAttributes: [...build.plumeAttributes].sort(),
      sandsAttributes: [...build.sandsAttributes].sort(),
      gobletAttributes: [...build.gobletAttributes].sort(),
      circletAttributes: [...build.circletAttributes].sort(),
      subAttributes: [...build.subAttributes].sort((a, b) =>
        a.type - b.type ? a.type - b.type : a.value - b.value
      ),
    })
  ).toString();
}

export const getArtifactsResultHash = (enabledBuilds: Record<string, string>) =>
  md5([...Object.keys(enabledBuilds)].sort().join("")).toString();

export const getConfigHash = (config: ConfigOptions) =>
  md5(
    JSON.stringify({
      attributeWeights: config.attributeWeights,
      rarityWeights: config.rarityWeights,
      standardRarity: config.standardRarity,
      scoreOverhead: config.scoreOverhead,
      nonFiveStarSubstractor: config.nonFiveStarSubstractor,
      nonSuitSubstractors: [...Object.keys(config.nonSuitSubstractors)]
        .sort()
        .map((key) => config.nonSuitSubstractors[key]),
    })
  ).toString();
