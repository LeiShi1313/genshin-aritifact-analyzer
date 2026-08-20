import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import GenshinData from "genshin-data";

import {
  createGenshinDbProvider,
  validateFallbackSnapshot,
} from "./catalog.mjs";
import {
  buildEnkaFallbackSnapshot,
  fetchPinnedEnkaData,
  requireEnkaRevision,
  resolveLatestEnkaRevision,
} from "./enka-fallback.mjs";

const require = createRequire(import.meta.url);
const genshinDataVersion = JSON.parse(
  readFileSync(
    resolve(dirname(require.resolve("genshin-data")), "../package.json"),
    "utf8"
  )
).version;

const stableValue = (value) => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, stableValue(entry)])
    );
  }
  return value;
};

export const generateFallbackSnapshot = async () => {
  const releaseData = new GenshinData({ language: "english" });
  const enkaRevision = process.env.ENKA_FALLBACK_REVISION
    ? requireEnkaRevision(process.env.ENKA_FALLBACK_REVISION)
    : await resolveLatestEnkaRevision();
  const [enkaData, characters, weapons, artifactSets] = await Promise.all([
    fetchPinnedEnkaData(enkaRevision),
    releaseData.characters(),
    releaseData.weapons(),
    releaseData.artifacts(),
  ]);
  const snapshot = buildEnkaFallbackSnapshot({
    enkaData,
    releaseCatalog: {
      gameVersion: releaseData.getGameVersion(),
      characters,
      weapons,
      artifactSets,
    },
    primaryProvider: createGenshinDbProvider({ includeTranslations: false }),
    genshinDataVersion,
    enkaRevision,
  });
  validateFallbackSnapshot(snapshot);
  return snapshot;
};

export const writeFallbackSnapshot = async () => {
  const snapshot = await generateFallbackSnapshot();
  const outputPath = resolve(
    fileURLToPath(
      new URL(
        "../../src/data/game-data-fallback.generated.json",
        import.meta.url
      )
    )
  );
  writeFileSync(
    outputPath,
    `${JSON.stringify(stableValue(snapshot))}\n`,
    "utf8"
  );
  console.log(
    `Generated Enka fallback for Genshin ${snapshot.gameVersion}: ` +
      `${snapshot.characters.length} characters, ${snapshot.weapons.length} weapons, ` +
      `${snapshot.artifactSets.length} artifact sets`
  );
};

const isDirectExecution =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  writeFallbackSnapshot().catch((error) => {
    console.error("Fallback generation failed:", error);
    process.exitCode = 1;
  });
}
