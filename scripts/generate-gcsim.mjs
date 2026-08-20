import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createGameDataCatalog } from "./game-data/catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GCSIM_PATH = path.join(__dirname, "../gcsim");
const compareASCII = (left, right) =>
  left < right ? -1 : left > right ? 1 : 0;

const CATALOG_RECORD_HEADER = /^\s*keys\.\w+:\s*\{/gm;

const parseCatalogRecords = (source, idField, label) => {
  if (!/^\w+$/.test(idField)) {
    throw new Error(`invalid GCSIM catalog id field ${idField}`);
  }

  const headers = [...source.matchAll(CATALOG_RECORD_HEADER)];
  if (headers.length === 0) {
    throw new Error(`GCSIM ${label} catalog contains no records`);
  }

  const records = [];
  const failures = [];
  const keys = new Set();
  for (const [index, header] of headers.entries()) {
    const start = header.index;
    const end = headers[index + 1]?.index ?? source.length;
    const block = source.slice(start, end);
    const idMatch = block.match(new RegExp(`^\\s*${idField}:\\s*(\\d+),`, "m"));
    const keyMatch = block.match(/^\s*Key:\s*"([^"]+)",/m);
    if (!idMatch || !keyMatch) {
      failures.push(header[0].match(/keys\.(\w+)/)?.[1] ?? `record ${index}`);
      continue;
    }

    const gameId = Number(idMatch[1]);
    const key = keyMatch[1].toLowerCase();
    if (!Number.isSafeInteger(gameId) || gameId <= 0 || keys.has(key)) {
      failures.push(key);
      continue;
    }
    keys.add(key);
    records.push({ key, gameId });
  }

  if (failures.length > 0 || records.length !== headers.length) {
    throw new Error(
      `could not parse every ${label} record from the generated GCSIM catalog: ` +
        failures.join(", ")
    );
  }

  return records.sort((left, right) => compareASCII(left.key, right.key));
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

const buildAppKeysById = (records) =>
  new Map(records.map(({ gameId, key }) => [gameId, key]));

const generateCatalog = async ({
  label,
  catalogFile,
  shortcutsFile,
  keysFile,
  aliasesFile,
  idField,
  appKeysById,
  resolveAppKey,
  overrides,
}) => {
  console.log(`Generating gcsim ${label}...`);
  const catalogSource = await fs.promises.readFile(catalogFile, "utf8");
  const records = parseCatalogRecords(catalogSource, idField, label);
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
  const gameData = createGameDataCatalog({ includeTranslations: false });
  const characterKeysById = buildAppKeysById(gameData.characters);
  const artifactKeysById = buildAppKeysById(gameData.artifactSets);
  const weaponKeysById = buildAppKeysById(gameData.weapons);

  const characters = await generateCatalog({
    label: "characters",
    catalogFile: path.join(GCSIM_PATH, "pkg/catalog/character.dm.go"),
    shortcutsFile: path.join(GCSIM_PATH, "pkg/shortcut/character.dm.go"),
    keysFile: path.join(outputDirectory, "characters.json"),
    aliasesFile: path.join(outputDirectory, "characters-aliases.json"),
    idField: "Id",
    appKeysById: characterKeysById,
    resolveAppKey: ({ key }) => {
      const traveler = key.match(/^(?:aether|lumine)(\w+)$/);
      return traveler ? `traveler_${traveler[1]}` : undefined;
    },
    overrides: { lanyan: "lan_yan", yangu: "ganyu" },
  });
  const artifacts = await generateCatalog({
    label: "artifacts",
    catalogFile: path.join(GCSIM_PATH, "pkg/catalog/artifact.dm.go"),
    shortcutsFile: path.join(GCSIM_PATH, "pkg/shortcut/artifact.dm.go"),
    keysFile: path.join(outputDirectory, "artifacts.json"),
    aliasesFile: path.join(outputDirectory, "artifacts-aliases.json"),
    idField: "SetId",
    appKeysById: artifactKeysById,
  });
  const weapons = await generateCatalog({
    label: "weapons",
    catalogFile: path.join(GCSIM_PATH, "pkg/catalog/weapon.dm.go"),
    shortcutsFile: path.join(GCSIM_PATH, "pkg/shortcut/weapon.dm.go"),
    keysFile: path.join(outputDirectory, "weapons.json"),
    aliasesFile: path.join(outputDirectory, "weapons-aliases.json"),
    idField: "Id",
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

export { addAppAliases, buildAliasMap, generate_gcsim, parseCatalogRecords };
