import { SetCombo } from "./../genshin/suit";
import { Build } from "../genshin/build";
import { Set as GenshinSet, setFromJSON, setToJSON } from "../genshin/set";
import { AttributePosition } from "../genshin/attribute";
import { toHex, fromHex } from "./hex";
import data from "../data/sets.json";
import data2pc from "../data/set2pcEffect.json";

const setTo2pcSets = {};
Object.keys(data).map((key) => {
  setTo2pcSets[setFromJSON(key.toUpperCase())] = (
    data2pc[data[key]["2pc"]] ?? [key]
  ).map((key: string) => setFromJSON(key.toUpperCase()));
});

export const encodeBuild = (build: Build): string =>
  toHex(Build.encode(build).finish());
export const decodeBuild = (encoded: string): Build =>
  Build.decode(fromHex(encoded));

export interface BuildWeights {
  hash: string;
  [AttributePosition.FLOWER]: Array<number>;
  [AttributePosition.PLUME]: Array<number>;
  [AttributePosition.SANDS]: Array<number>;
  [AttributePosition.GOBLET]: Array<number>;
  [AttributePosition.CIRCLET]: Array<number>;
  [AttributePosition.SUB]: Array<number>;
  sets: GenshinSet[];
}

export type BuildEntry = Record<string, Build>;

export const get2pcSets = (setCombos: SetCombo[]) =>
  setCombos.map((setCombo) => setTo2pcSets[setCombo.set]).flatMap((s) => s);

export const getBuildSets = (build: Build) => {
  var ret = [
    ...new Set(
      build.suits
        .map((suit) => {
          if (suit.setCombos.length > 1) {
            return suit.setCombos
              .map((setCombo) => setTo2pcSets[setCombo.set])
              .flatMap((s) => s);
          }
          return suit.setCombos.map((setCombo) => setCombo.set);
        })
        .flatMap((s) => s)
    ),
  ];
  return ret;
};
