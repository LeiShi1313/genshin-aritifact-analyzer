import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test, { after } from "node:test";
import { createServer } from "vite";

const vite = await createServer({
  root: fileURLToPath(new URL("..", import.meta.url)),
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "silent",
});
const [buildModule, configsModule, hashModule, buildUtilsModule] =
  await Promise.all([
    vite.ssrLoadModule("/src/store/reducers/build.js"),
    vite.ssrLoadModule("/src/store/reducers/configs.js"),
    vite.ssrLoadModule("/src/utils/hash.ts"),
    vite.ssrLoadModule("/src/utils/build.ts"),
  ]);
const buildReducer = buildModule.default;
const { addBuild, editBuild, importBuilds, toggleBuild } = buildModule;
const configsReducer = configsModule.default;
const { resetFourLineStartProbability, updateFourLineStartProbability } =
  configsModule;
const { hashBuild } = hashModule;
const { getBuildDisplayName, getBuildShortName } = buildUtilsModule;

after(() => vite.close());

const makeBuild = (name: string) => ({
  name,
  character: 1,
  weapons: [],
  suits: [],
  flowerAttributes: [],
  plumeAttributes: [],
  sandsAttributes: [],
  gobletAttributes: [],
  circletAttributes: [],
  subAttributes: [],
});

test("only reserved preset names are translated", () => {
  // `Good` is both an existing UI translation key and a valid user-entered
  // build name; custom names must remain verbatim rather than become UI copy.
  const translations: Record<string, string> = {
    traveler_anemo: "旅行者",
    Good: "良好",
    "Recommended build": "推荐配装",
  };
  const t = ((key: string) =>
    translations[key] ?? key) as unknown as Parameters<
    typeof getBuildShortName
  >[1];

  const englishCustom = makeBuild("Good");
  const chineseCustom = makeBuild("良好");
  const exportedNames = [englishCustom, chineseCustom].map((build) =>
    getBuildShortName(build, t)
  );

  assert.deepEqual(exportedNames, ["旅行者 - Good", "旅行者 - 良好"]);
  assert.equal(new Set(exportedNames).size, 2);
  assert.equal(getBuildDisplayName(englishCustom, t), "Good");
  assert.equal(
    getBuildDisplayName(makeBuild("Recommended build"), t),
    "推荐配装"
  );
});

test("editing a build preserves its disabled state under the new hash", () => {
  const originalBuild = makeBuild("Original");
  const editedBuild = makeBuild("Edited");
  const originalHash = hashBuild(originalBuild);
  const editedHash = hashBuild(editedBuild);

  let state = buildReducer(undefined, addBuild(originalBuild));
  state = buildReducer(
    state,
    toggleBuild({ hash: originalHash, enabled: false })
  );
  state = buildReducer(
    state,
    editBuild({ id: originalHash, build: editedBuild })
  );

  assert.equal(state.builds[originalHash], undefined);
  assert.equal(state.config[originalHash], undefined);
  assert.deepEqual(state.builds[editedHash], editedBuild);
  assert.deepEqual(state.config[editedHash], { enabled: false });
});

test("an empty replace import cannot erase custom builds", () => {
  const originalBuild = makeBuild("Original");
  const originalHash = hashBuild(originalBuild);
  const initial = buildReducer(undefined, addBuild(originalBuild));

  const state = buildReducer(
    initial,
    importBuilds({ builds: {}, replace: true })
  );

  assert.strictEqual(state, initial);
  assert.deepEqual(state.builds[originalHash], originalBuild);
});

test("imported builds receive an enabled config", () => {
  const importedBuild = makeBuild("Imported");
  const importedHash = hashBuild(importedBuild);
  const state = buildReducer(
    undefined,
    importBuilds({
      builds: { [importedHash]: importedBuild },
      replace: true,
    })
  );

  assert.deepEqual(state.builds[importedHash], importedBuild);
  assert.deepEqual(state.config[importedHash], { enabled: true });
});

test("artifact scoring config starts with only the 20% four-line prior", () => {
  const state = configsReducer(undefined, { type: "test/init" });

  assert.deepEqual(state, { fourLineStartProbability: 0.2 });
});

test("four-line prior accepts probabilities within the inclusive unit interval", () => {
  const initialState = configsReducer(undefined, { type: "test/init" });

  for (const probability of [0, 0.35, 1]) {
    const updatedState = configsReducer(
      initialState,
      updateFourLineStartProbability(probability)
    );
    assert.equal(updatedState.fourLineStartProbability, probability);
  }
});

test("four-line prior ignores non-finite and out-of-range values", () => {
  const initialState = { fourLineStartProbability: 0.35 };

  for (const value of [-0.01, 1.01, Number.NaN, Number.POSITIVE_INFINITY]) {
    const state = configsReducer(
      initialState,
      updateFourLineStartProbability(value)
    );
    assert.equal(state.fourLineStartProbability, 0.35);
  }
});

test("four-line prior can be reset to its documented 20% default", () => {
  const state = configsReducer(
    { fourLineStartProbability: 0.35 },
    resetFourLineStartProbability()
  );

  assert.deepEqual(state, { fourLineStartProbability: 0.2 });
});

test("every supported locale translates the complete artifact scoring UI", () => {
  const locales = ["de", "en", "es", "fr", "ja", "ko", "zh", "zh-Hant"];
  const requiredKeys = [
    "Artifact scoring assumptions",
    "Model assumption",
    "Four-line start probability",
    "Four-line start probability description",
    "Four-line start probability value",
    "Reset four-line start probability",
    "Relative importance",
    "Relative importance description",
    "Relative importance value",
    "Add substat",
    "Remove substat",
    "Build Match",
    "Build backup file is invalid",
    "Expected +20 Match",
    "Prospect Rarity",
    "Score",
    "Potential",
    "Current score",
    "Minimum Potential",
    "Minimum Score",
    "Low potential",
    "Try upgrading",
    "Worth upgrading",
    "High priority",
    "Below recommendation",
    "Good",
    "Worth keeping",
    "Exceptional",
    "Perfect",
    "Main stat mismatch",
    "Calculating artifact scores",
    "Recommended artifacts",
    "Other artifacts",
    "Recommended",
    "Other",
    "Artifact score summary",
    "Best matching build",
    "Matching build score",
    "Unscored artifacts are shown under Other artifacts",
    "Sort ascending",
    "Sort descending",
    "Artifact selection view",
    "Artifact score filters",
    "Minimum Build Match",
    "Minimum Prospect Rarity",
    "Waiting for Prospect Rarity",
    "Generate lock file",
    "More lock file options",
    "Generate V2 lock file",
    "Open artifact details",
    "Exact scoring supports five-star artifacts only",
    "This artifact cannot be scored because its imported stats are invalid",
    "This browser cannot read build backup files",
    "Unavailable",
    "Top 10%",
    "Matching characters",
    "Upgrade forecast",
    "P10",
    "Median",
    "P90",
    "Best reachable",
    "Chance to finish in the top 10%",
    "Top 10% finished Match cutoff",
    "No tie-preserving top 10% cutoff exists",
    "Chance to reach Match target",
    "Detailed upgrade forecast unavailable",
    "Add main stat",
    "Remove main stat",
    "Calculating Build Match",
    "Artifact scoring failed",
    "Calculating Prospect Rarity for all artifacts",
    "Showing artifact count",
    "No artifacts match the score filters",
    "No valid enabled builds can score this artifact",
    "Artifact scoring unavailable",
    "Prospect Rarity unavailable; score filtering and lock export are disabled",
    "Minimum artifact level",
    "Maximum artifact level",
    "Recommended build",
  ];
  const requiredPlaceholders = {
    "Artifact score summary": [
      "{{label}}",
      "{{score}}",
      "{{action}}",
      "{{build}}",
    ],
    "Best matching build": ["{{build}}"],
    "Matching characters": ["{{count}}"],
    "Matching build score": ["{{build}}", "{{label}}", "{{score}}"],
    "Top 10% finished Match cutoff": ["{{value}}"],
    "Chance to reach Match target": ["{{target}}", "{{chance}}"],
    "Remove main stat": ["{{stat}}"],
    "Showing artifact count": ["{{shown}}", "{{total}}"],
  };

  for (const locale of locales) {
    const path = new URL(
      `../public/locales/${locale}/common.json`,
      import.meta.url
    );
    const messages = JSON.parse(readFileSync(path, "utf8"));

    for (const key of requiredKeys) {
      assert.equal(
        typeof messages[key],
        "string",
        `${locale} is missing ${key}`
      );
      assert.notEqual(
        messages[key].trim(),
        "",
        `${locale} has an empty ${key}`
      );
    }

    for (const [key, placeholders] of Object.entries(requiredPlaceholders)) {
      for (const placeholder of placeholders) {
        assert.equal(
          messages[key].includes(placeholder),
          true,
          `${locale} ${key} is missing ${placeholder}`
        );
      }
    }
  }
});

test("main stat controls import their position enum and expose translated names", () => {
  const path = new URL(
    "../src/features/builds/MainAttributeEditor.jsx",
    import.meta.url
  );
  const source = readFileSync(path, "utf8");

  assert.match(
    source,
    /import\s*{[^}]*AttributePosition[^}]*}\s*from\s*["']\.\.\/\.\.\/genshin\/attribute["']/s
  );
  assert.match(source, /aria-label={t\("Add main stat"\)}/);
  assert.match(source, /aria-label={t\("Remove main stat",\s*{\s*stat:/s);
});
