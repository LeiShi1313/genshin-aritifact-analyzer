const genshindb = require("genshin-db");
const fs = require("fs");

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
];

const portWeapons = () => {
  let en_trans = {};
  let zh_trans = {};

  let idx = 0;
  let proto_file = fs.createWriteStream('./proto/weapon.proto', {flags: 'w'});
  proto_file.write('syntax = "proto3";\n\n');
  proto_file.write('package io.leishi.genshin.proto;\n\n');
  proto_file.write('enum Weapon {\n');
  proto_file.write(`    WEAPON_UNSPECIFIED = ${idx++};\n`);
  names.forEach((e) => {
    const eng = genshindb.weapons(e);
    if (!eng) {
      console.warn(`No weapon found for ${e}!`);
      return
    }

    let weapon = eng.name.replace(/['"]/gi, "").replace(/[^0-9a-z]/gi, "_").toLowerCase();
    proto_file.write(`    ${weapon.toUpperCase()} = ${idx++};\n`);

    const cn = genshindb.weapons(e, { resultLanguage: "CHS" });
    en_trans[weapon] = eng.name;
    zh_trans[weapon] = cn.name;
  });
  proto_file.write('}\n');

  fs.writeFileSync(
    "./public/locales/en/weapons.json",
    JSON.stringify(en_trans),
    "utf-8"
  );
  fs.writeFileSync(
    "./public/locales/zh/weapons.json",
    JSON.stringify(zh_trans),
    "utf-8"
  );
}

exports.portWeapons = portWeapons;