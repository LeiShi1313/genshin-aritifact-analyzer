import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { AttributeType } from "../../src/genshin/attribute";
import {
  LANGUAGE_OPTIONS,
  SUPPORTED_LOCALES,
  pickSupportedLocale,
  resolveSupportedLocale,
} from "../../src/i18nLocale";
import { formatAttributeValue } from "../../src/utils/attribute";

const LOCALES = ["de", "en", "es", "fr", "ja", "ko", "zh", "zh-Hant"] as const;

const COMMON_KEYS = [
  "All",
  "Artifact score summary",
  "Artifact score filters",
  "Artifact scoring assumptions",
  "Artifact scoring failed",
  "Artifact scoring unavailable",
  "Back to home",
  "Below recommendation",
  "Best reachable",
  "Best matching build",
  "Build Match",
  "Build backup file is invalid",
  "Calculating",
  "Calculating Build Match",
  "Calculating Prospect Rarity for all artifacts",
  "Calculating artifact scores",
  "Calculating set recommendations",
  "Chance to finish in the top 10%",
  "Chance to reach Match target",
  "Detailed upgrade forecast unavailable",
  "Current score",
  "Exceptional",
  "Exact scoring supports five-star artifacts only",
  "Expected +20 Match",
  "Filter by 2-piece bonus",
  "Four-line start probability",
  "Four-line start probability description",
  "Four-line start probability value",
  "Generate V2 lock file",
  "Generate lock file",
  "Good",
  "High priority",
  "Low potential",
  "Main stat mismatch",
  "Matching build score",
  "Matching characters",
  "Maximum artifact level",
  "Median",
  "Minimum Build Match",
  "Minimum Potential",
  "Minimum Prospect Rarity",
  "Minimum Score",
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
  "Off-piece candidate",
  "Other",
  "Other artifacts",
  "P10",
  "P90",
  "Page navigation",
  "Page selection",
  "Pick one",
  "Perfect",
  "Potential",
  "Previous page",
  "Prospect Rarity",
  "Prospect Rarity unavailable; score filtering and lock export are disabled",
  "Recommended",
  "Recommended artifacts",
  "Relative importance",
  "Relative importance description",
  "Relative importance value",
  "Reset Filter",
  "Reset four-line start probability",
  "Score",
  "Set farming estimate",
  "Set match",
  "Set mismatch",
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
  "Try upgrading",
  "Unavailable",
  "Unscored artifacts are shown under Other artifacts",
  "Unscored artifacts are shown under Unselected",
  "Upgrade forecast",
  "V2_lock_file_tooltip",
  "Waiting for Prospect Rarity",
  "Worth keeping",
  "Worth upgrading",
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

const SHOWCASE_KEYS = [
  "archive.account",
  "archive.artifactContribution",
  "archive.character",
  "archive.currentSnapshot",
  "archive.entry",
  "archive.import",
  "card.artifactSubstats",
  "card.characterArtifactAlt",
  "card.characterArtifacts",
  "card.elite",
  "card.emptySlot",
  "card.equipArtifact",
  "card.inspectArtifact",
  "card.level",
  "card.maxRollEquivalents",
  "card.missing",
  "card.noArtifact",
  "card.noWeaponSnapshot",
  "card.rarity",
  "card.refinement",
  "card.statScope",
  "card.statScopePartial",
  "card.standard",
  "card.unscored",
  "detail.close",
  "detail.mainStat",
  "detail.note",
  "detail.notPrioritized",
  "detail.priority",
  "detail.rolls",
  "empty.backToRoster",
  "empty.snapshotDescription",
  "empty.snapshotTitle",
  "legend.core",
  "legend.coreDescription",
  "legend.minor",
  "legend.minorDescription",
  "legend.rollExplanation",
  "legend.useful",
  "legend.usefulDescription",
  "notice.profileRequired",
  "notice.reloadPage",
  "notice.statsError",
  "notice.statsLoading",
  "notice.statsPartial",
  "notice.statsUnavailable",
  "roster.accountSnapshot",
  "roster.averageShort",
  "roster.buildReady",
  "roster.chooseProfile",
  "roster.description",
  "roster.emptyDescription",
  "roster.emptyTitle",
  "roster.filtersLabel",
  "roster.importAccount",
  "roster.importFallback",
  "roster.importNew",
  "roster.missingArtifacts_one",
  "roster.missingArtifacts_other",
  "roster.needsAttention",
  "roster.noArtifacts",
  "roster.noResults",
  "roster.noWeapon",
  "roster.openLatest",
  "roster.profileNeeded",
  "roster.reviewArtifacts",
  "roster.search",
  "roster.title",
  "status.chooseProfile",
  "status.flexibleSet",
  "status.noScoringProfile",
  "status.offPiece",
  "status.scoreUnavailable",
  "talents.burst",
  "talents.levels",
  "talents.normal",
  "talents.skill",
  "toolbar.createProfile",
  "toolbar.custom",
  "toolbar.disabled",
  "toolbar.exportPng",
  "toolbar.importedSnapshot",
  "toolbar.improveBuild",
  "toolbar.noProfile",
  "toolbar.preset",
  "toolbar.rendering",
  "toolbar.roster",
  "toolbar.saved",
  "toolbar.scoringProfile",
  "toolbar.tryAgain",
  "toolbar.updated",
] as const;

const COMMON_PLACEHOLDERS: Readonly<Record<string, readonly string[]>> = {
  "Artifact score summary": [
    "{{label}}",
    "{{score}}",
    "{{action}}",
    "{{build}}",
  ],
  "Best matching build": ["{{build}}"],
  "Chance to reach Match target": ["{{target}}", "{{chance}}"],
  "Four-line start probability value": ["{{value}}"],
  "Matching characters": ["{{count}}"],
  "Matching build score": ["{{build}}", "{{label}}", "{{score}}"],
  "Relative importance value": ["{{stat}}", "{{value}}"],
  "Remove main stat": ["{{stat}}"],
  "Remove substat": ["{{stat}}"],
  "Showing artifact count": ["{{shown}}", "{{total}}"],
  "Set farming estimate": ["{{drops}}"],
  "Top 10% finished Match cutoff": ["{{value}}"],
};

const readMessages = (
  locale: string,
  namespace: "common" | "artifacts" | "showcase"
) =>
  JSON.parse(
    readFileSync(
      new URL(
        `../../public/locales/${locale}/${namespace}.json`,
        import.meta.url
      ),
      "utf8"
    )
  ) as Record<string, unknown>;

const messageAt = (messages: Record<string, unknown>, key: string): unknown =>
  key.split(".").reduce<unknown>((value, segment) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[segment];
  }, messages);

const assertNestedMessages = (
  locale: string,
  namespace: string,
  messages: Record<string, unknown>,
  keys: readonly string[]
) => {
  for (const key of keys) {
    const value = messageAt(messages, key);
    assert.equal(
      typeof value,
      "string",
      `${locale}/${namespace} is missing ${key}`
    );
    assert.notEqual(
      (value as string).trim(),
      "",
      `${locale}/${namespace} has an empty ${key}`
    );
  }
};

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

test("all supported locales cover the complete character-showcase flow", () => {
  const placeholderKeys: Readonly<Record<string, readonly string[]>> = {
    "archive.account": ["{{format}}"],
    "archive.artifactContribution": ["{{profile}}"],
    "archive.entry": ["{{index}}"],
    "card.artifactSubstats": ["{{slot}}"],
    "card.characterArtifactAlt": ["{{character}}", "{{slot}}"],
    "card.characterArtifacts": ["{{character}}"],
    "card.inspectArtifact": ["{{slot}}", "{{score}}"],
    "card.level": ["{{level}}"],
    "card.maxRollEquivalents": ["{{priority}}", "{{rolls}}"],
    "card.rarity": ["{{count}}"],
    "card.refinement": ["{{refinement}}"],
    "detail.priority": ["{{priority}}"],
    "detail.rolls": ["{{rolls}}"],
    "roster.importFallback": ["{{id}}"],
    "roster.missingArtifacts_one": ["{{count}}"],
    "roster.missingArtifacts_other": ["{{count}}"],
    "toolbar.updated": ["{{date}}"],
  };

  for (const locale of LOCALES) {
    const showcase = readMessages(locale, "showcase");
    assertNestedMessages(locale, "showcase", showcase, SHOWCASE_KEYS);

    for (const [key, placeholders] of Object.entries(placeholderKeys)) {
      const value = messageAt(showcase, key) as string;
      for (const placeholder of placeholders) {
        assert.equal(
          value.includes(placeholder),
          true,
          `${locale}/showcase ${key} is missing ${placeholder}`
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

test("regional browser locales resolve to an available translation bundle", () => {
  assert.deepEqual(
    [...SUPPORTED_LOCALES].sort(),
    [...LOCALES].sort(),
    "locale resources and runtime locale policy must stay aligned"
  );
  assert.deepEqual(
    LANGUAGE_OPTIONS.map(({ locale }) => locale),
    SUPPORTED_LOCALES,
    "the language menu must use the runtime locale policy"
  );
  assert.equal(resolveSupportedLocale("en-US"), "en");
  assert.equal(resolveSupportedLocale("fr-CA"), "fr");
  assert.equal(resolveSupportedLocale("zh-CN"), "zh");
  assert.equal(resolveSupportedLocale("zh-Hans"), "zh");
  assert.equal(resolveSupportedLocale("zh-TW"), "zh-Hant");
  assert.equal(resolveSupportedLocale("zh-HK"), "zh-Hant");
  assert.equal(resolveSupportedLocale("pt-BR"), undefined);
  assert.equal(pickSupportedLocale(["pt-BR", "ja-JP"]), "ja");
  assert.equal(pickSupportedLocale([]), "en");
});

test("showcase stat values follow the active locale", () => {
  assert.equal(
    formatAttributeValue({ type: AttributeType.HP, value: 1234.4 }, "de"),
    "1.234"
  );
  assert.equal(
    formatAttributeValue(
      { type: AttributeType.CRIT_RATE, value: 0.1234 },
      "de"
    ),
    "12,3 %"
  );
  assert.equal(
    formatAttributeValue(
      { type: AttributeType.CRIT_RATE, value: 0.1234 },
      "en"
    ),
    "12.3%"
  );
});
