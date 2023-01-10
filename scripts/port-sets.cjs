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
  let en_trans = {};
  let zh_trans = {};
  // let jp_trans = {};
  // let kr_trans = {};
  // let es_trans = {};

  let idx = 0;
  let proto_file = fs.createWriteStream('./proto/set.proto', {flags: 'w'});
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

    let art = eng.name.replace(/'/gi, "").replace(/[^0-9a-z]/gi, "_").toLowerCase();
    proto_file.write(`    ${art.toUpperCase()} = ${idx++};\n`);

    const cn = genshindb.artifacts(e, { resultLanguage: "CHS" });
    // const jp = genshindb.artifacts(e, { resultLanguage: "Japanese" })
    en_trans[art] = eng.name;
    zh_trans[art] = cn.name;
    // jp_trans[art] = jp.name;

    for (let pos of positions) {
      if (eng.images[pos]) {
        const imagePath = `./src/assets/artifacts/${art}_${pos}.${eng.images[
          pos
        ].slice(-3)}`;
        if (!fs.existsSync(imagePath)) {
          utils.download_image(eng.images[pos], imagePath);
        }
      }
    }
  });
  proto_file.write('}\n');

  fs.writeFileSync(
    "./public/locales/en/sets.json",
    JSON.stringify(en_trans),
    "utf-8"
  );
  fs.writeFileSync(
    "./public/locales/zh/sets.json",
    JSON.stringify(zh_trans),
    "utf-8"
  );
}

exports.portSets = portSets;