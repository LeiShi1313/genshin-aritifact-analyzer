import genshindb from "genshin-db";
import fs from "fs";
import stream from "stream";
import util from 'util';
import * as utils from "./utils.mjs";

const finished = util.promisify(stream.finished);

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
  "Nymph's Dream",
  "Vourukasha's Glow",
  "Golden Troupe",
  "Marechaussee Hunter",
];
const positions = ["flower", "plume", "sands", "goblet", "circlet"];

const portSets = async () => {
  let trans = {
    en: {},
  };
  let setsData = {};
  let setEff = {};

  let idx = 0;
  let proto_file = fs.createWriteStream("./proto/set.proto", { flags: "w" });
  proto_file.write('syntax = "proto3";\n\n');
  proto_file.write("package io.leishi.genshin.proto;\n\n");
  proto_file.write("enum Set {\n");
  proto_file.write(`    SET_UNSPECIFIED = ${idx++};\n`);

  // Debugging console.log
  console.log("Start processing names...");

  await Promise.all(names.map(async (e) => {
    const eng = genshindb.artifacts(e);
    if (!eng) {
      console.warn(`No set found for ${e}!`);
      return;
    }

    let key = eng.name
      .replace(/'/gi, "")
      .replace(/[^0-9a-z]/gi, "_")
      .toLowerCase();
    proto_file.write(`    ${key.toUpperCase()} = ${idx++};\n`);

    trans["en"][key] = eng.name;
    setsData[key] = {
      "2pc": eng["2pc"],
      "4pc": eng["4pc"],
    };
    if (eng["2pc"]) {
      if (setEff[eng["2pc"]] === undefined) {
        setEff[eng["2pc"]] = [];
      }
      setEff[eng["2pc"]].push(key);
    }
    for (let lng of Object.keys(utils.lngToRegion)) {
      const data = genshindb.artifacts(e, { resultLanguage: lng });
      if (!!!trans[utils.lngToRegion[lng]]) {
        trans[utils.lngToRegion[lng]] = {};
      }
      trans[utils.lngToRegion[lng]][key] = data.name;
    }

    await Promise.all(positions.map(async (pos) => {
      if (eng.images[pos]) {
        const imagePath = `./src/assets/artifacts/${key}_${pos}.${eng.images[
          pos
        ].slice(-3)}`;
        if (!fs.existsSync(imagePath) || fs.statSync(imagePath).size === 0) {
          try {
            console.log(`Downloading image for ${e} ${pos}`);
            await utils.download_image(eng.images[pos], imagePath);
          } catch (e) {
            try {
              await utils.download_from_amber(
                eng.images[pos].substring(eng.images[pos].lastIndexOf("/") + 1),
                "artifact",
                imagePath
              );
            } catch (e) {
              console.error(e)
            }
          }
        }
      }

    }));
  }));
  proto_file.write("}\n");
  proto_file.end();
  await finished(proto_file);

  // Debugging console.log
  console.log("Writing locales files...");

  for (let lng of Object.keys(trans)) {
    fs.writeFileSync(
      `./public/locales/${lng}/sets.json`,
      JSON.stringify(trans[lng]),
      "utf-8"
    );
  }

  // Debugging console.log
  console.log("Writing sets data file...");

  fs.writeFileSync("./src/data/sets.json", JSON.stringify(setsData), "utf-8");

  // Debugging console.log
  console.log("Writing set2pcEffect file...");

  fs.writeFileSync(
    "./src/data/set2pcEffect.json",
    JSON.stringify(setEff),
    "utf-8"
  );
};
portSets();
export {portSets};