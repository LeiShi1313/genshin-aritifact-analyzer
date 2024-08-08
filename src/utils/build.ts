import { SetCombo } from "./../genshin/suit";
import { Build } from "../genshin/build";
import { Character } from "../genshin/character";
import { Weapon } from "../genshin/weapon";
import { weaponToJSON } from "../genshin/weapon";
import { characterToJSON } from "../genshin/character";
import { Set as GenshinSet, setFromJSON, setToJSON } from "../genshin/set";
import { AttributePosition } from "../genshin/attribute";
import { toHex, fromHex } from "./hex";
import data from "../data/sets.json";
import data2pc from "../data/set2pcEffect.json";
import { TFunction } from "react-i18next";
import migrateIdIfNeeded from "./migrate_id";

const setTo2pcSets = {};
Object.keys(data).map((key) => {
  setTo2pcSets[setFromJSON(key.toUpperCase())] = (
    data2pc[data[key]["2pc"]] ?? [key]
  ).map((key: string) => setFromJSON(key.toUpperCase()));
});

export const encodeBuild = (build: Build): string =>
  toHex(Build.encode(build).finish());
export const decodeBuild = (encoded: string): Build =>
  migrateIdIfNeeded(Build.decode(fromHex(encoded)));

export const getBuildShortName = (build: Build, t: TFunction): string => {
  let shortName = t(Character[build.character].toLowerCase(), { ns: "characters" });
  if (build.name) {
    shortName += ` - ${build.name}`;
  } else {
    if (build.weapons.length > 0) {
      shortName += ` - ${build.weapons.map((w) => t(`${Weapon[w].toLowerCase()}`, { ns: "weapons" })).join("-")}`
    }
    const sets = getBuildSets(build);
    if (sets.length > 0) {
      shortName += ` - ${sets.map((set) => t(`${GenshinSet[set].toLowerCase()}`, { ns: "sets" })).join("-")}`;
    }
  }
  return shortName;
}

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
