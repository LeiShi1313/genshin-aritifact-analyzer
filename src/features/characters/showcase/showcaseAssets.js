import fallbackArtifact from "../../../assets/pngs/Icon_Inventory_Artifacts.png";
import { AttributePosition } from "../../../genshin/attribute";
import { Character } from "../../../genshin/character";
import { Set } from "../../../genshin/set";
import { Weapon } from "../../../genshin/weapon";

const characterGachaImages = import.meta.glob(
  "../../../assets/characters/*_gacha.png",
  { eager: true, query: "?url", import: "default" }
);
const characterCoverImages = import.meta.glob(
  "../../../assets/characters/*_cover2.png",
  { eager: true, query: "?url", import: "default" }
);
const characterIconImages = import.meta.glob(
  "../../../assets/characters/*_icon.png",
  { eager: true, query: "?url", import: "default" }
);
const weaponImages = import.meta.glob("../../../assets/weapons/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const artifactImages = import.meta.glob("../../../assets/artifacts/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

const characterKey = (character) => Character[character]?.toLowerCase();

export const getCharacterGachaUrl = (character) => {
  const key = characterKey(character);
  if (!key) return undefined;
  return (
    characterGachaImages[`../../../assets/characters/${key}_gacha.png`] ??
    characterCoverImages[`../../../assets/characters/${key}_cover2.png`] ??
    characterIconImages[`../../../assets/characters/${key}_icon.png`]
  );
};

export const getCharacterIconUrl = (character) => {
  const key = characterKey(character);
  return key
    ? characterIconImages[`../../../assets/characters/${key}_icon.png`]
    : undefined;
};

export const getWeaponImageUrl = (weapon) => {
  const key = Weapon[weapon]?.toLowerCase();
  if (!key) return undefined;
  return (
    weaponImages[`../../../assets/weapons/${key}.png`] ??
    weaponImages[`../../../assets/weapons/${key}_awaken.png`]
  );
};

export const getArtifactImageUrl = (artifact) => {
  const set = Set[artifact?.set]?.toLowerCase();
  const position = AttributePosition[artifact?.position]?.toLowerCase();
  if (!set || !position) return fallbackArtifact;
  return (
    artifactImages[
      `../../../assets/artifacts/${set}_${position}.png`
    ] ?? fallbackArtifact
  );
};

export { fallbackArtifact };
