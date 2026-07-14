import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import genshindb from "genshin-db";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GCSIM_PATH = path.join(__dirname, "../gcsim");
const compareASCII = (left, right) =>
  left < right ? -1 : left > right ? 1 : 0;

const iterFind = async (dir, pattern, fn) => {
  const stat = await fs.promises.stat(dir);
  if (stat.isDirectory()) {
    const files = (await fs.promises.readdir(dir)).sort();
    for (const file of files) {
      await iterFind(path.join(dir, file), pattern, fn);
    }
  } else if (stat.isFile() && path.basename(dir) === pattern) {
    await fn(dir);
  }
};

const extractConfigKey = (content, file) => {
  const match = content.match(/^key:\s*"?(\w+)"?/m);
  return (match?.[1] ?? path.basename(path.dirname(file))).toLowerCase();
};

const extractConfigGameId = (content, field, file) => {
  const match = content.match(new RegExp(`^${field}:\\s*(\\d+)`, "m"));
  if (!match) {
    throw new Error(`${file} is missing ${field}`);
  }
  return Number(match[1]);
};

const buildAliasMap = (canonicalKeys, shortcutSource, overrides = {}) => {
  const aliases = {};
  const shortcutRegex = /"(\w+)":\s*keys\.(\w+),/g;

  for (const match of shortcutSource.matchAll(shortcutRegex)) {
    const [, alias, key] = match;
    aliases[alias] = key.toLowerCase();
  }
  for (const key of canonicalKeys) {
    if (!(key in aliases)) {
      aliases[key] = key;
    }
  }
  Object.assign(aliases, overrides);

  return Object.fromEntries(
    Object.entries(aliases).sort(([left], [right]) => compareASCII(left, right))
  );
};

const addAppAliases = (records, aliases, appKeysById, resolveAppKey) => {
  const capabilities = {};
  const resolvedRecords = records.map((record) => ({
    ...record,
    appKey: resolveAppKey?.(record) ?? appKeysById.get(record.gameId),
  }));
  const appKeyByRecordKey = new Map(
    resolvedRecords.map(({ key, appKey }) => [key, appKey])
  );

  for (const record of resolvedRecords) {
    const { appKey } = record;
    if (!appKey) {
      throw new Error(
        `GCSIM key "${record.key}" with game id ${record.gameId} has no app enum`
      );
    }

    const serializerName = appKey.replaceAll("_", "");
    const existingTarget = aliases[serializerName];
    if (existingTarget === undefined) {
      aliases[serializerName] = record.key;
    } else if (
      existingTarget !== appKey &&
      existingTarget !== serializerName &&
      appKeyByRecordKey.get(existingTarget) !== appKey
    ) {
      throw new Error(
        `GCSIM serializer alias "${serializerName}" points to ` +
          `"${existingTarget}" instead of "${record.key}"`
      );
    }
    // Alias values are app-facing parser keys and can differ from the names
    // accepted by GCSIM (for example, lanyan -> lan_yan). Prefer a canonical
    // config key when the upstream alias resolves to an equivalent record;
    // otherwise the current record key is the engine-safe spelling.
    const engineName =
      existingTarget !== undefined &&
      appKeyByRecordKey.get(existingTarget) === appKey
        ? existingTarget
        : record.key;
    if (capabilities[appKey] && capabilities[appKey] !== engineName) {
      throw new Error(`conflicting GCSIM serializer names for ${appKey}`);
    }
    capabilities[appKey] = engineName;
  }

  return Object.fromEntries(
    Object.entries(capabilities).sort(([left], [right]) =>
      compareASCII(left, right)
    )
  );
};

const collectConfigRecords = async (directory, idField) => {
  const records = [];
  await iterFind(directory, "config.yml", async (file) => {
    const content = await fs.promises.readFile(file, "utf8");
    records.push({
      key: extractConfigKey(content, file),
      gameId: extractConfigGameId(content, idField, file),
    });
  });
  return records.sort((left, right) => compareASCII(left.key, right.key));
};

const buildAppKeysById = (query, localeFile) => {
  const names = JSON.parse(fs.readFileSync(localeFile, "utf8"));
  const keysByName = new Map(
    Object.entries(names).map(([key, name]) => [name, key])
  );
  const entries = query("names", {
    matchCategories: true,
    verboseCategories: true,
  });

  return new Map(
    entries.flatMap((entry) => {
      const key = keysByName.get(entry.name);
      return key ? [[Number(entry.id), key]] : [];
    })
  );
};

const generateCatalog = async ({
  label,
  sourceDirectory,
  shortcutsFile,
  keysFile,
  aliasesFile,
  idField,
  appKeysById,
  resolveAppKey,
  overrides,
}) => {
  console.log(`Generating gcsim ${label}...`);
  const records = await collectConfigRecords(sourceDirectory, idField);
  const keys = records.map(({ key }) => key);
  const shortcutSource = await fs.promises.readFile(shortcutsFile, "utf8");
  const aliases = buildAliasMap(keys, shortcutSource, overrides);
  const capabilities = addAppAliases(
    records,
    aliases,
    appKeysById,
    resolveAppKey
  );
  const sortedAliases = Object.fromEntries(
    Object.entries(aliases).sort(([left], [right]) => compareASCII(left, right))
  );

  await Promise.all([
    fs.promises.writeFile(keysFile, JSON.stringify(keys), "utf8"),
    fs.promises.writeFile(aliasesFile, JSON.stringify(sortedAliases), "utf8"),
  ]);
  return capabilities;
};

const generate_gcsim = async () => {
  const outputDirectory = path.join(__dirname, "../src/data/gcsim");
  const localesDirectory = path.join(__dirname, "../public/locales/en");
  const characterKeysById = buildAppKeysById(
    genshindb.characters,
    path.join(localesDirectory, "characters.json")
  );
  const artifactKeysById = buildAppKeysById(
    genshindb.artifacts,
    path.join(localesDirectory, "sets.json")
  );
  const weaponKeysById = buildAppKeysById(
    genshindb.weapons,
    path.join(localesDirectory, "weapons.json")
  );

  const characters = await generateCatalog({
    label: "characters",
    sourceDirectory: path.join(GCSIM_PATH, "internal/characters"),
    shortcutsFile: path.join(GCSIM_PATH, "pkg/shortcut/characters.go"),
    keysFile: path.join(outputDirectory, "characters.json"),
    aliasesFile: path.join(outputDirectory, "characters-aliases.json"),
    idField: "genshin_id",
    appKeysById: characterKeysById,
    resolveAppKey: ({ key }) => {
      const traveler = key.match(/^(?:aether|lumine)(\w+)$/);
      return traveler ? `traveler_${traveler[1]}` : undefined;
    },
    overrides: { lanyan: "lan_yan", yangu: "ganyu" },
  });
  const artifacts = await generateCatalog({
    label: "artifacts",
    sourceDirectory: path.join(GCSIM_PATH, "internal/artifacts"),
    shortcutsFile: path.join(GCSIM_PATH, "pkg/shortcut/artifacts.go"),
    keysFile: path.join(outputDirectory, "artifacts.json"),
    aliasesFile: path.join(outputDirectory, "artifacts-aliases.json"),
    idField: "set_id",
    appKeysById: artifactKeysById,
  });
  const weapons = await generateCatalog({
    label: "weapons",
    sourceDirectory: path.join(GCSIM_PATH, "internal/weapons"),
    shortcutsFile: path.join(GCSIM_PATH, "pkg/shortcut/weapons.go"),
    keysFile: path.join(outputDirectory, "weapons.json"),
    aliasesFile: path.join(outputDirectory, "weapons-aliases.json"),
    idField: "genshin_id",
    appKeysById: weaponKeysById,
  });
  await fs.promises.writeFile(
    path.join(outputDirectory, "capabilities.json"),
    JSON.stringify({ characters, artifacts, weapons }),
    "utf8"
  );

  console.log("GCSIM catalog generation completed.");
};

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  generate_gcsim().catch((error) => {
    console.error("GCSIM catalog generation failed:", error);
    process.exitCode = 1;
  });
}

export { addAppAliases, buildAliasMap, extractConfigKey, generate_gcsim };
