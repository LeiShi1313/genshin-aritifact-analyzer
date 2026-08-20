import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  mergeCatalogProviders,
  validateFallbackSnapshot,
} from "../scripts/game-data/catalog.mjs";
import {
  buildEnkaFallbackSnapshot,
  calculateEnkaCharacterStats,
  calculateEnkaWeaponStats,
  fetchPinnedEnkaData,
  resolveLatestEnkaRevision,
} from "../scripts/game-data/enka-fallback.mjs";

const source = (id: string) => ({
  id,
  role: id === "genshin-db" ? "primary" : "fallback",
  version: "fixture",
});

test("catalog composition fills gaps without replacing genshin-db records", () => {
  const primary = {
    source: source("genshin-db"),
    characters: [{ key: "existing", gameId: 1, name: "Primary Existing" }],
    weapons: [],
    artifactSets: [],
  };
  const fallback = {
    source: source("enka-network"),
    characters: [
      { key: "existing", gameId: 1, name: "Fallback Existing" },
      { key: "new_character", gameId: 2, name: "New Character" },
    ],
    weapons: [],
    artifactSets: [],
  };

  const catalog = mergeCatalogProviders(primary, fallback);

  assert.deepEqual(
    catalog.characters.map(({ key, name, sourceId }) => ({
      key,
      name,
      sourceId,
    })),
    [
      { key: "existing", name: "Primary Existing", sourceId: "genshin-db" },
      {
        key: "new_character",
        name: "New Character",
        sourceId: "enka-network",
      },
    ]
  );
});

test("catalog composition rejects ambiguous identities within one provider", () => {
  assert.throws(
    () =>
      mergeCatalogProviders(
        {
          source: source("genshin-db"),
          characters: [
            { key: "first", gameId: 1, name: "First" },
            { key: "second", gameId: 1, name: "Second" },
          ],
          weapons: [],
          artifactSets: [],
        },
        {
          source: source("enka-network"),
          characters: [],
          weapons: [],
          artifactSets: [],
        }
      ),
    /genshin-db characters has duplicate game id 1/
  );
});

test("Enka character progression applies level curves and ascension promotion", () => {
  const raw = {
    BaseProps: { "1": 1000, "4": 20, "7": 50, "20": 0.05, "22": 0.5 },
    PropGrowCurves: { "1": 105, "4": 205, "7": 105 },
    PromoteProps: [
      { "1": 0, "4": 0, "7": 0, "22": 0 },
      { "1": 100, "4": 10, "7": 20, "22": 0.1 },
    ],
  };
  const curves = {
    "105": [1, 1.5],
    "205": [1, 2],
  };

  assert.deepEqual(calculateEnkaCharacterStats(raw, curves, 2, 1), {
    ascension: 1,
    hp: 1600,
    attack: 50,
    defense: 95,
    specialized: 0.6,
    specializedProperty: "22",
  });
});

test("Enka weapon progression applies curves, promotion, and secondary stats", () => {
  const raw = {
    BaseProps: { "4": 40, "23": 0.1 },
    PropGrowCurves: { "4": 1201, "23": 2201 },
    BasePromote: [0, 25],
  };
  const curves = {
    "1201": [1, 2],
    "2201": [1, 1.5],
  };

  assert.deepEqual(calculateEnkaWeaponStats(raw, curves, 2, 1), {
    ascension: 1,
    attack: 105,
    specialized: 0.15000000000000002,
    specializedProperty: "23",
  });
});

test("fallback snapshots fail closed when their pinned provenance is incomplete", () => {
  assert.throws(
    () =>
      validateFallbackSnapshot({
        schemaVersion: 1,
        gameVersion: "7.0",
        sources: [],
        characters: [],
        weapons: [],
        artifactSets: [],
      }),
    /exactly one Enka fallback source/
  );
});

test("fallback snapshots must pin Enka to a full revision", () => {
  assert.throws(
    () =>
      validateFallbackSnapshot({
        schemaVersion: 1,
        gameVersion: "7.0",
        sources: [
          {
            id: "enka-network",
            role: "fallback",
            revision: "not-a-full-revision",
          },
          {
            id: "genshin-data",
            role: "release-catalog",
            version: "0.62.0",
          },
        ],
        characters: [],
        weapons: [],
        artifactSets: [],
      }),
    /must pin a full revision/
  );
});

test("release catalog identities cannot silently disagree with genshin-db", () => {
  assert.throws(
    () =>
      buildEnkaFallbackSnapshot({
        enkaData: {
          avatars: {},
          weapons: {},
          relics: { Sets: {}, Items: {} },
          locs: {},
          curves: {},
        },
        releaseCatalog: {
          gameVersion: "future",
          characters: [{ id: "existing", _id: 2, name: "Existing" }],
          weapons: [],
          artifactSets: [],
        },
        primaryProvider: {
          characters: [{ key: "existing", gameId: 1 }],
          weapons: [],
          artifactSets: [],
        },
        genshinDataVersion: "future",
        enkaRevision: "a".repeat(40),
      }),
    /release character existing maps to game id 2, but genshin-db maps it to 1/
  );
});

test("Traveler variants match by key because talent and avatar ids use different domains", () => {
  const snapshot = buildEnkaFallbackSnapshot({
    enkaData: {
      avatars: {},
      weapons: {},
      relics: { Sets: {}, Items: {} },
      locs: {},
      curves: {},
    },
    releaseCatalog: {
      gameVersion: "future",
      characters: [
        {
          id: "traveler_cryo",
          _id: 10000007,
          name: "Traveler (Cryo)",
        },
      ],
      weapons: [],
      artifactSets: [],
    },
    primaryProvider: {
      characters: [{ key: "traveler_cryo", gameId: 705 }],
      weapons: [],
      artifactSets: [],
    },
    genshinDataVersion: "future",
    enkaRevision: "a".repeat(40),
  });

  assert.deepEqual(snapshot.characters, []);
});

test("release-provider slugs do not override canonical app identity keys", () => {
  const snapshot = buildEnkaFallbackSnapshot({
    enkaData: {
      avatars: {},
      weapons: {},
      relics: { Sets: {}, Items: {} },
      locs: {},
      curves: {},
    },
    releaseCatalog: {
      gameVersion: "future",
      characters: [],
      weapons: [
        {
          id: "ashgraven_drinking_horn",
          _id: 14427,
          name: "Ash-Graven Drinking Horn",
        },
      ],
      artifactSets: [],
    },
    primaryProvider: {
      characters: [],
      weapons: [{ key: "ash_graven_drinking_horn", gameId: 14427 }],
      artifactSets: [],
    },
    genshinDataVersion: "future",
    enkaRevision: "a".repeat(40),
  });

  assert.deepEqual(snapshot.weapons, []);
});

test("Enka updates resolve and fetch an immutable source revision", async () => {
  const revision = "b".repeat(40);
  const revisionRequests: string[] = [];
  const resolved = await resolveLatestEnkaRevision(async (url: string) => {
    revisionRequests.push(url);
    return [{ sha: revision }];
  });
  assert.equal(resolved, revision);
  assert.match(revisionRequests[0], /commits\?path=store%2Fgi/);

  const dataRequests: string[] = [];
  const data = await fetchPinnedEnkaData(revision, async (url: string) => {
    dataRequests.push(url);
    return {};
  });
  assert.deepEqual(Object.keys(data).sort(), [
    "avatars",
    "curves",
    "locs",
    "relics",
    "weapons",
  ]);
  assert.equal(dataRequests.length, 5);
  assert.ok(
    dataRequests.every((url) => url.includes(`/${revision}/store/gi/`))
  );
});

test("game-data updates refresh the fallback snapshot before generation", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  const workflow = readFileSync(
    ".github/workflows/update-genshin-data.yml",
    "utf8"
  );

  assert.equal(
    packageJson.scripts["update:game-data"],
    "npm run update:game-data-fallback && npm run gen"
  );
  assert.match(workflow, /run: npm run update:game-data/);
  assert.match(workflow, /npm view genshin-data version/);
  assert.match(workflow, /ENKA_FALLBACK_REVISION/);
});
