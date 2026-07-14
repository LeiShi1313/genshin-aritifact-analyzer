import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { Character, characterFromJSON } from "../../genshin/character";
import { Set, setFromJSON } from "../../genshin/set";
import { Weapon, weaponFromJSON } from "../../genshin/weapon";
import { parseScript } from "../../scripts/gcsim";

const readCatalog = (name: string): string[] =>
  JSON.parse(readFileSync(`src/data/gcsim/${name}.json`, "utf8"));

const readRecord = (name: string): Record<string, string> =>
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

test("capabilities only expose app data that the pinned GCSIM can serialize", () => {
  const capabilities = JSON.parse(
    readFileSync("src/data/gcsim/capabilities.json", "utf8")
  ) as Record<"characters" | "artifacts" | "weapons", Record<string, string>>;
  const appData = {
    characters: readRecord("../characters"),
    artifacts: readRecord("../sets"),
    weapons: readRecord("../weapons"),
  };
  const aliases = {
    characters: readRecord("characters-aliases"),
    artifacts: readRecord("artifacts-aliases"),
    weapons: readRecord("weapons-aliases"),
  };

  for (const category of Object.keys(capabilities) as Array<
    keyof typeof capabilities
  >) {
    for (const [appKey, serializerName] of Object.entries(
      capabilities[category]
    )) {
      assert.ok(appKey in appData[category], `${category}:${appKey}`);
      assert.ok(
        serializerName in aliases[category],
        `${category}:${appKey} has no serializer alias ${serializerName}`
      );
    }
  }

  assert.ok("durin" in capabilities.characters);
  assert.ok("nicole" in capabilities.characters);
  assert.ok(!("sandrone" in capabilities.characters));

  for (const [appKey, serializerName] of Object.entries(
    capabilities.characters
  )) {
    const parsed = parseScript(
      `${serializerName} char lvl=90/90 cons=0 talent=10,10,10;`,
      `capability:character:${appKey}`
    );
    assert.equal(
      parsed.characterInfos[0]?.character,
      characterFromJSON(appKey.toUpperCase()),
      appKey
    );
  }

  for (const [appKey, serializerName] of Object.entries(
    capabilities.weapons
  )) {
    const parsed = parseScript(
      `${baseCharacter}\nfurina add weapon="${serializerName}" lvl=90/90 refine=1;`,
      `capability:weapon:${appKey}`
    );
    assert.equal(
      parsed.characterInfos[0]?.weaponInfo?.weapon,
      weaponFromJSON(appKey.toUpperCase()),
      appKey
    );
  }

  for (const [appKey, serializerName] of Object.entries(
    capabilities.artifacts
  )) {
    const parsed = parseScript(
      `${baseCharacter}\nfurina add set="${serializerName}" count=4;`,
      `capability:artifact:${appKey}`
    );
    assert.equal(
      parsed.characterInfos[0]?.setInfos[0]?.set,
      setFromJSON(appKey.toUpperCase()),
      appKey
    );
  }
});
