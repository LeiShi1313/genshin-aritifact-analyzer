import { AttributePosition, AttributeType, Attribute } from "../genshin/attribute";
import { ConfigOptions } from "../config";
import { getRarity } from "../utils/fitsAndRarity";

interface RarityMessage {
    position: AttributePosition,
    mainAttributes: AttributeType[],
    subAttributes: Attribute[],
    config: ConfigOptions,
}

self.onmessage = (e: MessageEvent<RarityMessage>) => {
    const { position, mainAttributes, subAttributes, config } = e.data;
    const rarity = getRarity(position, mainAttributes, subAttributes, config);
    self.postMessage(rarity);
};

export {};