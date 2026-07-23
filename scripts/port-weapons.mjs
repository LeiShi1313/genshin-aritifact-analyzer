import fs from "node:fs";

import genshindb from "genshin-db";

import * as utils from "./utils.mjs";

const weaponKey = (name) =>
  name
    .replace(/['"]/g, "")
    .replace(/[^0-9a-z]/gi, "_")
    .toLowerCase();

const portWeapons = async () => {
  const remoteNames = genshindb.weapons("names", { matchCategories: true });
  const names = utils.syncNamesFile("scripts/weapon", remoteNames, (name) =>
    name.replace(/"/g, "")
  );
  const translations = { en: {} };
  const weaponData = {};
  const protoLines = [
    'syntax = "proto3";',
    "",
    "package io.leishi.genshin.proto;",
    "",
    "enum WeaponType {",
    "    WEAPON_TYPE_UNSPECIFIED = 0;",
    "    BOW = 1;",
    "    CLAYMORE = 2;",
    "    CATALYST = 3;",
    "    POLEARM = 4;",
    "    SWORD = 5;",
    "}",
    "",
    "enum Weapon {",
    "    WEAPON_UNSPECIFIED = 0;",
  ];

  let index = 1;
  for (const name of names) {
    const english = genshindb.weapons(name);
    if (!english) throw new Error(`Weapon ${name} was not found in genshin-db`);

    const key = weaponKey(english.name);
    protoLines.push(`    ${key.toUpperCase()} = ${index++};`);
    weaponData[key] = {
      weapontype: english.weaponText,
      rarity: english.rarity,
    };
    translations.en[key] = english.name;

    for (const [language, locale] of Object.entries(utils.lngToRegion)) {
      const localized = genshindb.weapons(name, { resultLanguage: language });
      if (!localized) {
        throw new Error(`${name} is missing the ${language} translation`);
      }
      translations[locale] ??= {};
      translations[locale][key] = localized.name;
    }

    const images = english.images ?? {};
    const imageSpecs = [
      {
        suffix: "",
        filename: images.filename_icon,
        directUrl: images.mihoyo_icon,
      },
      {
        suffix: "_awaken",
        filename: images.filename_awakenIcon,
        directUrl: images.mihoyo_awakenIcon,
      },
    ];

    for (const { suffix, filename, directUrl } of imageSpecs) {
      const imagePath = `src/assets/weapons/${key}${suffix}.png`;
      if (utils.isValidImage(imagePath)) continue;
      if (!filename)
        throw new Error(
          `${name} is missing an image filename for ${suffix || "base"}`
        );
      await utils.downloadFirstAvailable(
        [
          utils.yattaImageUrl(filename, "weapon"),
          utils.enkaImageUrl(filename),
          directUrl,
          utils.nanokaImageUrl(filename),
        ],
        imagePath,
        `${name}${suffix}`
      );
    }
  }

  protoLines.push("}", "");
  fs.writeFileSync("proto/weapon.proto", protoLines.join("\n"), "utf8");
  for (const [locale, values] of Object.entries(translations)) {
    fs.writeFileSync(
      `public/locales/${locale}/weapons.json`,
      JSON.stringify(values),
      "utf8"
    );
  }
  fs.writeFileSync("src/data/weapons.json", JSON.stringify(weaponData), "utf8");
};

export { portWeapons };
