import assert from "node:assert/strict";
import test from "node:test";

import { Character } from "../../genshin/character";
import { parseGOODFormat } from "../../src/utils/import";

const travelerFixture = (characterKeys: string[]) => ({
  format: "GOOD",
  version: 1,
  source: "traveler-location-regression",
  characters: characterKeys.map((key) => ({
    key,
    level: 90,
    ascension: 6,
    constellation: 0,
    talent: { auto: 1, skill: 1, burst: 1 },
  })),
  weapons: [
    {
      key: "DullBlade",
      level: 90,
      ascension: 6,
      refinement: 1,
      location: "Traveler",
    },
  ],
  artifacts: [
    {
      setKey: "GladiatorsFinale",
      slotKey: "flower",
      rarity: 5,
      level: 20,
      mainStatKey: "hp",
      substats: [],
      location: "Traveler",
      lock: false,
    },
  ],
});

test("generic GOOD Traveler equipment resolves to the imported element", () => {
  const parsed = parseGOODFormat(travelerFixture(["TravelerAnemo"]));

  assert.equal(parsed.characters[0]?.character, Character.TRAVELER_ANEMO);
  assert.equal(parsed.weapons[0]?.location, Character.TRAVELER_ANEMO);
  assert.equal(parsed.artifacts[0]?.character, Character.TRAVELER_ANEMO);
});

test("ambiguous generic Traveler equipment stays unassigned", () => {
  const parsed = parseGOODFormat(
    travelerFixture(["TravelerAnemo", "TravelerDendro"])
  );

  assert.equal(parsed.weapons[0]?.location, Character.CHARACTER_UNSPECIFIED);
  assert.equal(parsed.artifacts[0]?.character, Character.CHARACTER_UNSPECIFIED);
});
