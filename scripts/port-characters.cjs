const genshindb = require("genshin-db");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const utils = require("./utils.cjs");

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
];

const portCharacters = () => {
  let en_trans = {};
  let zh_trans = {};
  let idx = 0;

  let proto_file = fs.createWriteStream("./proto/character.proto", {
    flags: "w",
  });
  proto_file.write('syntax = "proto3";\n\n');
  proto_file.write("package io.leishi.genshin.proto;\n\n");
  proto_file.write("enum Character {\n");
  proto_file.write(`    CHARACTER_UNSPECIFIED = ${idx++};\n`);

  names.forEach((e) => {
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

    const cn = e.startsWith("traveler")
      ? genshindb.talents(e, { resultLanguage: "CHS" })
      : genshindb.characters(e, { resultLanguage: "CHS" });

    en_trans[key] = eng.name;
    zh_trans[key] = cn.name;
    for (let imageType of ["cover1", "cover2", "icon", "portrait"]) {
      if (eng.images[imageType]) {
        const imagePath = `./src/assets/characters/${key}_${imageType}.${eng.images[
          imageType
        ].slice(-3)}`;
        if (!fs.existsSync(imagePath)) {
          utils.download_image(eng.images[imageType], imagePath);
        }
      }
    }
  });
  proto_file.write("}\n");

  fs.writeFileSync(
    "./public/locales/en/characters.json",
    JSON.stringify(en_trans),
    "utf-8"
  );

  fs.writeFileSync(
    "./public/locales/zh/characters.json",
    JSON.stringify(zh_trans),
    "utf-8"
  );
  fs.writeFileSync(
    "./src/data/characters.json",
    JSON.stringify(zh_trans),
    "utf-8"
  );
};

exports.portCharacters = portCharacters;
