import genshindb from "genshin-db";
import fs from "fs";
import * as utils from "./utils.mjs";


const names = [
  "traveleranemo",
  "travelergeo",
  "travelerelectro",
  "travelerdendro",
  "travelerhydro",
  ...genshindb.characters("name", { matchCategories: true })
];

const portCharacters = async () => {
  let trans = {
    en: {},
  };
  let data = {};


  let proto_file = fs.createWriteStream("./proto/character.proto", {
    flags: "w",
  });
  proto_file.write('syntax = "proto3";\n\n');
  proto_file.write("package io.leishi.genshin.proto;\n\n");
  proto_file.write("enum Character {\n");
  proto_file.write(`    CHARACTER_UNSPECIFIED = 0;\n`);

  names.forEach(async (e) => {
    const eng = e.startsWith("traveler")
      ? genshindb.talents(e)
      : genshindb.characters(e);
    if (!eng) {
      console.warn(`Character ${e} not found`);
      return;
    }
    let key = eng.name
      .replace(/[\(\)]/gi, "")
      .replace(/[^0-9a-z]/gi, "_")
      .toLowerCase();
    proto_file.write(`    ${key.toUpperCase()} = ${eng.id};\n`);

    trans['en'][key] = eng.name;
    for (let lng of Object.keys(utils.lngToRegion)) {
      const data = e.startsWith("traveler")
        ? genshindb.talents(e, { resultLanguage: lng })
        : genshindb.characters(e, { resultLanguage: lng });
      if (!!!trans[utils.lngToRegion[lng]]) {
        trans[utils.lngToRegion[lng]] = {}
      }
      trans[utils.lngToRegion[lng]][key] = data.name;
    }
    data[key] = {
      zh_name: trans['zh'][key],
      element: key.startsWith('traveler') ? key.split('_')[1] : eng.elementText !== 'None' ? eng.elementText : '',
      weapontype: key.startsWith('traveler') ? 'Sword' : eng.weaponText,
      rarity: key.startsWith('traveler') ? 5 : eng.rarity,
    }

    console.log(eng.images)
    if(eng.images["mihoyo_icon"]){
      eng.images["icon"] = eng.images["mihoyo_icon"]
    }
    for (let imageType of ["cover1", "cover2", "icon", "portrait"]) {
      if (eng.images[imageType]) {
        const imagePath = `./src/assets/characters/${key}_${imageType}.${eng.images[
          imageType
        ].slice(-3)}`;
        if (!fs.existsSync(imagePath) || fs.statSync(imagePath).size === 0) {
          try {
            console.log(`Downloading image for ${e}: ${eng.images[imageType]}`);
            await utils.download_image(eng.images[imageType], imagePath)
          } catch (e) { 
            try {
              await utils.download_from_amber(
                eng.images[imageType].substring(eng.images[imageType].lastIndexOf("/") + 1),
                "character",
                imagePath
              );
            } catch (e) {
              console.error(e)
            }
          }
        }
      }
    }
  });
  proto_file.write("}\n");

  for (let lng of Object.keys(trans)) {
    fs.writeFileSync(
      `./public/locales/${lng}/characters.json`,
      JSON.stringify(trans[lng]),
      "utf-8"
    );
  }
  fs.writeFileSync(
    "./src/data/characters.json",
    JSON.stringify(data),
    "utf-8"
  );
};

export {portCharacters};
