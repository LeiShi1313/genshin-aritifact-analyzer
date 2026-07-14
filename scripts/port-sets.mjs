import fs from "node:fs";

import genshindb from "genshin-db";

import * as utils from "./utils.mjs";

const positions = ["flower", "plume", "sands", "goblet", "circlet"];

const setKey = (name) =>
  name
    .replace(/'/g, "")
    .replace(/[^0-9a-z]/gi, "_")
    .toLowerCase();

const portSets = async () => {
  const remoteNames = genshindb.artifacts("names", { matchCategories: true });
  const names = utils.syncNamesFile("scripts/sets", remoteNames);
  const translations = { en: {} };
  const setsData = {};
  const setEffects = {};
  const protoLines = [
    'syntax = "proto3";',
    "",
    "package io.leishi.genshin.proto;",
    "",
    "enum Set {",
    "    SET_UNSPECIFIED = 0;",
  ];

  let index = 1;
  for (const name of names) {
    const english = genshindb.artifacts(name);
    if (!english)
      throw new Error(`Artifact set ${name} was not found in genshin-db`);

    const key = setKey(english.name);
    protoLines.push(`    ${key.toUpperCase()} = ${index++};`);
    translations.en[key] = english.name;
    setsData[key] = {
      "2pc": english.effect2Pc,
      "4pc": english.effect4Pc,
    };
    if (english.effect2Pc) {
      setEffects[english.effect2Pc] ??= [];
      setEffects[english.effect2Pc].push(key);
    }

    for (const [language, locale] of Object.entries(utils.lngToRegion)) {
      const localized = genshindb.artifacts(name, { resultLanguage: language });
      if (!localized) {
        throw new Error(`${name} is missing the ${language} translation`);
      }
      translations[locale] ??= {};
      translations[locale][key] = localized.name;
    }

    const images = english.images ?? {};
    const availablePositions = positions.filter(
      (position) => images[`filename_${position}`]
    );
    if (![1, positions.length].includes(availablePositions.length)) {
      throw new Error(
        `${name} has an incomplete artifact image manifest (${availablePositions.length}/${positions.length})`
      );
    }
    for (const position of availablePositions) {
      const filename = images[`filename_${position}`];
      const imagePath = `src/assets/artifacts/${key}_${position}.png`;
      if (utils.isValidImage(imagePath)) continue;
      await utils.downloadFirstAvailable(
        [
          utils.yattaImageUrl(filename, "artifact"),
          utils.enkaImageUrl(filename),
          images[`mihoyo_${position}`],
        ],
        imagePath,
        `${name} ${position}`
      );
    }
  }

  protoLines.push("}", "");
  fs.writeFileSync("proto/set.proto", protoLines.join("\n"), "utf8");
  for (const [locale, values] of Object.entries(translations)) {
    fs.writeFileSync(
      `public/locales/${locale}/sets.json`,
      JSON.stringify(values),
      "utf8"
    );
  }
  fs.writeFileSync("src/data/sets.json", JSON.stringify(setsData), "utf8");
  fs.writeFileSync(
    "src/data/set2pcEffect.json",
    JSON.stringify(setEffects),
    "utf8"
  );
};

export { portSets };
