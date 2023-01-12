const genshindb = require("genshin-db");
const fs = require("fs");
const utils = require("./utils.cjs");

const names = [
  "Archaic Petra",
  "Berserker",
  "Blizzard Strayer",
  "Bloodstained Chivalry",
  "Brave Heart",
  "Crimson Witch of Flames",
  "Deepwood Memories",
  "Defender's Will",
  "Desert Pavilion Chronicle",
  "Echoes of an Offering",
  "Emblem of Severed Fate",
  "Flower of Paradise Lost",
  "Gambler",
  "Gilded Dreams",
  "Gladiator's Finale",
  "Heart of Depth",
  "Husk of Opulent Dreams",
  "Instructor",
  "Lavawalker",
  "Maiden Beloved",
  "Martial Artist",
  "Noblesse Oblige",
  "Ocean-Hued Clam",
  "Pale Flame",
  "Prayers for Destiny",
  "Prayers for Illumination",
  "Prayers for Wisdom",
  "Prayers to Springtime",
  "Resolution of Sojourner",
  "Retracing Bolide",
  "Scholar",
  "Shimenawa's Reminiscence",
  "Tenacity of the Millelith",
  "The Exile",
  "Thundering Fury",
  "Thundersoother",
  "Tiny Miracle",
  "Vermillion Hereafter",
  "Viridescent Venerer",
  "Wanderer's Troupe",
];
const positions = ['flower', 'plume', 'sands', 'goblet', 'circlet'];

const portSets = () => {
  let trans = {
    en: {},
  };

  let idx = 0;
  let proto_file = fs.createWriteStream('./proto/set.proto', { flags: 'w' });
  proto_file.write('syntax = "proto3";\n\n');
  proto_file.write('package io.leishi.genshin.proto;\n\n');
  proto_file.write('enum Set {\n');
  proto_file.write(`    SET_UNSPECIFIED = ${idx++};\n`);
  names.forEach((e) => {
    const eng = genshindb.artifacts(e);
    if (!eng) {
      console.warn(`No set found for ${e}!`);
      return
    }

    let key = eng.name.replace(/'/gi, "").replace(/[^0-9a-z]/gi, "_").toLowerCase();
    proto_file.write(`    ${key.toUpperCase()} = ${idx++};\n`);

    trans['en'][key] = eng.name;
    for (let lng of Object.keys(utils.lngToRegion)) {
      const data = genshindb.artifacts(e, { resultLanguage: lng });
      if (!!!trans[utils.lngToRegion[lng]]) {
        trans[utils.lngToRegion[lng]] = {}
      }
      trans[utils.lngToRegion[lng]][key] = data.name;
    }

    for (let pos of positions) {
      if (eng.images[pos]) {
        const imagePath = `./src/assets/artifacts/${key}_${pos}.${eng.images[
          pos
        ].slice(-3)}`;
        if (!fs.existsSync(imagePath)) {
          utils.download_image(eng.images[pos], imagePath);
        }
      }
    }
  });
  proto_file.write('}\n');

  for (let lng of Object.keys(trans)) {
    fs.writeFileSync(
      `./public/locales/${lng}/sets.json`,
      JSON.stringify(trans[lng]),
      "utf-8"
    );
  }
}

exports.portSets = portSets;