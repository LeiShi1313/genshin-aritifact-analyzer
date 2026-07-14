import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GCSIM_PATH = path.join(__dirname, "../gcsim");

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

const buildAliasMap = (canonicalKeys, shortcutSource, overrides = {}) => {
  const aliases = {};
  const shortcutRegex = /"(\w+)":\s*keys\.(\w+),/g;

  for (const match of shortcutSource.matchAll(shortcutRegex)) {
    const [, alias, key] = match;
    aliases[alias] = key.toLowerCase();
  }
  for (const key of canonicalKeys) {
    aliases[key] = key;
  }
  Object.assign(aliases, overrides);

  return Object.fromEntries(
    Object.entries(aliases).sort(([left], [right]) =>
      left.localeCompare(right)
    )
  );
};

const collectConfigKeys = async (directory) => {
  const keys = new Set();
  await iterFind(directory, "config.yml", async (file) => {
    const content = await fs.promises.readFile(file, "utf8");
    keys.add(extractConfigKey(content, file));
  });
  return [...keys].sort();
};

const generateCatalog = async ({
  label,
  sourceDirectory,
  shortcutsFile,
  keysFile,
  aliasesFile,
  overrides,
}) => {
  console.log(`Generating gcsim ${label}...`);
  const keys = await collectConfigKeys(sourceDirectory);
  const shortcutSource = await fs.promises.readFile(shortcutsFile, "utf8");
  const aliases = buildAliasMap(keys, shortcutSource, overrides);

  await Promise.all([
    fs.promises.writeFile(keysFile, JSON.stringify(keys), "utf8"),
    fs.promises.writeFile(aliasesFile, JSON.stringify(aliases), "utf8"),
  ]);
};

const generate_gcsim = async () => {
  const outputDirectory = path.join(__dirname, "../src/data/gcsim");

  await generateCatalog({
    label: "characters",
    sourceDirectory: path.join(GCSIM_PATH, "internal/characters"),
    shortcutsFile: path.join(GCSIM_PATH, "pkg/shortcut/characters.go"),
    keysFile: path.join(outputDirectory, "characters.json"),
    aliasesFile: path.join(outputDirectory, "characters-aliases.json"),
    overrides: { lanyan: "lan_yan", yangu: "ganyu" },
  });
  await generateCatalog({
    label: "artifacts",
    sourceDirectory: path.join(GCSIM_PATH, "internal/artifacts"),
    shortcutsFile: path.join(GCSIM_PATH, "pkg/shortcut/artifacts.go"),
    keysFile: path.join(outputDirectory, "artifacts.json"),
    aliasesFile: path.join(outputDirectory, "artifacts-aliases.json"),
  });
  await generateCatalog({
    label: "weapons",
    sourceDirectory: path.join(GCSIM_PATH, "internal/weapons"),
    shortcutsFile: path.join(GCSIM_PATH, "pkg/shortcut/weapons.go"),
    keysFile: path.join(outputDirectory, "weapons.json"),
    aliasesFile: path.join(outputDirectory, "weapons-aliases.json"),
  });

  console.log("GCSIM catalog generation completed.");
};

export { buildAliasMap, extractConfigKey, generate_gcsim };
