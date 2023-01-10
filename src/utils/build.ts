import { Build } from "../genshin/build";
import { Set as GenshinSet } from "../genshin/set";
import { AttributePosition } from "../genshin/attribute";
import { toHex, fromHex } from "./hex";

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
  sub: Array<number>;
  sets: GenshinSet[];
}

export const getBuildSets = (build: Build) => [
  ...new Set(
    build.suits
      .map((suit) => suit.setCombos.map((setCombo) => setCombo.set))
      .flatMap((s) => s)
  ),
];
