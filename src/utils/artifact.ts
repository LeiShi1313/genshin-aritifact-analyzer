import { monaSetToSet } from "./set";
import { characterFromMonaName } from "./character";
import {
  attributeFromMona,
  monaPositionToAttributePosition,
} from "./attribute";
import { Artifact } from "../genshin/artifact";

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
  };
};
