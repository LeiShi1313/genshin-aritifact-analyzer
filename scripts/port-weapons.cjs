const genshindb = require("genshin-db");
const fs = require("fs");
const utils = require("./utils.cjs");

const names = [
  "Akuoumaru",
  "Alley Hunter",
  "Amenoma Kageuchi",
  "Amos' Bow",
  "Apprentice's Notes",
  "Aqua Simulacra",
  "Aquila Favonia",
  "A Thousand Floating Dreams",
  "Beginner's Protector",
  "Blackcliff Agate",
  "Blackcliff Longsword",
  "Blackcliff Pole",
  "Blackcliff Slasher",
  "Blackcliff Warbow",
  "Black Tassel",
  "Bloodtainted Greatsword",
  "Calamity Queller",
  "Cinnabar Spindle",
  "Compound Bow",
  "Cool Steel",
  "Crescent Pike",
  "Dark Iron Sword",
  "Deathmatch",
  "Debate Club",
  "Dodoco Tales",
  "Dragon's Bane",
  "Dragonspine Spear",
  "Dull Blade",
  "Elegy for the End",
  "Emerald Orb",
  "End of the Line",
  "Engulfing Lightning",
  "Everlasting Moonglow",
  "Eye of Perception",
  "Fading Twilight",
  "Favonius Codex",
  "Favonius Greatsword",
  "Favonius Lance",
  "Favonius Sword",
  "Favonius Warbow",
  "Ferrous Shadow",
  "Festering Desire",
  "Fillet Blade",
  "Forest Regalia",
  "Freedom-Sworn",
  "Frostbearer",
  "Fruit of Fulfillment",
  "Hakushin Ring",
  "Halberd",
  "Hamayumi",
  "Haran Geppaku Futsu",
  "Harbinger of Dawn",
  "Hunter's Bow",
  "Hunter's Path",
  "Iron Point",
  "Iron Sting",
  "Kagotsurube Isshin",
  "Kagura's Verity",
  "Katsuragikiri Nagamasa",
  "Key of Khaj-Nisut",
  "King's Squire",
  "Kitain Cross Spear",
  "Lion's Roar",
  "Lithic Blade",
  "Lithic Spear",
  "Lost Prayer to the Sacred Winds",
  "Luxurious Sea-Lord",
  "Magic Guide",
  "Makhaira Aquamarine",
  "Mappa Mare",
  "Memory of Dust",
  "Messenger",
  "Missive Windspear",
  "Mistsplitter Reforged",
  "Mitternachts Waltz",
  "Moonpiercer",
  "Mouun's Moon",
  "Oathsworn Eye",
  "Old Merc's Pal",
  "Otherworldly Story",
  "Pocket Grimoire",
  "Polar Star",
  "Predator",
  "Primordial Jade Cutter",
  "Primordial Jade Winged-Spear",
  "Prized Isshin Blade",
  "Prototype Amber",
  "Prototype Archaic",
  "Prototype Crescent",
  "Prototype Rancour",
  "Prototype Starglitter",
  "Rainslasher",
  "Raven Bow",
  "Recurve Bow",
  "Redhorn Stonethresher",
  "Royal Bow",
  "Royal Greatsword",
  "Royal Grimoire",
  "Royal Longsword",
  "Royal Spear",
  "Rust",
  "Sacrificial Bow",
  "Sacrificial Fragments",
  "Sacrificial Greatsword",
  "Sacrificial Sword",
  "Sapwood Blade",
  "Seasoned Hunter's Bow",
  "Serpent Spine",
  "Sharpshooter's Oath",
  "Silver Sword",
  "Skyrider Greatsword",
  "Skyrider Sword",
  "Skyward Atlas",
  "Skyward Blade",
  "Skyward Harp",
  "Skyward Pride",
  "Skyward Spine",
  "Slingshot",
  "Snow-Tombed Starsilver",
  "Solar Pearl",
  "Song of Broken Pines",
  "Staff of Homa",
  "Staff of the Scarlet Sands",
  "Summit Shaper",
  "Sword of Descension",
  "The Alley Flash",
  "The Bell",
  "The Black Sword",
  "The Catch",
  "The Flute",
  "The Stringless",
  "The Unforged",
  "The Viridescent Hunt",
  "The Widsith",
  "Thrilling Tales of Dragon Slayers",
  "Thundering Pulse",
  "Toukabou Shigure",
  "Traveler's Handy Sword",
  "Tulaytullah's Remembrance",
  "Twin Nephrite",
  "Vortex Vanquisher",
  "Wandering Evenstar",
  "Waster Greatsword",
  "Wavebreaker's Fin",
  "Whiteblind",
  "White Iron Greatsword",
  "White Tassel",
  "Windblume Ode",
  "Wine and Song",
  "Wolf's Gravestone",
  "Xiphos' Moonlight",
  "Light of Foliar Incision",
  "Beacon of the Reed Sea",
  "Mailed Flower",
];

const portWeapons = () => {
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
  names.forEach((e) => {
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
      weapontype: eng.weapontype,
      rarity: eng.rarity,
    };
    trans["en"][key] = eng.name;
    for (let lng of Object.keys(utils.lngToRegion)) {
      const data = genshindb.weapons(e, { resultLanguage: lng });
      if (!!!trans[utils.lngToRegion[lng]]) {
        trans[utils.lngToRegion[lng]] = {};
      }
      trans[utils.lngToRegion[lng]][key] = data.name;
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

exports.portWeapons = portWeapons;
