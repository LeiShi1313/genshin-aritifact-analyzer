import assert from "node:assert/strict";
import test from "node:test";

import { Character } from "../../genshin/character";
import { GCSimScript } from "../../genshin/gcsim";
import { Set } from "../../genshin/set";
import { Weapon } from "../../genshin/weapon";
import { parseScript } from "../../scripts/gcsim";
import { applyAllOverrides, gcsimScriptToScript } from "../../src/utils/gcsim";

test("serialization preserves labeled stats and target settings", () => {
  const original = parseScript(
    "furina char lvl=90/90 cons=0 talent=10,10,10 start_hp=12345;\n" +
      "furina add stats hp=100 label=flower;\n" +
      "target particle_element=pyro hp_mult=2.5;",
    "serialization"
  );
  const serialized = gcsimScriptToScript(original);
  const reparsed = parseScript(serialized, "serialization:round-trip");
  const decoded = GCSimScript.decode(GCSimScript.encode(original).finish());

  assert.match(serialized, /^furina add stats hp=100 label=flower;$/m);
  assert.doesNotMatch(serialized, /\+label=/);
  assert.equal(reparsed.characterInfos[0]?.stats[0]?.label, "flower");
  assert.equal(reparsed.characterInfos[0]?.startHp, 12345);
  assert.equal(
    reparsed.targets[0]?.particleElement,
    original.targets[0]?.particleElement
  );
  assert.equal(reparsed.targets[0]?.hpMult, 2.5);
  assert.equal(decoded.targets[0]?.hpMult, 2.5);
});

test("target fields omitted from source encode as protobuf defaults", () => {
  const original = parseScript("target lvl=100;", "target-defaults");
  const decoded = GCSimScript.decode(GCSimScript.encode(original).finish());

  assert.equal(decoded.targets[0]?.particleElement, 0);
  assert.equal(decoded.targets[0]?.hpMult, 0);
});

test("serialization preserves the engine identity of Aether traveler scripts", () => {
  const original = parseScript(
    "aetherelectro char lvl=90/90 cons=0 talent=1,1,1;\n" +
      "active aetherelectro;",
    "aether-identity"
  );
  const serialized = gcsimScriptToScript(original);
  const decoded = GCSimScript.decode(GCSimScript.encode(original).finish());

  assert.equal(original.characterInfos[0]?.gcsimName, "aetherelectro");
  assert.equal(decoded.characterInfos[0]?.gcsimName, "aetherelectro");
  assert.match(serialized, /^aetherelectro char /m);
  assert.match(serialized, /^active aetherelectro;/m);
  assert.doesNotMatch(serialized, /^lumineelectro char /m);
  assert.doesNotMatch(serialized, /^travelerelectro char /m);
});

test("serialization uses canonical pinned-engine names for app enums", () => {
  const original = parseScript(
    "mizuki char lvl=90/90 cons=0 talent=1,1,1;\n" +
      "amber char lvl=90/90 cons=0 talent=1,1,1;\n" +
      'amber add weapon="rainbowserpentbow" lvl=90/90 refine=1;',
    "canonical-engine-names"
  );
  original.characterInfos[0].gcsimName = "";

  const serialized = gcsimScriptToScript(original);

  assert.match(serialized, /^yumemizukimizuki char /m);
  assert.match(serialized, /weapon="rainbowserpentsrainbow"/);
  assert.doesNotMatch(serialized, /^mizuki char /m);
  assert.doesNotMatch(serialized, /weapon="rainbowserpentbow"/);
});

test("unsupported equipment overrides never enter a GCSIM config", () => {
  const original = parseScript(
    "furina char lvl=90/90 cons=0 talent=10,10,10;\n" +
      'furina add weapon="favoniussword" lvl=90/90 refine=5;\n' +
      'furina add set="goldentroupe" count=4;',
    "unsupported-equipment"
  );
  const overridden = applyAllOverrides(
    original,
    {},
    {
      [Character.FURINA]: {
        enabled: true,
        weapon: { weapon: Weapon.DISASTER_AND_REMORSE },
        sets: [{ set: Set.HEART_OF_THE_FURNACE, count: 4 }],
      },
    }
  );

  assert.equal(
    overridden.characterInfos[0]?.weaponInfo?.weapon,
    Weapon.FAVONIUS_SWORD
  );
  assert.equal(
    overridden.characterInfos[0]?.setInfos[0]?.set,
    Set.GOLDEN_TROUPE
  );
});

test("an explicit empty artifact override clears script stats and set bonuses", () => {
  const original = parseScript(
    "furina char lvl=90/90 cons=0 talent=10,10,10;\n" +
      'furina add set="goldentroupe" count=4;\n' +
      "furina add stats hp=1000;",
    "empty-artifact-override"
  );
  const overridden = applyAllOverrides(
    original,
    {},
    {
      [Character.FURINA]: {
        enabled: true,
        artifacts: [],
      },
    }
  );

  assert.deepEqual(overridden.characterInfos[0]?.stats, []);
  assert.deepEqual(overridden.characterInfos[0]?.setInfos, []);
});
