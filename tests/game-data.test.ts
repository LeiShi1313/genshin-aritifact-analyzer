import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readSync,
  closeSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import sharp from "sharp";

import { createGameDataCatalog } from "../scripts/game-data/catalog.mjs";
import {
  downloadImage,
  nanokaImageUrl,
  syncNamesFile,
} from "../scripts/utils.mjs";

const locales = ["de", "en", "es", "fr", "ja", "ko", "zh", "zh-Hant"];

const characters = [
  ["durin", "杜林", "Pyro", "Sword", 5, 116],
  ["jahoda", "雅珂达", "Anemo", "Bow", 4, 117],
  ["columbina", "哥伦比娅", "Hydro", "Catalyst", 5, 118],
  ["zibai", "兹白", "Geo", "Sword", 5, 119],
  ["illuga", "叶洛亚", "Geo", "Polearm", 4, 120],
  ["varka", "法尔伽", "Anemo", "Claymore", 5, 121],
  ["lohen", "洛恩", "Cryo", "Polearm", 5, 122],
  ["linnea", "莉奈娅", "Geo", "Bow", 5, 123],
  ["nicole", "尼可", "Pyro", "Catalyst", 5, 124],
  ["prune", "布伦妮", "Anemo", "Catalyst", 4, 125],
  ["sandrone", "桑多涅", "Cryo", "Claymore", 5, 126],
  ["traveler_cryo", "旅行者 (冰元素)", "Cryo", "Sword", 5, 127],
  ["alyosha", "阿罗夏", "Electro", "Polearm", 4, 128],
  ["odette", "奥黛塔", "Cryo", "Sword", 5, 129],
] as const;

const weapons = [
  ["athame_artis", "黑蚀", "Sword", 5, 226],
  ["lightbearing_moonshard", "朏魄含光", "Sword", 5, 227],
  ["gest_of_the_mighty_wolf", "狼的武功歌", "Claymore", 5, 228],
  ["nocturnes_curtain_call", "帷间夜曲", "Catalyst", 5, 229],
  ["rainbow_serpents_rain_bow", "虹蛇的雨弦", "Bow", 4, 230],
  ["the_daybreak_chronicles", "黎明破晓之史", "Bow", 5, 231],
  ["disaster_and_remorse", "灾悔", "Polearm", 5, 232],
  ["angelos_heptades", "尘光七谕", "Catalyst", 5, 233],
  ["golden_frostbound_oath", "霜结的誓金枝", "Bow", 5, 234],
  ["a_teaspoon_of_transcendence", "超越之匙", "Claymore", 5, 235],
  ["blade_of_atonement", "救赎之斩", "Claymore", 4, 236],
  ["clash_of_kings", "群王局戏", "Catalyst", 4, 237],
  ["covenant_of_frost_and_snow", "霜雪誓约", "Bow", 4, 238],
  ["echoes_of_the_heart", "寸心余响", "Catalyst", 4, 239],
  ["emberwell", "引火之源", "Sword", 4, 240],
  ["exaiphanes_blade", "星锋剑", "Sword", 5, 241],
  ["forged_by_the_golden_melody", "金律铸影", "Claymore", 4, 242],
  ["frostbreath", "寒息", "Polearm", 4, 243],
  ["heretics_molten_blade", "熔猎异端之刃", "Sword", 4, 244],
  ["jade_vista", "悬黎千钧", "Bow", 4, 245],
  ["song_of_the_vigil", "戍望谣歌", "Polearm", 4, 246],
  ["whitelake_frostfeather", "白湖冬羽", "Sword", 5, 247],
] as const;

const artifactSets = [
  "aubade_of_morningstar_and_moon",
  "a_day_carved_from_rising_winds",
  "celestial_gift",
  "disenchantment_in_deep_shadow",
  "heart_of_the_furnace",
  "scarlet_proof",
] as const;

const artifactPositions = ["flower", "plume", "sands", "goblet", "circlet"];

const readJson = <T>(path: string) =>
  JSON.parse(readFileSync(path, "utf8")) as T;

const isImage = (path: string) => {
  if (!existsSync(path)) return false;
  const descriptor = openSync(path, "r");
  const header = Buffer.alloc(12);
  readSync(descriptor, header, 0, header.length, 0);
  closeSync(descriptor);

  return (
    header
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
    (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) ||
    (header.subarray(0, 4).toString("ascii") === "RIFF" &&
      header.subarray(8, 12).toString("ascii") === "WEBP")
  );
};

test("name sync appends each remote entry at most once", () => {
  const directory = mkdtempSync(join(tmpdir(), "genshin-name-sync-"));
  const path = join(directory, "names");

  try {
    writeFileSync(path, "Existing\n", "utf8");
    const names = syncNamesFile(path, [
      "Existing",
      "New",
      "New",
      "Other",
      "New",
    ]);

    assert.deepEqual(names, ["Existing", "New", "Other"]);
    assert.equal(readFileSync(path, "utf8"), "Existing\nNew\nOther\n");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("Nanoka image URLs use the WebP asset endpoint", () => {
  assert.equal(
    nanokaImageUrl("UI_AvatarIcon_Ayaka"),
    "https://static.nanoka.cc/assets/gi/UI_AvatarIcon_Ayaka.webp"
  );
  assert.equal(
    nanokaImageUrl("UI_AvatarIcon_Ayaka.png"),
    "https://static.nanoka.cc/assets/gi/UI_AvatarIcon_Ayaka.webp"
  );
});

test("image downloads convert WebP responses to real PNG files", async () => {
  const directory = mkdtempSync(join(tmpdir(), "genshin-image-fallback-"));
  const imagePath = join(directory, "fallback.png");
  const webp = await sharp({
    create: {
      width: 1,
      height: 1,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 },
    },
  })
    .webp()
    .toBuffer();
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "image/webp" });
    response.end(webp);
  });

  try {
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    assert.ok(address && typeof address === "object");
    assert.equal(
      await downloadImage(
        `http://127.0.0.1:${address.port}/fallback.webp`,
        imagePath
      ),
      true
    );
    assert.equal(
      readFileSync(imagePath)
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
      true
    );
  } finally {
    if (server.listening) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    rmSync(directory, { recursive: true, force: true });
  }
});

test("the complete 6.2-7.0 roster has usable metadata, translations, and UI assets", () => {
  const characterData = readJson<Record<string, unknown>>(
    "src/data/characters.json"
  );
  const weaponData = readJson<Record<string, unknown>>("src/data/weapons.json");
  const setData = readJson<Record<string, unknown>>("src/data/sets.json");
  const characterProto = readFileSync("proto/character.proto", "utf8");
  const weaponProto = readFileSync("proto/weapon.proto", "utf8");
  const gameData = createGameDataCatalog();
  const catalogCharacters = new Map(
    gameData.characters.map((record: any) => [record.key, record])
  );
  const catalogWeapons = new Map(
    gameData.weapons.map((record: any) => [record.key, record])
  );
  const catalogSets = new Map(
    gameData.artifactSets.map((record: any) => [record.key, record])
  );
  const translations = Object.fromEntries(
    locales.map((locale) => [
      locale,
      {
        characters: readJson<Record<string, string>>(
          `public/locales/${locale}/characters.json`
        ),
        weapons: readJson<Record<string, string>>(
          `public/locales/${locale}/weapons.json`
        ),
        sets: readJson<Record<string, string>>(
          `public/locales/${locale}/sets.json`
        ),
      },
    ])
  );

  for (const [
    key,
    zhName,
    element,
    weapontype,
    rarity,
    enumValue,
  ] of characters) {
    assert.deepEqual(
      characterData[key],
      { zh_name: zhName, element, weapontype, rarity },
      key
    );
    assert.match(
      characterProto,
      new RegExp(`\\b${key.toUpperCase()}\\s*=\\s*${enumValue};`),
      `${key} enum`
    );
    assert.equal(
      isImage(`src/assets/characters/${key}_icon.png`),
      true,
      `${key} icon`
    );
    if (key !== "traveler_cryo") {
      assert.equal(
        isImage(`src/assets/characters/${key}_gacha.png`),
        true,
        `${key} gacha`
      );
    }
    const catalogRecord = catalogCharacters.get(key);
    assert.ok(catalogRecord, `${key} catalog record`);
    for (const locale of locales) {
      assert.equal(
        translations[locale].characters[key],
        catalogRecord.translations[locale],
        `${locale} ${key}`
      );
    }
  }

  for (const [key, zhName, weapontype, rarity, enumValue] of weapons) {
    assert.deepEqual(weaponData[key], { weapontype, rarity }, key);
    assert.match(
      weaponProto,
      new RegExp(`\\b${key.toUpperCase()}\\s*=\\s*${enumValue};`),
      `${key} enum`
    );
    assert.equal(translations.zh.weapons[key], zhName, `${key} Chinese name`);
    assert.equal(isImage(`src/assets/weapons/${key}.png`), true, `${key} icon`);
    assert.equal(
      isImage(`src/assets/weapons/${key}_awaken.png`),
      true,
      `${key} awakened icon`
    );
    const catalogRecord = catalogWeapons.get(key);
    assert.ok(catalogRecord, `${key} catalog record`);
    for (const locale of locales) {
      assert.equal(
        translations[locale].weapons[key],
        catalogRecord.translations[locale],
        `${locale} ${key}`
      );
    }
  }

  for (const key of artifactSets) {
    assert.ok(setData[key], `${key} metadata`);
    const catalogRecord = catalogSets.get(key);
    assert.ok(catalogRecord, `${key} catalog record`);
    for (const locale of locales) {
      assert.equal(
        translations[locale].sets[key],
        catalogRecord.translations[locale],
        `${locale} ${key}`
      );
    }
    for (const position of artifactPositions) {
      assert.equal(
        isImage(`src/assets/artifacts/${key}_${position}.png`),
        true,
        `${key} ${position}`
      );
    }
  }
});
