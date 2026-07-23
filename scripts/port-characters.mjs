import fs from "node:fs";

import genshindb from "genshin-db";

import * as utils from "./utils.mjs";

const isElementTraveler = (name) => name.startsWith("Traveler ");
const isTraveler = (name) =>
  isElementTraveler(name) || name === "Lumine" || name === "Aether";

const characterKey = (name) =>
  name
    .replace(/[()]/g, "")
    .replace(/[^0-9a-z]/gi, "_")
    .toLowerCase();

const portCharacters = async () => {
  const remoteNames = genshindb.characters("names", { matchCategories: true });
  const names = utils.syncNamesFile("scripts/characters", remoteNames);
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
    const english = isElementTraveler(name)
      ? genshindb.talents(name)
      : genshindb.characters(name);
    if (!english)
      throw new Error(`Character ${name} was not found in genshin-db`);

    const key = characterKey(english.name);
    protoLines.push(`    ${key.toUpperCase()} = ${index++};`);
    translations.en[key] = english.name;

    for (const [language, locale] of Object.entries(utils.lngToRegion)) {
      const localized = isElementTraveler(name)
        ? genshindb.talents(name, { resultLanguage: language })
        : genshindb.characters(name, { resultLanguage: language });
      if (!localized) {
        throw new Error(`${name} is missing the ${language} translation`);
      }
      translations[locale] ??= {};
      translations[locale][key] = localized.name;
    }

    characterData[key] = {
      zh_name: translations.zh[key],
      element: isElementTraveler(name)
        ? name.slice("Traveler ".length)
        : english.elementText !== "None"
        ? english.elementText
        : "",
      weapontype: isElementTraveler(name) ? "Sword" : english.weaponText,
      rarity: isElementTraveler(name) ? 5 : english.rarity,
    };

    const images = english.images ?? {};
    const imageSpecs = [
      {
        type: "icon",
        filename: images.filename_icon,
        directUrls: [images.mihoyo_icon, images.icon, images.image],
      },
      {
        type: "gacha",
        filename: images.filename_gachaSplash,
        directUrls: [images.gacha, images.card],
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
