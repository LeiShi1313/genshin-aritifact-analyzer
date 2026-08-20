import fs from "node:fs";

import * as utils from "./utils.mjs";
import { weaponKey } from "./game-data/keys.mjs";

const portWeapons = async (catalog) => {
  const recordsByKey = new Map(
    catalog.weapons.map((record) => [record.key, record])
  );
  const remoteNames = catalog.weapons.map(({ name }) => name);
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
    const english = recordsByKey.get(weaponKey(name));
    if (!english)
      throw new Error(`Weapon ${name} was not found in the catalog`);

    const key = weaponKey(english.name);
    protoLines.push(`    ${key.toUpperCase()} = ${index++};`);
    weaponData[key] = {
      weapontype: english.weaponType,
      rarity: english.rarity,
    };
    translations.en[key] = english.name;

    for (const locale of Object.values(utils.lngToRegion)) {
      const localized = english.translations[locale];
      if (!localized)
        throw new Error(`${name} is missing the ${locale} translation`);
      translations[locale] ??= {};
      translations[locale][key] = localized;
    }

    const images = english.images ?? {};
    const imageSpecs = [
      {
        suffix: "",
        filename: images.filenameIcon,
        directUrls: images.iconUrls ?? [],
      },
      {
        suffix: "_awaken",
        filename: images.filenameAwakenIcon,
        directUrls: images.awakenUrls ?? [],
      },
    ];

    for (const { suffix, filename, directUrls } of imageSpecs) {
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
          ...directUrls,
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
