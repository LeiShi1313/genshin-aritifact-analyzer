import { Character, characterFromJSON } from "../genshin/character";
import zh_trans from '../data/characters.json';

const zhToKey = {};
Object.keys(zh_trans).map((key) => zhToKey[zh_trans[key]] = key.toUpperCase());

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