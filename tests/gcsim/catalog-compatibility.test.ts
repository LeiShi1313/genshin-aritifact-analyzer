import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { Character } from "../../genshin/character";
import { Set } from "../../genshin/set";
import { Weapon } from "../../genshin/weapon";
import { parseScript } from "../../scripts/gcsim";

const readCatalog = (name: string): string[] =>
  JSON.parse(readFileSync(`src/data/gcsim/${name}.json`, "utf8"));

const baseCharacter = "furina char lvl=90/90 cons=0 talent=10,10,10;";

test("every generated GCSIM character maps to an app character enum", () => {
  const failures: string[] = [];

  for (const key of readCatalog("characters")) {
    try {
      const parsed = parseScript(
        `${key} char lvl=90/90 cons=0 talent=10,10,10;`,
        `character:${key}`
      );
      if (parsed.characterInfos[0]?.character === Character.UNRECOGNIZED) {
        failures.push(key);
      }
    } catch {
      failures.push(key);
    }
  }

  assert.deepEqual(failures, []);
});

test("every generated GCSIM weapon maps to an app weapon enum", () => {
  const failures: string[] = [];

  for (const key of readCatalog("weapons")) {
    try {
      const parsed = parseScript(
        `${baseCharacter}\nfurina add weapon="${key}" lvl=90/90 refine=1;`,
        `weapon:${key}`
      );
      if (
        parsed.characterInfos[0]?.weaponInfo?.weapon === Weapon.UNRECOGNIZED
      ) {
        failures.push(key);
      }
    } catch {
      failures.push(key);
    }
  }

  assert.deepEqual(failures, []);
});

test("every generated GCSIM artifact maps to an app set enum", () => {
  const failures: string[] = [];

  for (const key of readCatalog("artifacts")) {
    try {
      const parsed = parseScript(
        `${baseCharacter}\nfurina add set="${key}" count=4;`,
        `artifact:${key}`
      );
      if (parsed.characterInfos[0]?.setInfos[0]?.set === Set.UNRECOGNIZED) {
        failures.push(key);
      }
    } catch {
      failures.push(key);
    }
  }

  assert.deepEqual(failures, []);
});
