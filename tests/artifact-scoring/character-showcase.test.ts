import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { Artifact } from "../../src/genshin/artifact";
import { AttributePosition, AttributeType } from "../../src/genshin/attribute";
import type { Build } from "../../src/genshin/build";
import { Character } from "../../src/genshin/character";
import { Set as ArtifactSet } from "../../src/genshin/set";
import {
  buildArtifactShowcase,
  getCharacterBuildOptions,
  getCharacterShowcaseExportFileName,
  getCharacterStatsPresentation,
  getEquippedArtifacts,
  getLatestCharacterSource,
  getResolvedArtifactMainAttribute,
  selectCharacterBuildOption,
  sortCharacterRosterByAverageScore,
} from "../../src/features/characters/showcase/characterShowcaseModel";

const build = (name: string): Build => ({
  name,
  character: Character.RAIDEN_SHOGUN,
  weapons: [],
  suits: [
    {
      setCombos: [{ set: ArtifactSet.EMBLEM_OF_SEVERED_FATE, count: 4 }],
    },
  ],
  flowerAttributes: [AttributeType.HP],
  plumeAttributes: [AttributeType.ATK],
  sandsAttributes: [AttributeType.ATK_PERCENT],
  gobletAttributes: [AttributeType.ELECTRO_DAMAGE_BONUS],
  circletAttributes: [AttributeType.CRIT_RATE, AttributeType.CRIT_DAMAGE],
  subAttributes: [
    { type: AttributeType.CRIT_RATE, value: 1 },
    { type: AttributeType.CRIT_DAMAGE, value: 1 },
    { type: AttributeType.ENERGY_RECHARGE, value: 0.8 },
    { type: AttributeType.ATK_PERCENT, value: 0.6 },
  ],
});

const artifact = (
  position: AttributePosition,
  character = Character.RAIDEN_SHOGUN
): Artifact => ({
  set: ArtifactSet.EMBLEM_OF_SEVERED_FATE,
  star: 5,
  level: 0,
  position,
  mainAttribute: {
    type:
      position === AttributePosition.FLOWER
        ? AttributeType.HP
        : position === AttributePosition.PLUME
        ? AttributeType.ATK
        : AttributeType.ATK_PERCENT,
    value: position === AttributePosition.FLOWER ? 717 : 0.069,
  },
  subAttributes: [
    { type: AttributeType.CRIT_RATE, value: 0.027 },
    { type: AttributeType.CRIT_DAMAGE, value: 0.054 },
    { type: AttributeType.ENERGY_RECHARGE, value: 0.045 },
    { type: AttributeType.DEF_PERCENT, value: 0.051 },
  ],
  character,
  locked: false,
});

test("the latest complete account source ignores artifact-only imports", () => {
  const uploads = {
    older: {
      date: "2026-07-20T12:00:00Z",
      characters: [{ character: Character.RAIDEN_SHOGUN }],
      items: [],
    },
    artifactOnly: {
      date: "2026-07-25T12:00:00Z",
      characters: [],
      items: [artifact(AttributePosition.FLOWER)],
    },
    newestComplete: {
      date: "2026-07-24T12:00:00Z",
      characters: [{ character: Character.FURINA }],
      items: [],
    },
  };

  assert.equal(getLatestCharacterSource(uploads)?.id, "newestComplete");
});

test("equipped artifacts are returned in canonical slot order with gaps", () => {
  const plume = artifact(AttributePosition.PLUME);
  const flower = artifact(AttributePosition.FLOWER);
  const foreign = artifact(AttributePosition.SANDS, Character.FURINA);

  assert.deepEqual(
    getEquippedArtifacts(
      { items: [plume, foreign, flower] },
      Character.RAIDEN_SHOGUN
    ),
    [flower, plume, undefined, undefined, undefined]
  );
});

test("persisted approximate artifact main stats resolve to canonical values", () => {
  const persisted = {
    ...artifact(AttributePosition.SANDS),
    level: 20,
    mainAttribute: { type: AttributeType.ATK_PERCENT, value: 0.465 },
  };

  assert.deepEqual(getResolvedArtifactMainAttribute(persisted), {
    type: AttributeType.ATK_PERCENT,
    value: 0.466,
  });
});

test("an enabled custom profile wins by default while an explicit profile is preserved", () => {
  const enabled = build("Enabled custom");
  const disabled = build("Disabled custom");
  const preset = build("Preset");
  const options = getCharacterBuildOptions({
    character: Character.RAIDEN_SHOGUN,
    customBuilds: { disabled, enabled },
    presetBuilds: { preset },
    config: {
      disabled: { enabled: false },
      enabled: { enabled: true },
    },
  });

  assert.equal(selectCharacterBuildOption(options)?.id, "enabled");
  assert.equal(selectCharacterBuildOption(options, "disabled")?.id, "disabled");
});

test("the character roster defaults to highest average score with unscored characters last", () => {
  const roster = [
    { id: "unscored", averageScore: undefined },
    { id: "lower", averageScore: 72 },
    { id: "elite-first", averageScore: 96 },
    { id: "elite-second", averageScore: 96 },
  ];

  const ordered = sortCharacterRosterByAverageScore(roster);

  assert.deepEqual(
    ordered.map(({ id }) => id),
    ["elite-first", "elite-second", "lower", "unscored"]
  );
  assert.deepEqual(
    roster.map(({ id }) => id),
    ["unscored", "lower", "elite-first", "elite-second"]
  );
});

test("artifact presentation binds score, set role, importance, and roll quality to one profile", () => {
  const presentation = buildArtifactShowcase(
    artifact(AttributePosition.FLOWER),
    { id: "raiden", build: build("Burst DPS"), source: "custom", enabled: true }
  );

  assert.equal(presentation.status, "ok");
  if (presentation.status !== "ok") return;
  assert.equal(presentation.setRole, "set-match");
  assert.equal(presentation.substats[0].importance, "core");
  assert.equal(presentation.substats[0].rollEquivalent, 0.7);
  assert.ok(presentation.score >= 0 && presentation.score <= 100);
});

test("only complete character sheets expose numeric stats and PNG export", () => {
  assert.deepEqual(getCharacterStatsPresentation("complete"), {
    canDisplay: true,
    canExport: true,
    noticeKey: undefined,
  });
  assert.deepEqual(getCharacterStatsPresentation("partial"), {
    canDisplay: false,
    canExport: false,
    noticeKey: "notice.statsUnavailable",
  });
  assert.deepEqual(getCharacterStatsPresentation("invalid"), {
    canDisplay: false,
    canExport: false,
    noticeKey: "notice.statsUnavailable",
  });
  assert.equal(getCharacterStatsPresentation("loading").canExport, false);
  assert.equal(getCharacterStatsPresentation("error").canDisplay, false);
});

test("character card export filenames preserve Unicode and always have a fallback", () => {
  assert.equal(
    getCharacterShowcaseExportFileName("雷电将军", "raiden_shogun"),
    "雷电将军-build.png"
  );
  assert.equal(
    getCharacterShowcaseExportFileName("神里 綾華", "kamisato_ayaka"),
    "神里-綾華-build.png"
  );
  assert.equal(
    getCharacterShowcaseExportFileName("✨", "raiden_shogun"),
    "raiden-shogun-build.png"
  );
});

const ELEMENTS = [
  "anemo",
  "cryo",
  "dendro",
  "electro",
  "geo",
  "hydro",
  "pyro",
] as const;

const CARD_THEME_TOKENS = [
  "--element",
  "--element-soft",
  "--element-line",
  "--frame-border",
  "--frame-inset",
  "--halo-border",
  "--halo-glow",
  "--header-muted",
  "--source-border",
  "--source-text",
  "--source-panel",
  "--identity-kicker",
  "--identity-meta",
  "--artifact-index",
  "--shell-text",
  "--shell-muted",
  "--panel",
  "--artifact-shell",
  "--artifact-text",
  "--artifact-muted",
  "--rank-strong",
  "--rank-excellent",
  "--rank-exceptional",
  "--rank-crowned",
  "--rank-apex",
] as const;

const PAGE_THEME_TOKENS = [
  "--showcase-page-accent",
  "--showcase-page-ink",
  "--showcase-page-label",
  "--showcase-page-muted",
  "--showcase-page-legend-strong",
  "--showcase-page-control",
  "--showcase-page-control-strong",
  "--showcase-page-select",
  "--showcase-page-meta",
  "--showcase-page-border",
] as const;

const readSource = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const ruleBody = (source: string, selector: string) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))?.[1];
};

test("every element owns complete order-independent card, page, and roster themes", () => {
  const themes = readSource(
    "src/features/characters/showcase/showcase-element-themes.css"
  );

  for (const element of ELEMENTS) {
    const cardSelector = `.ccp-seal.ccp-seal--${element}`;
    const cardRule = ruleBody(themes, cardSelector);
    assert.ok(cardRule, `${cardSelector} must own its theme`);
    for (const token of CARD_THEME_TOKENS) {
      assert.match(
        cardRule,
        new RegExp(`${token}\\s*:`),
        `${cardSelector} lacks ${token}`
      );
    }

    const pageSelector = `.character-showcase-page.character-showcase-page--${element}`;
    const pageRule = ruleBody(themes, pageSelector);
    assert.ok(pageRule, `${pageSelector} must own its theme`);
    for (const token of PAGE_THEME_TOKENS) {
      assert.match(
        pageRule,
        new RegExp(`${token}\\s*:`),
        `${pageSelector} lacks ${token}`
      );
    }

    const rosterSelector = `.character-roster-card.character-roster-card--${element}`;
    const rosterRule = ruleBody(themes, rosterSelector);
    assert.ok(rosterRule, `${rosterSelector} must own its theme`);
    assert.match(rosterRule, /--element\s*:/);
    assert.match(rosterRule, /background\s*:/);
  }
});

test("outer character-card corners use one shared regular radius across every element", () => {
  const themes = readSource(
    "src/features/characters/showcase/showcase-element-themes.css"
  );
  const cardStyles = readSource(
    "src/features/characters/showcase/character-showcase-card.css"
  );
  const pageStyles = readSource(
    "src/features/characters/showcase/showcase-page.css"
  );

  assert.match(
    ruleBody(cardStyles, ".ccp-seal") ?? "",
    /border-radius:\s*24px/
  );
  assert.match(
    ruleBody(cardStyles, ".ccp-seal::before") ?? "",
    /border-radius:\s*17px/
  );
  assert.match(
    pageStyles,
    /\.character-showcase-card\.ccp-seal\s*\{[^}]*border-radius:\s*18px/s
  );

  for (const element of ELEMENTS) {
    assert.doesNotMatch(
      ruleBody(themes, `.ccp-seal.ccp-seal--${element}`) ?? "",
      /border-radius\s*:/,
      `${element} must not override the shared outer radius`
    );
    assert.doesNotMatch(
      ruleBody(cardStyles, `.ccp-seal--${element}::before`) ?? "",
      /border-radius\s*:/,
      `${element} must not reshape the shared inset frame`
    );
    assert.doesNotMatch(
      pageStyles,
      new RegExp(
        `\\.character-showcase-card\\.ccp-seal--${element}\\s*\\{[^}]*border-radius\\s*:`,
        "s"
      ),
      `${element} must not override the shared mobile radius`
    );
  }
});

test("character page surfaces cover the viewport and their full scroll content", () => {
  const pageStyles = readSource(
    "src/features/characters/showcase/showcase-page.css"
  );
  const surfaceRule = pageStyles.match(
    /\.characters-page,\s*\.character-showcase-page,\s*\.characters-empty-state\s*\{([^}]*)\}/s
  )?.[1];

  assert.ok(surfaceRule, "character page surfaces must share one layout rule");
  assert.match(surfaceRule, /width:\s*100vw/);
  assert.match(surfaceRule, /min-height:\s*100%/);
  assert.match(
    surfaceRule,
    /flex:\s*0\s+0\s+auto/,
    "the surface must not shrink to the fixed-height layout wrapper"
  );
});

test("character pages inherit the app background instead of painting a separate shell", () => {
  const pageStyles = readSource(
    "src/features/characters/showcase/showcase-page.css"
  );
  const themes = readSource(
    "src/features/characters/showcase/showcase-element-themes.css"
  );
  const backgroundDeclaration =
    /(?:^|\s)background(?:-color|-image)?\s*:/;

  for (const selector of [
    ".characters-page",
    ".character-showcase-page",
    ".characters-empty-state",
  ]) {
    assert.doesNotMatch(
      ruleBody(pageStyles, selector) ?? "",
      backgroundDeclaration,
      `${selector} must inherit the app background`
    );
  }

  for (const element of ELEMENTS) {
    const selector = `.character-showcase-page.character-showcase-page--${element}`;
    assert.doesNotMatch(
      ruleBody(themes, selector) ?? "",
      backgroundDeclaration,
      `${selector} must not paint an element-specific page background`
    );
  }
});

test("the element contract has one owner and is loaded by every production surface", () => {
  const cardStyles = readSource(
    "src/features/characters/showcase/character-showcase-card.css"
  );
  const pageStyles = readSource(
    "src/features/characters/showcase/showcase-page.css"
  );

  assert.doesNotMatch(cardStyles, /^\.ccp-seal--[a-z]+\s*\{/m);
  assert.doesNotMatch(pageStyles, /^\.ccp-seal--/m);
  assert.doesNotMatch(
    pageStyles,
    /^\.character-(?:showcase-page|roster-card)--/m
  );

  for (const component of [
    "CharacterShowcaseCard.jsx",
    "CharacterShowcasePage.jsx",
    "CharactersPage.jsx",
  ]) {
    assert.match(
      readSource(`src/features/characters/showcase/${component}`),
      /import "\.\/showcase-element-themes\.css";/
    );
  }
});

test("the production card gates incomplete export without approximate markers", () => {
  const page = readSource(
    "src/features/characters/showcase/CharacterShowcasePage.jsx"
  );
  const card = readSource(
    "src/features/characters/showcase/CharacterShowcaseCard.jsx"
  );

  assert.match(page, /setSheetRequest\(\{ status: "loading", loadout \}\)/);
  assert.match(page, /setSheetRequest\(\{ status: "error", loadout \}\)/);
  assert.match(page, /getCharacterStatsPresentation\(statsStatus\)/);
  assert.match(
    page,
    /statsPresentation\.canDisplay\s*\?\s*calculation\s*:\s*undefined/
  );
  assert.match(page, /disabled=\{!statsExportReady \|\| exportState === "working"\}/);
  assert.match(page, /getResolvedArtifactMainAttribute\(artifact\)/);
  assert.match(page, /onClick=\{\(\) => window\.location\.reload\(\)\}/);
  assert.doesNotMatch(page, /statsRetry/);
  assert.doesNotMatch(page, /notice\.statsPartial/);
  assert.doesNotMatch(page, /statsApproximate/);
  assert.doesNotMatch(card, /statsApproximate/);
  assert.doesNotMatch(card, /≈/);
  assert.doesNotMatch(card, /card\.statScopePartial/);
  assert.match(card, /card\.statScope/);
});
