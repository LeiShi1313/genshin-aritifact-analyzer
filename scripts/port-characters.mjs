import fs from "node:fs";

import * as utils from "./utils.mjs";
import { characterKey } from "./game-data/keys.mjs";

const isElementTraveler = (name) => name.startsWith("Traveler ");
const isTraveler = (name) =>
  isElementTraveler(name) || name === "Lumine" || name === "Aether";

const portCharacters = async (catalog) => {
  const recordsByKey = new Map(
    catalog.characters.map((record) => [record.key, record])
  );
  const remoteNames = catalog.characters.map(({ name }) => name);
  const names = utils.syncNamesFile("scripts/characters", remoteNames, (name) =>
    name.replace(/[()]/g, "")
  );
  const translations = { en: {} };
  const characterData = {};
  const protoLines = [
    'syntax = "proto3";',
    "",
    "package io.leishi.genshin.proto;",
    "",
    "enum Character {",
    "    CHARACTER_UNSPECIFIED = 0;",
  ];

  let index = 1;
  for (const name of names) {
    const english = recordsByKey.get(characterKey(name));
    if (!english)
      throw new Error(`Character ${name} was not found in the catalog`);

    const key = characterKey(english.name);
    protoLines.push(`    ${key.toUpperCase()} = ${index++};`);
    translations.en[key] = english.name;

    for (const locale of Object.values(utils.lngToRegion)) {
      const localized = english.translations[locale];
      if (!localized)
        throw new Error(`${name} is missing the ${locale} translation`);
      translations[locale] ??= {};
      translations[locale][key] = localized;
    }

    characterData[key] = {
      zh_name: translations.zh[key],
      element: english.element,
      weapontype: english.weaponType,
      rarity: english.rarity,
    };

    const images = english.images ?? {};
    const imageSpecs = [
      {
        type: "icon",
        filename: images.filenameIcon,
        directUrls: images.iconUrls ?? [],
      },
      {
        type: "gacha",
        filename: images.filenameGachaSplash,
        directUrls: images.gachaUrls ?? [],
      },
    ];

    for (const { type, filename, directUrls } of imageSpecs) {
      const imagePath = `src/assets/characters/${key}_${type}.png`;
      if (utils.isValidImage(imagePath)) continue;
      if (!filename && isTraveler(name)) continue;
      if (!filename) throw new Error(`${name} is missing its ${type} filename`);

      await utils.downloadFirstAvailable(
        [
          utils.yattaImageUrl(filename, "character"),
          utils.enkaImageUrl(filename),
          ...directUrls,
          utils.nanokaImageUrl(filename),
        ],
        imagePath,
        `${name} ${type}`
      );
    }
  }

  protoLines.push("}", "");
  fs.writeFileSync("proto/character.proto", protoLines.join("\n"), "utf8");
  for (const [locale, values] of Object.entries(translations)) {
    fs.writeFileSync(
      `public/locales/${locale}/characters.json`,
      JSON.stringify(values),
      "utf8"
    );
  }
  fs.writeFileSync(
    "src/data/characters.json",
    JSON.stringify(characterData),
    "utf8"
  );
};

export { portCharacters };
