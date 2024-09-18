import genshindb from "genshin-db";
import fs from "fs";
import * as utils from "./utils.mjs";

await utils.update_character_data('scripts/characters');
const names = utils.readNamesFromFile('scripts/characters');

const isTraveler = (name) => {
  return name.startsWith('Traveler') || name === 'Lumine' || name === 'Aether';
};

const portCharacters = async () => {
  let trans = {
    en: {},
  };
  let data = {};
  let idx = 0;

  let proto_file = fs.createWriteStream("./proto/character.proto", {
    flags: "w",
  });
  proto_file.write('syntax = "proto3";\n\n');
  proto_file.write("package io.leishi.genshin.proto;\n\n");
  proto_file.write("enum Character {\n");
  proto_file.write(`    CHARACTER_UNSPECIFIED = ${idx++};\n`);

  names.forEach(async (e) => {
    const eng = e.startsWith("Traveler")
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
    proto_file.write(`    ${key.toUpperCase()} = ${idx++};\n`);

    trans['en'][key] = eng.name;
    for (let lng of Object.keys(utils.lngToRegion)) {
      const data = e.startsWith("Traveler")
        ? genshindb.talents(e, { resultLanguage: lng })
        : genshindb.characters(e, { resultLanguage: lng });
      if (!!!trans[utils.lngToRegion[lng]]) {
        trans[utils.lngToRegion[lng]] = {}
      }
      trans[utils.lngToRegion[lng]][key] = data.name;
    }
    data[key] = {
      zh_name: trans['zh'][key],
      element: key.startsWith('Traveler') ? key.split(' ')[1] : eng.elementText !== 'None' ? eng.elementText : '',
      weapontype: key.startsWith('Traveler') ? 'Sword' : eng.weaponText,
      rarity: key.startsWith('Traveler') ? 5 : eng.rarity,
    }

    for (let imageType of ["cover1", "cover2", "icon"]) {
      const imagePath = `./src/assets/characters/${key}_${imageType}.png`;
      if (fs.existsSync(imagePath) && fs.statSync(imagePath).size > 0) continue;
      if (eng.images[imageType]) {

        try {
          console.log(`Downloading image for ${e}: ${eng.images[imageType]}`);
          await utils.download_image(eng.images[imageType], imagePath)
        } catch (err) {
          try {
            await utils.download_from_amber(
              eng.images[imageType].substring(eng.images[imageType].lastIndexOf("/") + 1),
              "character",
              imagePath
            );
          } catch (err) {
            console.error(err)
          }
        }
      } else if (imageType === 'icon' && eng.images['mihoyo_icon']) {
        try {
          console.log(`Downloading image for ${e}: ${eng.images['mihoyo_icon']}`);
          await utils.download_image(eng.images['mihoyo_icon'], imagePath)
        } catch (err) {
          if (eng.images['filename_icon']) {
            try {
              await utils.download_from_amber(
                eng.images['filename_icon'],
                "character",
                imagePath
              );
            } catch (err) {
              console.error(err)
            }
          }
        }
      } else if (!isTraveler(e)) {
        console.warn(`No ${imageType} image found for character ${e}`);
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

export { portCharacters };
