import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { generateEnemyArtifacts } from "../../scripts/generate-enemy.mjs";

const languageNames = [
  "English",
  "Chinese",
  "German",
  "Japanese",
  "Korean",
  "Spanish",
];

const createFixture = (languages = languageNames) =>
  Object.fromEntries(
    languages.map((language) => [
      language,
      {
        enemy_names: {
          zeta: `${language} Zeta`,
          alpha: `${language} Alpha`,
        },
      },
    ])
  );

test("enemy generation writes deterministic locales, keys, and proto before resolving", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "gcsim-enemies-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  const localizationPath = path.join(root, "names.generated.json");
  const publicLocalesPath = path.join(root, "public/locales");
  const dataPath = path.join(root, "src/data/gcsim");
  const protoPath = path.join(root, "proto/enemy.proto");
  await writeFile(localizationPath, JSON.stringify(createFixture()), "utf8");

  await generateEnemyArtifacts({
    localizationPath,
    publicLocalesPath,
    dataPath,
    protoPath,
  });

  const expectedLocales = ["de", "en", "es", "fr", "ja", "ko", "zh", "zh-Hant"];
  for (const locale of expectedLocales) {
    const contents = JSON.parse(
      await readFile(path.join(publicLocalesPath, locale, "enemy.json"), "utf8")
    );
    assert.deepEqual(Object.keys(contents), ["alpha", "zeta"]);
  }
  assert.deepEqual(
    JSON.parse(await readFile(path.join(dataPath, "enemies.json"), "utf8")),
    ["alpha", "zeta"]
  );
  assert.equal(
    await readFile(protoPath, "utf8"),
    [
      'syntax = "proto3";',
      "",
      "package io.leishi.genshin.proto;",
      "",
      "enum Enemy {",
      "    ENEMY_UNSPECIFIED = 0;",
      "    ALPHA = 1;",
      "    ZETA = 2;",
      "}",
      "",
    ].join("\n")
  );
});

test("enemy generation rejects incomplete upstream localization", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "gcsim-enemies-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  const localizationPath = path.join(root, "names.generated.json");
  await writeFile(
    localizationPath,
    JSON.stringify(
      createFixture(languageNames.filter((name) => name !== "Chinese"))
    ),
    "utf8"
  );

  await assert.rejects(
    () =>
      generateEnemyArtifacts({
        localizationPath,
        publicLocalesPath: path.join(root, "public/locales"),
        dataPath: path.join(root, "src/data/gcsim"),
        protoPath: path.join(root, "proto/enemy.proto"),
      }),
    /Chinese.*enemy_names/
  );
});

test("enemy generation preserves existing enum numbers and appends new keys", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "gcsim-enemies-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  const localizationPath = path.join(root, "names.generated.json");
  const protoPath = path.join(root, "proto/enemy.proto");
  const fixture = createFixture();
  for (const language of languageNames) {
    fixture[language].enemy_names.beta = `${language} Beta`;
  }
  await writeFile(localizationPath, JSON.stringify(fixture), "utf8");
  await mkdir(path.dirname(protoPath), { recursive: true });
  await writeFile(
    protoPath,
    "enum Enemy {\n" +
      "    ENEMY_UNSPECIFIED = 0;\n" +
      "    ALPHA = 7;\n" +
      "    REMOVED_LEGACY_ENEMY = 11;\n" +
      "    ZETA = 14;\n" +
      "}\n",
    "utf8"
  );

  await generateEnemyArtifacts({
    localizationPath,
    publicLocalesPath: path.join(root, "public/locales"),
    dataPath: path.join(root, "src/data/gcsim"),
    protoPath,
  });
  const proto = await readFile(protoPath, "utf8");

  assert.match(proto, /ALPHA = 7;/);
  assert.match(proto, /REMOVED_LEGACY_ENEMY = 11;/);
  assert.match(proto, /ZETA = 14;/);
  assert.match(proto, /BETA = 15;/);
});

test("enemy generation rejects missing or extra translated enemy keys", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "gcsim-enemies-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  const localizationPath = path.join(root, "names.generated.json");
  const fixture = createFixture();
  delete fixture.German.enemy_names.alpha;
  fixture.German.enemy_names.unexpected = "Unexpected";
  await writeFile(localizationPath, JSON.stringify(fixture), "utf8");

  await assert.rejects(
    () =>
      generateEnemyArtifacts({
        localizationPath,
        publicLocalesPath: path.join(root, "public/locales"),
        dataPath: path.join(root, "src/data/gcsim"),
        protoPath: path.join(root, "proto/enemy.proto"),
      }),
    /German.*missing: alpha.*extra: unexpected/
  );
});

test("enemy generation rejects keys that cannot become proto enum identifiers", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "gcsim-enemies-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  const localizationPath = path.join(root, "names.generated.json");
  const fixture = createFixture();
  for (const language of languageNames) {
    fixture[language].enemy_names["invalid-key"] = "Invalid";
  }
  await writeFile(localizationPath, JSON.stringify(fixture), "utf8");

  await assert.rejects(
    () =>
      generateEnemyArtifacts({
        localizationPath,
        publicLocalesPath: path.join(root, "public/locales"),
        dataPath: path.join(root, "src/data/gcsim"),
        protoPath: path.join(root, "proto/enemy.proto"),
      }),
    /invalid-key.*proto enum identifier/
  );
});

test("enemy generation propagates output write failures", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "gcsim-enemies-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  const localizationPath = path.join(root, "names.generated.json");
  const blockedLocalesPath = path.join(root, "locales-file");
  await writeFile(localizationPath, JSON.stringify(createFixture()), "utf8");
  await writeFile(blockedLocalesPath, "not a directory", "utf8");

  await assert.rejects(() =>
    generateEnemyArtifacts({
      localizationPath,
      publicLocalesPath: blockedLocalesPath,
      dataPath: path.join(root, "src/data/gcsim"),
      protoPath: path.join(root, "proto/enemy.proto"),
    })
  );
});
