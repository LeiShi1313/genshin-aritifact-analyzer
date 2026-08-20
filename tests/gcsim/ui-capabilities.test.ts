import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { Character } from "../../genshin/character";
import { Artifact } from "../../genshin/artifact";
import { AttributePosition } from "../../genshin/attribute";
import { Set } from "../../genshin/set";
import { Weapon } from "../../genshin/weapon";
import { synchronizeInferredArtifactSets } from "../../src/features/gcsim/equipmentOverrides";
import { initializeArtifactOverrides } from "../../src/features/gcsim/equipmentOverrides";
import {
  getAvailableGCSimCharacters,
  getGCSimCharacterName,
  getGCSimWeaponName,
  isGCSimCharacterSupported,
  isGCSimSetSupported,
  isGCSimWeaponSupported,
} from "../../src/utils/gcsimCapabilities";
import { applyAllOverrides } from "../../src/utils/gcsim";
import { parseScript } from "../../scripts/gcsim";

test("GCSIM capabilities expose the pinned engine support boundary", () => {
  assert.equal(isGCSimCharacterSupported(Character.DURIN), true);
  assert.equal(isGCSimCharacterSupported(Character.NICOLE), true);
  assert.equal(isGCSimCharacterSupported(Character.SANDRONE), false);

  assert.equal(isGCSimWeaponSupported(Weapon.ATHAME_ARTIS), true);
  assert.equal(isGCSimWeaponSupported(Weapon.DISASTER_AND_REMORSE), false);

  assert.equal(isGCSimSetSupported(Set.CELESTIAL_GIFT), true);
  assert.equal(isGCSimSetSupported(Set.DISENCHANTMENT_IN_DEEP_SHADOW), true);
  assert.equal(isGCSimSetSupported(Set.HEART_OF_THE_FURNACE), false);
  assert.equal(isGCSimSetSupported(Set.SCARLET_PROOF), false);

  assert.equal(
    getGCSimCharacterName(Character.YUMEMIZUKI_MIZUKI),
    "yumemizukimizuki"
  );
  assert.equal(
    getGCSimWeaponName(Weapon.RAINBOW_SERPENTS_RAIN_BOW),
    "rainbowserpentsrainbow"
  );
});

const artifact = (set: Set, position: AttributePosition): Artifact =>
  ({ set, position } as Artifact);

test("inferred set bonuses stay synchronized when artifact overrides change", () => {
  const original = synchronizeInferredArtifactSets(
    { enabled: true },
    [
      AttributePosition.FLOWER,
      AttributePosition.PLUME,
      AttributePosition.SANDS,
      AttributePosition.GOBLET,
      AttributePosition.CIRCLET,
    ].map((position) => ({
      position,
      artifact: artifact(Set.GOLDEN_TROUPE, position),
    }))
  );
  assert.deepEqual(original.sets, [{ set: Set.GOLDEN_TROUPE, count: 4 }]);

  const changed = synchronizeInferredArtifactSets(original, [
    {
      position: AttributePosition.FLOWER,
      artifact: artifact(Set.GOLDEN_TROUPE, AttributePosition.FLOWER),
    },
    ...[
      AttributePosition.PLUME,
      AttributePosition.SANDS,
      AttributePosition.GOBLET,
      AttributePosition.CIRCLET,
    ].map((position) => ({
      position,
      artifact: artifact(Set.CELESTIAL_GIFT, position),
    })),
  ]);

  assert.deepEqual(changed.sets, [{ set: Set.CELESTIAL_GIFT, count: 4 }]);
  assert.equal(changed.setsAreInferred, true);
});

test("explicit set overrides do not change with artifact selections", () => {
  const changed = synchronizeInferredArtifactSets(
    {
      enabled: true,
      sets: [{ set: Set.GOLDEN_TROUPE, count: 4 }],
      setsAreInferred: false,
    },
    [
      {
        position: AttributePosition.FLOWER,
        artifact: artifact(Set.CELESTIAL_GIFT, AttributePosition.FLOWER),
      },
    ]
  );

  assert.deepEqual(changed.sets, [{ set: Set.GOLDEN_TROUPE, count: 4 }]);
});

test("unsupported inferred sets are shown as omitted equipment", () => {
  const positions = [
    AttributePosition.FLOWER,
    AttributePosition.PLUME,
    AttributePosition.SANDS,
    AttributePosition.GOBLET,
  ];
  const changed = synchronizeInferredArtifactSets(
    { enabled: true },
    positions.map((position) => ({
      position,
      artifact: artifact(Set.HEART_OF_THE_FURNACE, position),
    }))
  );

  assert.equal(changed.sets, undefined);
  assert.deepEqual(changed.unsupportedEquipment?.sets, [
    Set.HEART_OF_THE_FURNACE,
  ]);
});

test("a naked uploaded GOOD character clears preset artifact stats and sets", () => {
  const artifacts = initializeArtifactOverrides([], true);
  assert.equal(artifacts?.length, 5);
  assert.ok(artifacts?.every(({ artifact }) => artifact === undefined));

  const override = synchronizeInferredArtifactSets(
    { enabled: true },
    artifacts
  );
  const original = parseScript(
    "furina char lvl=90/90 cons=0 talent=1,1,1;\n" +
      'furina add set="goldentroupe" count=4;\n' +
      "furina add stats hp=1000;",
    "naked-good-character"
  );
  const changed = applyAllOverrides(
    original,
    {},
    {
      [Character.FURINA]: override,
    }
  );

  assert.deepEqual(changed.characterInfos[0]?.stats, []);
  assert.deepEqual(changed.characterInfos[0]?.setInfos, []);
});

test("character filters are the unique supported characters present in scripts", () => {
  const scripts = [
    {
      characterInfos: [
        { character: Character.FURINA },
        { character: Character.DURIN },
      ],
    },
    {
      characterInfos: [
        { character: Character.DURIN },
        { character: Character.SANDRONE },
      ],
    },
  ];

  assert.deepEqual(
    getAvailableGCSimCharacters(scripts),
    [Character.FURINA, Character.DURIN].sort((left, right) => left - right)
  );
});

test("the multi-character picker is an accessible keyboard dialog", () => {
  const source = readFileSync(
    "src/features/characters/MultiCharacterSelect.jsx",
    "utf8"
  );

  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /closeButtonRef\.current\?\.focus\(\)/);
  assert.match(source, /previouslyFocused\?\.focus\(\)/);
});
