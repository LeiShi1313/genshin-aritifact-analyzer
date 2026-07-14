import assert from "node:assert/strict";
import test from "node:test";

import { parseScript } from "../../scripts/gcsim";
import { gcsimScriptToScript } from "../../src/utils/gcsim";

test("serialization preserves labeled stats and target settings", () => {
  const original = parseScript(
    "furina char lvl=90/90 cons=0 talent=10,10,10 start_hp=12345;\n" +
      "furina add stats hp=100 +label=flower;\n" +
      "target particle_element=pyro hp_mult=2.5;",
    "serialization"
  );
  const reparsed = parseScript(
    gcsimScriptToScript(original),
    "serialization:round-trip"
  );

  assert.equal(reparsed.characterInfos[0]?.stats[0]?.label, "flower");
  assert.equal(reparsed.characterInfos[0]?.startHp, 12345);
  assert.equal(
    reparsed.targets[0]?.particleElement,
    original.targets[0]?.particleElement
  );
  assert.equal(reparsed.targets[0]?.hpMult, 2.5);
});
