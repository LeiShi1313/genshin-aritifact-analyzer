export const characterKey = (name) =>
  name
    .replace(/[()]/g, "")
    .replace(/[^0-9a-z]/gi, "_")
    .toLowerCase();

export const weaponKey = (name) =>
  name
    .replace(/['"]/g, "")
    .replace(/[^0-9a-z]/gi, "_")
    .toLowerCase();

export const artifactSetKey = (name) =>
  name
    .replace(/'/g, "")
    .replace(/[^0-9a-z]/gi, "_")
    .toLowerCase();
