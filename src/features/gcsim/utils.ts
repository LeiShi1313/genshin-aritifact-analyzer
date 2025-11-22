import { Weapon } from "../../genshin/weapon";
import { Set } from "../../genshin/set";
import { AttributePosition } from "../../genshin/attribute";
import { Artifact } from "../../genshin/artifact";

/**
 * Get weapon icon URL
 */
export const getWeaponIconUrl = (id: number): string => {
  const weaponKey = Weapon[id]?.toLowerCase();
  if (!weaponKey) return "";
  return new URL(
    `../../assets/weapons/${weaponKey}_awaken.png`,
    import.meta.url
  ).href;
};

/**
 * Get set icon URL (uses flower position by default, circlet for prayers sets)
 */
export const getSetIconUrl = (id: number): string => {
  const setKey = Set[id]?.toLowerCase();
  if (!setKey) return "";
  const posId = AttributePosition[setKey.startsWith("prayers_") ? 5 : 1].toLowerCase();
  return new URL(
    `../../assets/artifacts/${setKey}_${posId}.png`,
    import.meta.url
  ).href;
};

/**
 * Get artifact icon URL based on its set and position
 */
export const getArtifactIconUrl = (artifact: Artifact): string => {
  const setKey = Set[artifact.set]?.toLowerCase();
  const posKey = AttributePosition[artifact.position]?.toLowerCase();
  if (!setKey || !posKey) return "";
  return new URL(
    `../../assets/artifacts/${setKey}_${posKey}.png`,
    import.meta.url
  ).href;
};

/**
 * Get character icon URL
 */
export const getCharacterIconUrl = (charKey: string): string => {
  if (!charKey) return "";
  return new URL(
    `../../assets/characters/${charKey}_icon.png`,
    import.meta.url
  ).href;
};
