import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const LOCALES = ["de", "en", "es", "fr", "ja", "ko", "zh", "zh-Hant"] as const;

const COMMON_KEYS = [
  "All",
  "Artifact score filters",
  "Artifact scoring assumptions",
  "Artifact scoring failed",
  "Artifact scoring unavailable",
  "Back to home",
  "Best reachable",
  "Build Match",
  "Build backup file is invalid",
  "Calculating",
  "Calculating Build Match",
  "Calculating Prospect Rarity for all artifacts",
  "Chance to finish in the top 10%",
  "Chance to reach Match target",
  "Detailed upgrade forecast unavailable",
  "Exact scoring supports five-star artifacts only",
  "Expected +20 Match",
  "Filter by 2-piece bonus",
  "Four-line start probability",
  "Four-line start probability description",
  "Four-line start probability value",
  "Generate V2 lock file",
  "Generate lock file",
  "Matching builds",
  "Maximum artifact level",
  "Median",
  "Minimum Build Match",
  "Minimum Prospect Rarity",
  "Minimum artifact level",
  "Model assumption",
  "More lock file options",
  "Next page",
  "No valid enabled builds can score this artifact",
  "No artifact found",
  "No artifacts match the score filters",
  "No enabled builds",
  "No tie-preserving top 10% cutoff exists",
  "No uploaded artifacts founds",
  "Open artifact details",
  "P10",
  "P90",
  "Page navigation",
  "Page selection",
  "Pick one",
  "Previous page",
  "Prospect Rarity",
  "Prospect Rarity unavailable; score filtering and lock export are disabled",
  "Relative importance",
  "Relative importance description",
  "Relative importance value",
  "Reset Filter",
  "Reset four-line start probability",
  "Show all",
  "Show less",
  "Showing artifact count",
  "Sort ascending",
  "Sort by",
  "Sort descending",
  "Sub Stats",
  "This artifact cannot be scored because its imported stats are invalid",
  "This browser cannot read build backup files",
  "Top 10%",
  "Top 10% finished Match cutoff",
  "Unavailable",
  "Unscored artifacts are shown under Unselected",
  "Upgrade forecast",
  "V2_lock_file_tooltip",
  "Waiting for Prospect Rarity",
  "Add main stat",
  "Add substat",
  "Artifact selection view",
  "Remove main stat",
  "Remove substat",
  "equipped",
  "set",
] as const;

const ARTIFACT_KEYS = [
  "flower",
  "plume",
  "sands",
  "goblet",
  "circlet",
  "sub",
  "position",
  "level",
  "hp",
  "atk",
  "def",
  "hp_percent",
  "atk_percent",
  "def_percent",
  "crit_rate",
  "crit_damage",
  "em",
  "elemental_mastery",
  "er",
  "energy_recharge",
  "healing_bonus",
  "pyro_damage_bonus",
  "hydro_damage_bonus",
  "dendro_damage_bonus",
  "electro_damage_bonus",
  "cryo_damage_bonus",
  "anemo_damage_bonus",
  "physical_damage_bonus",
  "geo_damage_bonus",
  "elemental_damage",
  "physical_damage",
  "crit",
  "healing",
  "shield_strength",
  "elemental_res",
  "talents_damage",
  "less_affected_time",
  "show_selected",
  "show_unselected",
] as const;

const COMMON_PLACEHOLDERS: Readonly<Record<string, readonly string[]>> = {
  "Chance to reach Match target": ["{{target}}", "{{chance}}"],
  "Four-line start probability value": ["{{value}}"],
  "Matching builds": ["{{count}}"],
  "Relative importance value": ["{{stat}}", "{{value}}"],
  "Remove main stat": ["{{stat}}"],
  "Remove substat": ["{{stat}}"],
  "Showing artifact count": ["{{shown}}", "{{total}}"],
  "Top 10% finished Match cutoff": ["{{value}}"],
};

const readMessages = (locale: string, namespace: "common" | "artifacts") =>
  JSON.parse(
    readFileSync(
      new URL(
        `../../public/locales/${locale}/${namespace}.json`,
        import.meta.url
      ),
      "utf8"
    )
  ) as Record<string, unknown>;

const assertMessages = (
  locale: string,
  namespace: string,
  messages: Record<string, unknown>,
  keys: readonly string[]
) => {
  for (const key of keys) {
    assert.equal(
      typeof messages[key],
      "string",
      `${locale}/${namespace} is missing ${key}`
    );
    assert.notEqual(
      (messages[key] as string).trim(),
      "",
      `${locale}/${namespace} has an empty ${key}`
    );
  }
};

test("all supported locales cover the artifact-scoring UI namespaces", () => {
  for (const locale of LOCALES) {
    const common = readMessages(locale, "common");
    const artifacts = readMessages(locale, "artifacts");

    assertMessages(locale, "common", common, COMMON_KEYS);
    assertMessages(locale, "artifacts", artifacts, ARTIFACT_KEYS);

    for (const [key, placeholders] of Object.entries(COMMON_PLACEHOLDERS)) {
      for (const placeholder of placeholders) {
        assert.equal(
          (common[key] as string).includes(placeholder),
          true,
          `${locale}/common ${key} is missing ${placeholder}`
        );
      }
    }
  }
});

test("locale copy keeps the corrected upload message and artifact slot names", () => {
  const english = readMessages("en", "common");
  assert.equal(
    english["No uploaded artifacts founds"],
    "No uploaded artifacts found"
  );

  const traditionalChinese = readMessages("zh-Hant", "artifacts");
  assert.equal(traditionalChinese.sands, "時之沙");
  assert.equal(traditionalChinese.goblet, "空之杯");
});

test("language changes keep the document language in sync", () => {
  const source = readFileSync(
    new URL("../../src/i18n.js", import.meta.url),
    "utf8"
  );
  assert.match(source, /i18n\.on\("languageChanged"/);
  assert.match(source, /document\.documentElement\.lang = language/);
});
