import genshindb from "genshin-db";
import fs from "fs";
import * as utils from "./utils.mjs";

const names = [
  "traveleranemo",
  "travelergeo",
  "travelerelectro",
  "travelerdendro",
  "aether",
  "lumine",
  "albedo",
  "aloy",
  "amber",
  "barbara",
  "beidou",
  "bennett",
  "chongyun",
  "diluc",
  "diona",
  "eula",
  "fischl",
  "ganyu",
  "hutao",
  "jean",
  "kazuha",
  "kaeya",
  "ayaka",
  "keqing",
  "klee",
  "sara",
  "lisa",
  "mona",
  "ningguang",
  "noelle",
  "qiqi",
  "raiden",
  "razor",
  "rosaria",
  "kokomi",
  "sayu",
  "sucrose",
  "tartaglia",
  "thoma",
  "venti",
  "xiangling",
  "xiao",
  "xingqiu",
  "xinyan",
  "yanfei",
  "yoimiya",
  "zhongli",
  "gorou",
  "itto",
  "shenhe",
  "yunjin",
  "yaemiko",
  "ayato",
  "yelan",
  "kuki",
  "heizou",
  "collei",
  "dori",
  "tighnari",
  "candace",
  "cyno",
  "nilou",
  "nahida",
  "layla",
  "faruzan",
  "wanderer",
  "alhaitham",
  "yaoyao",
  "dehya",
  "mika",
  "baizhu",
  "kaveh",
  "kirara",
  "travelerhydro",
  "lyney",
  "lynette",
  "freminet",
  "neuvillette",
  "wriothesley",
  "furina",
  "charlotte",
  "navia",
  "chevreuse"
];

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
    proto_file.write(`    ${key.toUpperCase()} = ${idx++};\n`);

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
      element: key.startsWith('traveler') ? key.split('_')[1] : eng.element !== 'None' ? eng.element : '',
      weapontype: key.startsWith('traveler') ? 'Sword' : eng.weapontype,
      rarity: key.startsWith('traveler') ? 5 : eng.rarity,
    }
        if (e === 'chevreuse') {
          console.log('k');
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
