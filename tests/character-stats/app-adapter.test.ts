import assert from "node:assert/strict";
import test from "node:test";

import type { Artifact } from "../../src/genshin/artifact";
import {
  AttributePosition,
  AttributeType,
} from "../../src/genshin/attribute";
import { Character } from "../../src/genshin/character";
import { Set as ArtifactSet } from "../../src/genshin/set";
import { Weapon } from "../../src/genshin/weapon";
import {
  adaptAppCharacterSheetLoadout,
  toAppCharacterStatAttributes,
} from "../../src/utils/characterStats/appAdapter";

const artifact = (
  position: AttributePosition,
  mainType: AttributeType,
  mainValue: number,
  subType = AttributeType.CRIT_RATE,
  subValue = 0.031
): Artifact => ({
  set: ArtifactSet.EMBLEM_OF_SEVERED_FATE,
  star: 5,
  level: 20,
  position,
  mainAttribute: { type: mainType, value: mainValue },
  subAttributes: [{ type: subType, value: subValue }],
  character: Character.RAIDEN_SHOGUN,
  locked: false,
});

test("adapts protobuf identifiers, progression, slots, sets, and resolved artifact values", () => {
  const result = adaptAppCharacterSheetLoadout({
    character: {
      character: Character.RAIDEN_SHOGUN,
      level: 90,
      ascension: 6,
    },
    weapon: {
      weapon: Weapon.ENGULFING_LIGHTNING,
      level: 90,
      ascension: 6,
      refinement: 2,
    },
    artifacts: [
      artifact(AttributePosition.FLOWER, AttributeType.HP, 4780),
      undefined,
      artifact(
        AttributePosition.SANDS,
        AttributeType.ENERGY_RECHARGE,
        0.518,
        AttributeType.ATK_PERCENT,
        0.058
      ),
    ],
  });

  assert.equal(result.status, "ok");
  if (result.status !== "ok") return;
  assert.deepEqual(result.loadout.character, {
    key: "raiden_shogun",
    level: 90,
    ascension: 6,
  });
  assert.deepEqual(result.loadout.weapon, {
    key: "engulfing_lightning",
    level: 90,
    ascension: 6,
    refinement: 2,
  });
  assert.deepEqual(result.loadout.artifacts[0], {
    slot: "flower",
    setKey: "emblem_of_severed_fate",
    mainStat: { stat: "hpFlat", value: 4780 },
    substats: [{ stat: "critRate", value: 0.031 }],
  });
  assert.deepEqual(result.loadout.artifacts[1], {
    slot: "sands",
    setKey: "emblem_of_severed_fate",
    mainStat: { stat: "energyRecharge", value: 0.518 },
    substats: [{ stat: "attackPercent", value: 0.058 }],
  });
});

test("rejects unsupported protobuf artifact fields instead of silently dropping them", () => {
  const result = adaptAppCharacterSheetLoadout({
    character: {
      character: Character.RAIDEN_SHOGUN,
      level: 90,
      ascension: 6,
    },
    weapon: null,
    artifacts: [
      artifact(
        AttributePosition.ATTRIBUTE_POSITION_UNSPECIFIED,
        AttributeType.ATTRIBUTE_TYPE_UNSPECIFIED,
        1
      ),
    ],
  });

  assert.equal(result.status, "invalid");
  if (result.status !== "invalid") return;
  assert.deepEqual(
    result.issues.map(({ code }) => code),
    ["UNSUPPORTED_ARTIFACT_POSITION", "UNSUPPORTED_ARTIFACT_STAT"]
  );
});

test("presents calculated stats in a stable character-sheet order", () => {
  const rows = toAppCharacterStatAttributes(
    {
      maxHp: 20500.4,
      attack: 1860.2,
      defense: 830.8,
      elementalMastery: 117,
      energyRecharge: 2.478,
      critRate: 0.712,
      critDamage: 1.426,
      healingBonus: 0,
      shieldStrength: 0,
      damageBonus: {
        anemo: 0,
        cryo: 0,
        dendro: 0,
        electro: 0.466,
        geo: 0,
        hydro: 0,
        pyro: 0,
        physical: 0,
      },
    },
    "electro"
  );

  assert.deepEqual(
    rows.map(({ type }) => type),
    [
      AttributeType.HP,
      AttributeType.ATK,
      AttributeType.DEF,
      AttributeType.ELEMENTAL_MASTERY,
      AttributeType.CRIT_RATE,
      AttributeType.CRIT_DAMAGE,
      AttributeType.ENERGY_RECHARGE,
      AttributeType.ELECTRO_DAMAGE_BONUS,
    ]
  );
  assert.deepEqual(
    rows.map(({ value }) => value),
    [20500.4, 1860.2, 830.8, 117, 0.712, 1.426, 2.478, 0.466]
  );
});
