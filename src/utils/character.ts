import { Character, characterFromJSON } from "../genshin/character";
import { enumToStringKey } from "./enum";
import data from '../data/characters.json';

const zhToKey = {};
Object.keys(data).map((key) => zhToKey[data[key]['zh_name']] = key.toUpperCase());

export const characterFromName = (name: string): Character => {
    const c = Character[name.toUpperCase()];
    if (c === undefined) {
        return Character.CHARACTER_UNSPECIFIED;
    }
    return c;
}

export const characterFromMonaName = (name: string): Character => {
    if (name === '') return Character.CHARACTER_UNSPECIFIED;
    return characterFromJSON(zhToKey[name])
}

export const characterFromGoodName = (name: string): Character => {
    if (name === '') return Character.CHARACTER_UNSPECIFIED;
    const characters = {};
    enumToStringKey(Character).forEach((key) => characters[key.replace('_', '').toUpperCase()] = Character[key]);
    return characters[name.toUpperCase()];
}

export const characterToTheme = (character: Character): string => {
    switch(character) {
        case Character.NAHIDA:
            return 'lemonade'
        case Character.SANGONOMIYA_KOKOMI:
            return 'aqua'
        case Character.RAIDEN_SHOGUN:
            return 'synthware'
        case Character.TIGHNARI:
            return 'emerald'
        case Character.WANDERER:
            return 'forest'
        case Character.ZHONGLI:
            return 'bumblebee'
        default: return 'auto'
    }
}