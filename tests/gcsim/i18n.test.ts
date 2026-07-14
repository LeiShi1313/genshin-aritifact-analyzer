import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const locales = ["de", "en", "es", "fr", "ja", "ko", "zh", "zh-Hant"];

const listUiFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap((entry) => {
    const filename = path.join(directory, entry);
    if (statSync(filename).isDirectory()) return listUiFiles(filename);
    return /\.(jsx|tsx)$/.test(filename) ? [filename] : [];
  });

const uiFiles = [
  ...listUiFiles(path.join(root, "src/features/gcsim")),
  path.join(root, "src/features/artifacts/ArtifactSelectionModal.tsx"),
  path.join(root, "src/features/artifacts/SetSection.tsx"),
  path.join(root, "src/features/characters/MultiCharacterSelect.jsx"),
];

const sources = new Map(
  uiFiles.map((filename) => [filename, readFileSync(filename, "utf8")])
);

const translationKeys = new Set<string>();
for (const source of sources.values()) {
  for (const match of source.matchAll(/\bt\(\s*["']([^"']+)["']/g)) {
    translationKeys.add(match[1]);
  }
}

const resources = Object.fromEntries(
  locales.map((locale) => [
    locale,
    JSON.parse(
      readFileSync(
        path.join(root, `public/locales/${locale}/common.json`),
        "utf8"
      )
    ) as Record<string, string>,
  ])
);

const placeholders = (value: string): string[] =>
  [...value.matchAll(/{{\s*([\w]+)(?:\s*,[^}]*)?\s*}}/g)]
    .map((match) => match[1])
    .sort();

test("every literal GCSIM UI key is translated in all supported locales", () => {
  const missing: string[] = [];
  for (const key of [...translationKeys].sort()) {
    for (const locale of locales) {
      if (
        typeof resources[locale][key] !== "string" ||
        !resources[locale][key]
      ) {
        missing.push(`${locale}: ${key}`);
      }
    }
  }

  assert.deepEqual(missing, []);
});

test("GCSIM translations preserve interpolation placeholders", () => {
  const mismatches: string[] = [];
  for (const key of [...translationKeys].sort()) {
    const expected = placeholders(resources.en[key] ?? "");
    for (const locale of locales) {
      const actual = placeholders(resources[locale][key] ?? "");
      if (actual.join("|") !== expected.join("|")) {
        mismatches.push(`${locale}: ${key} (${actual} != ${expected})`);
      }
    }
  }

  assert.deepEqual(mismatches, []);
});

test("known GCSIM controls do not regress to hardcoded English", () => {
  const allSource = [...sources.values()].join("\n");
  const hardcodedPatterns = [
    />Enemy Configuration</,
    />Default</,
    />Basic Properties</,
    />Elemental Resistances</,
    />Particle Settings</,
    /placeholder=["']Auto["']/,
    /title=\{?setOverride\.count === 4 \? ["']4-piece["']/,
    /aria-label=["'][24]-piece["']/,
    /yigasdkjakla/,
  ];

  for (const pattern of hardcodedPatterns) {
    assert.doesNotMatch(allSource, pattern);
  }
});
