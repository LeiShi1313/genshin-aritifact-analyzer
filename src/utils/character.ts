import { Character, characterFromJSON, characterToJSON } from "../genshin/character";
import { enumToStringKey } from "./enum";
import data from '../data/characters.json';
import characterThemes from '../data/genshin_character_themes.json';

const zhToKey = {};
Object.keys(data).map((key) => zhToKey[data[key]['zh_name']] = key.toUpperCase());

export const characterMetadata = {};
Object.keys(data).map((key) => {
  const formatKey = key.toUpperCase();
  characterMetadata[formatKey] = {};
  characterMetadata[formatKey].element = data[key]["element"];
  characterMetadata[formatKey].weaponType = data[key]["weapontype"];
  characterMetadata[formatKey].rarity = data[key]["rarity"];
});

const characterWithTheme = new Set(characterThemes.map((theme) => Object.keys(theme)[0]));

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
    if (characterWithTheme.has(characterToJSON(character))) {
        return characterToJSON(character);
    }
    return 'auto';
}