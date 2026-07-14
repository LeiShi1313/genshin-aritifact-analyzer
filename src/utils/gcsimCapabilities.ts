import { Character, characterFromJSON } from "../genshin/character";
import { Set, setFromJSON } from "../genshin/set";
import { Weapon, weaponFromJSON } from "../genshin/weapon";
import capabilities from "../data/gcsim/capabilities.json";

type CharacterScript = {
  characterInfos: Array<{ character: Character }>;
};

const characterNames = new Map(
  Object.entries(capabilities.characters).map(([key, name]) => [
    characterFromJSON(key.toUpperCase()),
    name,
  ])
);
const weaponNames = new Map(
  Object.entries(capabilities.weapons).map(([key, name]) => [
    weaponFromJSON(key.toUpperCase()),
    name,
  ])
);
const setNames = new Map(
  Object.entries(capabilities.artifacts).map(([key, name]) => [
    setFromJSON(key.toUpperCase()),
    name,
  ])
);

export const isGCSimCharacterSupported = (character: Character): boolean =>
  characterNames.has(character);

export const isGCSimWeaponSupported = (weapon: Weapon): boolean =>
  weaponNames.has(weapon);

export const isGCSimSetSupported = (set: Set): boolean => setNames.has(set);

export const getGCSimCharacterName = (
  character: Character
): string | undefined => characterNames.get(character);

export const getGCSimWeaponName = (weapon: Weapon): string | undefined =>
  weaponNames.get(weapon);

export const getGCSimSetName = (set: Set): string | undefined =>
  setNames.get(set);

export const getAvailableGCSimCharacters = (
  scripts: CharacterScript[]
): Character[] =>
  [
    ...new globalThis.Set(
      scripts.flatMap((script) =>
        script.characterInfos.map(({ character }) => character)
      )
    ),
  ]
    .filter(isGCSimCharacterSupported)
    .sort((left, right) => left - right);
