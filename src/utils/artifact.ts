import { monaSetToSet, goodSetToSet } from "./set";
import { characterFromMonaName, characterFromGoodName } from "./character";
import {
  attributeFromMona,
  attributeFromGood,
  goodAttributeToAttributeType,
  monaPositionToAttributePosition,
} from "./attribute";
import { Artifact } from "../genshin/artifact";
import { attributePositionFromJSON } from "../genshin/attribute";

export const deserializeFromMona = (input: string | Object): Artifact => {
  if (typeof input === "string" || input instanceof String)
    input = JSON.parse(input as string);

  return {
    set: monaSetToSet(input["setName"]),
    position: monaPositionToAttributePosition[input["position"]],
    star: input["star"],
    level: input["level"],
    mainAttribute: attributeFromMona(input["mainTag"]),
    subAttributes: input["normalTags"].map((subAttribute: Object) =>
      attributeFromMona(subAttribute)
    ),
    character: characterFromMonaName(input["equip"]),
    locked: false,
  };
};

export const deserializeFromGood = (input: string | Object): Artifact => {
  if (typeof input === "string" || input instanceof String)
    input = JSON.parse(input as string);

  return {
    set: goodSetToSet(input["setKey"]),
    position: attributePositionFromJSON(input["slotKey"].toUpperCase()),
    star: input["rarity"],
    level: input["level"],
    mainAttribute: attributeFromGood(input["mainStatKey"], input["level"], input["rarity"]),
    subAttributes: input["substats"]
      .filter((stat: Object) => stat["key"] !== null && stat["value"] !== 0)
      .map((stat: Object) => ({
        type: goodAttributeToAttributeType[stat["key"]],
        value: stat["key"].endsWith('_') ? stat["value"] / 100 : stat["value"],
      })),
    character: characterFromGoodName(input["location"]),
    locked: input["lock"],
  };
};
