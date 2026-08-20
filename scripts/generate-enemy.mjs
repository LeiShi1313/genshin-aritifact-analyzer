import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GCSIM_LOCALIZATION_PATH = path.join(
  __dirname,
  "../gcsim/ui/packages/localization/src/locales/names.dm.json"
);
const PUBLIC_LOCALES_PATH = path.join(__dirname, "../public/locales");
const DATA_PATH = path.join(__dirname, "../src/data/gcsim");
const PROTO_PATH = path.join(__dirname, "../proto/enemy.proto");

const LANGUAGE_MAP = {
  English: "en",
  Chinese: "zh",
  German: "de",
  Japanese: "ja",
  Korean: "ko",
  Spanish: "es",
};

const compareASCII = (left, right) =>
  left < right ? -1 : left > right ? 1 : 0;

const sortedRecord = (record) =>
  Object.fromEntries(
    Object.entries(record).sort(([left], [right]) => compareASCII(left, right))
  );

const readEnemyNames = (gcsimData, language) => {
  const enemyNames = gcsimData?.[language]?.monster_names;
  if (
    !enemyNames ||
    typeof enemyNames !== "object" ||
    Array.isArray(enemyNames)
  ) {
    throw new Error(`GCSIM localization is missing ${language} monster_names`);
  }
  return sortedRecord(enemyNames);
};

const assertMatchingEnemyKeys = (expectedKeys, enemyNames, language) => {
  const actualKeys = Object.keys(enemyNames);
  const expected = new Set(expectedKeys);
  const actual = new Set(actualKeys);
  const missing = expectedKeys.filter((key) => !actual.has(key));
  const extra = actualKeys.filter((key) => !expected.has(key));
  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      `${language} monster_names keys differ from English ` +
        `(missing: ${missing.join(", ") || "none"}; ` +
        `extra: ${extra.join(", ") || "none"})`
    );
  }
};

const readEnemyProtoAssignments = async (protoPath) => {
  let source;
  try {
    source = await fs.promises.readFile(protoPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return new Map();
    throw error;
  }

  const assignments = new Map();
  const usedNumbers = new Set();
  for (const match of source.matchAll(
    /^\s+([A-Z_][A-Z0-9_]*)\s*=\s*(\d+);$/gm
  )) {
    const [, identifier, rawNumber] = match;
    if (identifier === "ENEMY_UNSPECIFIED") continue;
    const number = Number(rawNumber);
    if (
      assignments.has(identifier) ||
      usedNumbers.has(number) ||
      number === 0
    ) {
      throw new Error(
        `Invalid existing enemy proto assignment ${identifier} = ${number}`
      );
    }
    assignments.set(identifier, number);
    usedNumbers.add(number);
  }
  return assignments;
};

const buildEnemyProto = (enemyKeys, existingAssignments = new Map()) => {
  const identifiers = new Set();
  const currentIdentifiers = enemyKeys.map((key) => {
    const identifier = key.toUpperCase();
    if (!/^[A-Z_][A-Z0-9_]*$/.test(identifier)) {
      throw new Error(
        `Enemy key "${key}" cannot become a proto enum identifier`
      );
    }
    if (identifiers.has(identifier)) {
      throw new Error(
        `Enemy keys produce duplicate proto enum "${identifier}"`
      );
    }
    identifiers.add(identifier);
    return identifier;
  });

  const assignments = new Map(existingAssignments);
  let nextNumber = Math.max(0, ...assignments.values()) + 1;
  for (const identifier of currentIdentifiers) {
    if (!assignments.has(identifier)) {
      assignments.set(identifier, nextNumber);
      nextNumber += 1;
    }
  }
  const enumLines = [...assignments.entries()]
    .sort(([, left], [, right]) => left - right)
    .map(([identifier, number]) => `    ${identifier} = ${number};`);

  return [
    'syntax = "proto3";',
    "",
    "package io.leishi.genshin.proto;",
    "",
    "enum Enemy {",
    "    ENEMY_UNSPECIFIED = 0;",
    ...enumLines,
    "}",
    "",
  ].join("\n");
};

const generateEnemyArtifacts = async ({
  localizationPath = GCSIM_LOCALIZATION_PATH,
  publicLocalesPath = PUBLIC_LOCALES_PATH,
  dataPath = DATA_PATH,
  protoPath = PROTO_PATH,
} = {}) => {
  const gcsimData = JSON.parse(
    await fs.promises.readFile(localizationPath, "utf8")
  );
  const locales = {};
  const englishEnemyNames = readEnemyNames(gcsimData, "English");
  const enemyKeys = Object.keys(englishEnemyNames).sort(compareASCII);

  for (const [language, locale] of Object.entries(LANGUAGE_MAP)) {
    const enemyNames = readEnemyNames(gcsimData, language);
    assertMatchingEnemyKeys(enemyKeys, enemyNames, language);
    locales[locale] = enemyNames;
  }
  locales["zh-Hant"] = locales.zh;
  locales.fr = locales.en;
  const existingAssignments = await readEnemyProtoAssignments(protoPath);
  const proto = buildEnemyProto(enemyKeys, existingAssignments);

  for (const [locale, enemyNames] of Object.entries(locales).sort(
    ([left], [right]) => compareASCII(left, right)
  )) {
    const localeDirectory = path.join(publicLocalesPath, locale);
    await fs.promises.mkdir(localeDirectory, { recursive: true });
    await fs.promises.writeFile(
      path.join(localeDirectory, "enemy.json"),
      `${JSON.stringify(enemyNames, null, 4)}\n`,
      "utf8"
    );
  }

  await fs.promises.mkdir(dataPath, { recursive: true });
  await fs.promises.writeFile(
    path.join(dataPath, "enemies.json"),
    `${JSON.stringify(enemyKeys, null, 2)}\n`,
    "utf8"
  );
  await fs.promises.mkdir(path.dirname(protoPath), { recursive: true });
  await fs.promises.writeFile(protoPath, proto, "utf8");

  return {
    enemyCount: enemyKeys.length,
    localeCount: Object.keys(locales).length,
  };
};

const generate_enemy = async () => {
  console.log("Generating GCSIM enemy data...");
  const { enemyCount, localeCount } = await generateEnemyArtifacts();
  console.log(
    `GCSIM enemy generation completed: ${enemyCount} enemies in ${localeCount} locales.`
  );
};

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  generate_enemy().catch((error) => {
    console.error("GCSIM enemy generation failed:", error);
    process.exitCode = 1;
  });
}

export { generate_enemy, generateEnemyArtifacts };
