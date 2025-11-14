import { GENSHIN_GAME_VERSION, GENSHIN_DB_VERSION } from "../data/version";

/**
 * Get the Genshin Impact game version that the genshin-db data corresponds to.
 * This version is auto-generated during the build process from genshin-db package info.
 * @returns The game version string (e.g., "6.1")
 */
export const getGenshinGameVersion = (): string => {
  return GENSHIN_GAME_VERSION;
};

/**
 * Get the genshin-db npm package version.
 * @returns The package version string (e.g., "5.2.6")
 */
export const getGenshinDbVersion = (): string => {
  return GENSHIN_DB_VERSION;
};
