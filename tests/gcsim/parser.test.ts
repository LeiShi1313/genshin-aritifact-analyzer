import assert from "node:assert/strict";
import test from "node:test";

import { gcsimCharacterToCharacter, parseScript } from "../../scripts/gcsim";
import { Character } from "../../genshin/character";
import { Weapon } from "../../genshin/weapon";

const characterLine = "furina char lvl=90/90 cons=0 talent=10,10,10;";

test("unknown character aliases fail with the source id", () => {
  assert.throws(
    () =>
      parseScript(
        "notreal char lvl=90/90 cons=0 talent=10,10,10;",
        "bad-character"
      ),
    /bad-character: unknown character alias \"notreal\"/
  );
});

test("unknown weapon aliases fail with the source id", () => {
  assert.throws(
    () =>
      parseScript(
        `${characterLine}\nfurina add weapon=\"notreal\" lvl=90/90 refine=1;`,
        "bad-weapon"
      ),
    /bad-weapon: unknown weapon alias \"notreal\"/
  );
});

test("unknown artifact set aliases fail with the source id", () => {
  assert.throws(
    () =>
      parseScript(
        `${characterLine}\nfurina add set=\"notreal\" count=4;`,
        "bad-set"
      ),
    /bad-set: unknown artifact set alias \"notreal\"/
  );
});

test("known GCSIM weapon names map to the app enum", () => {
  const parsed = parseScript(
    `${characterLine}\nfurina add weapon=\"rainbowserpentbow\" lvl=90/90 refine=1;`,
    "rainbow-serpent"
  );

  assert.equal(
    parsed.characterInfos[0]?.weaponInfo?.weapon,
    Weapon.RAINBOW_SERPENTS_RAIN_BOW
  );
});

test("canonical characters missing from app data fail before encoding", () => {
  assert.throws(
    () => gcsimCharacterToCharacter("not_in_app_data", "missing-character"),
    /missing-character: GCSIM character "not_in_app_data" is not available in app data/
  );
});

test("pipeline canonical character names map to app enums", () => {
  assert.equal(
    gcsimCharacterToCharacter("kaedeharakazuha", "pipeline-catalog"),
    Character.KAEDEHARA_KAZUHA
  );
});

test("target parsing supports negative positions without consuming action identifiers", () => {
  const parsed = parseScript(
    `${characterLine}\n` +
      "target lvl=100 pos=-1.2, 1.1 resist=0.1;\n" +
      "let cur_target = 1;\n" +
      "set_default_target(2);",
    "target-actions"
  );

  assert.deepEqual(parsed.targets[0]?.position, [-1.2, 1.1]);
  assert.deepEqual(parsed.scripts, [
    "let cur_target = 1;",
    "set_default_target(2);",
  ]);
});

test("character parsing preserves start_hp", () => {
  const parsed = parseScript(
    "furina char lvl=90/90 cons=0 talent=10,10,10 start_hp=12345;",
    "start-hp"
  );

  assert.equal(parsed.characterInfos[0]?.startHp, 12345);
});
