import fs from "node:fs";

import * as utils from "./utils.mjs";
import { artifactSetKey } from "./game-data/keys.mjs";

const positions = ["flower", "plume", "sands", "goblet", "circlet"];

const portSets = async (catalog) => {
  const recordsByKey = new Map(
    catalog.artifactSets.map((record) => [record.key, record])
  );
  const remoteNames = catalog.artifactSets.map(({ name }) => name);
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
    const english = recordsByKey.get(artifactSetKey(name));
    if (!english)
      throw new Error(`Artifact set ${name} was not found in the catalog`);

    const key = artifactSetKey(english.name);
    protoLines.push(`    ${key.toUpperCase()} = ${index++};`);
    translations.en[key] = english.name;
    setsData[key] = {
      "2pc": english.effects.twoPiece,
      "4pc": english.effects.fourPiece,
    };
    if (english.effects.twoPiece) {
      setEffects[english.effects.twoPiece] ??= [];
      setEffects[english.effects.twoPiece].push(key);
    }

    for (const locale of Object.values(utils.lngToRegion)) {
      const localized = english.translations[locale];
      if (!localized)
        throw new Error(`${name} is missing the ${locale} translation`);
      translations[locale] ??= {};
      translations[locale][key] = localized;
    }

    const images = english.images ?? {};
    const availablePositions = positions.filter((position) => images[position]);
    if (![1, positions.length].includes(availablePositions.length)) {
      throw new Error(
        `${name} has an incomplete artifact image manifest (${availablePositions.length}/${positions.length})`
      );
    }
    for (const position of availablePositions) {
      const filename = images[position];
      const imagePath = `src/assets/artifacts/${key}_${position}.png`;
      if (utils.isValidImage(imagePath)) continue;
      await utils.downloadFirstAvailable(
        [
          utils.yattaImageUrl(filename, "artifact"),
          utils.enkaImageUrl(filename),
          ...(english.imageUrls?.[position] ?? []),
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
