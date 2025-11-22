import genshindb from "genshin-db";
import fs from "fs";
import * as utils from "./utils.mjs";

await utils.update_weapon_data('scripts/weapon');
const names = utils.readNamesFromFile('scripts/weapon');

const portWeapons = async () => {
  let trans = {
    en: {},
  };
  let data = {};

  let idx = 0;
  let proto_file = fs.createWriteStream("./proto/weapon.proto", { flags: "w" });
  proto_file.write('syntax = "proto3";\n\n');
  proto_file.write("package io.leishi.genshin.proto;\n\n");
  proto_file.write("enum WeaponType {\n");
  proto_file.write(`    WEAPON_TYPE_UNSPECIFIED = 0;\n`);
  proto_file.write(`    BOW = 1;\n`);
  proto_file.write(`    CLAYMORE = 2;\n`);
  proto_file.write(`    CATALYST = 3;\n`);
  proto_file.write(`    POLEARM = 4;\n`);
  proto_file.write(`    SWORD = 5;\n`);
  proto_file.write("}\n\n");
  proto_file.write("enum Weapon {\n");
  proto_file.write(`    WEAPON_UNSPECIFIED = ${idx++};\n`);
  names.forEach(async (e) => {
    const eng = genshindb.weapons(e);
    if (!eng) {
      console.warn(`No weapon found for ${e}!`);
      return;
    }

    let key = eng.name
      .replace(/['"]/gi, "")
      .replace(/[^0-9a-z]/gi, "_")
      .toLowerCase();
    proto_file.write(`    ${key.toUpperCase()} = ${idx++};\n`);

    data[key] = {
      weapontype: eng.weaponText,
      rarity: eng.rarity,
    };
    trans["en"][key] = eng.name;
    for (let lng of Object.keys(utils.lngToRegion)) {
      const data = genshindb.weapons(e, { resultLanguage: lng });
      if (!!!trans[utils.lngToRegion[lng]]) {
        trans[utils.lngToRegion[lng]] = {};
      }
      trans[utils.lngToRegion[lng]][key] = data.name;
      if (data.images.filename_icon) {
        const imagePath = `./src/assets/weapons/${key}.png`;
        if (!utils.isValidImage(imagePath)) {
          let result = await utils.download_from_yuheng(
            data.images.filename_icon,
            "weapon",
            imagePath
          );
          if (!result) console.error(`Failed to download image for weapon ${e}`);
        }
      }
      if (data.images.filename_awakenIcon) {
        const imagePath = `./src/assets/weapons/${key}_awaken.png`;
        if (!utils.isValidImage(imagePath)) {
          let result = await utils.download_from_yuheng(
            data.images.filename_awakenIcon,
            "weapon",
            imagePath
          );
          if (!result) console.error(`Failed to download awaken image for weapon ${e}`);
        }
      }
    }
  });
  proto_file.write("}\n");

  for (let lng of Object.keys(trans)) {
    fs.writeFileSync(
      `./public/locales/${lng}/weapons.json`,
      JSON.stringify(trans[lng]),
      "utf-8"
    );
  }

  fs.writeFileSync("./src/data/weapons.json", JSON.stringify(data), "utf-8");
};

export{portWeapons};
