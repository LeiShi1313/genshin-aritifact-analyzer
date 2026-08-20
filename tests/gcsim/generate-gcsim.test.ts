import assert from "node:assert/strict";
import test from "node:test";

import {
  addAppAliases,
  buildAliasMap,
  parseCatalogRecords,
} from "../../scripts/generate-gcsim.mjs";

test("buildAliasMap includes every canonical key from a Set", () => {
  const aliases = buildAliasMap(new Set(["durin"]), '"d": keys.Durin,');

  assert.deepEqual(aliases, {
    d: "durin",
    durin: "durin",
  });
});

test("canonical self aliases do not overwrite explicit upstream mappings", () => {
  const aliases = buildAliasMap(
    new Set(["sunnymorning"]),
    '"sunnymorning": keys.SunnyMorningSleepIn,'
  );

  assert.equal(aliases.sunnymorning, "sunnymorningsleepin");
});

test("generated GCSIM catalogs provide canonical keys and game ids", () => {
  const source = `
var CharacterMap = map[keys.Char]*model.AvatarData{
  keys.Aino: {
    Id: 10000121,
    SubId: 12101,
    Key: "aino",
  },
  keys.Amber: {
    Id: 10000021,
    SubId: 2101,
    Key: "amber",
  },
}`;

  assert.deepEqual(parseCatalogRecords(source, "Id", "characters"), [
    { key: "aino", gameId: 10000121 },
    { key: "amber", gameId: 10000021 },
  ]);
});

test("generated GCSIM catalog parsing fails closed on schema drift", () => {
  assert.throws(
    () =>
      parseCatalogRecords(
        `keys.Future: {\n  Id: 10000999,\n  RenamedKey: "future",\n},`,
        "Id",
        "characters"
      ),
    /could not parse every characters record/
  );
});

test("app enum names become serializer aliases through stable game ids", () => {
  const aliases = { mizuki: "mizuki" };
  const capabilities = addAppAliases(
    [{ key: "mizuki", gameId: 10000109 }],
    aliases,
    new Map([[10000109, "yumemizuki_mizuki"]])
  );

  assert.deepEqual(aliases, {
    mizuki: "mizuki",
    yumemizukimizuki: "mizuki",
  });
  assert.deepEqual(capabilities, {
    yumemizuki_mizuki: "mizuki",
  });
});

test("engine names do not leak app-only enum spelling", () => {
  const aliases = { lanyan: "lan_yan" };
  const capabilities = addAppAliases(
    [{ key: "lanyan", gameId: 10000108 }],
    aliases,
    new Map([[10000108, "lan_yan"]])
  );

  assert.deepEqual(capabilities, { lan_yan: "lanyan" });
});

test("app alias generation fails when a supported id has no app enum", () => {
  assert.throws(
    () => addAppAliases([{ key: "future", gameId: 99999999 }], {}, new Map()),
    /GCSIM key "future" with game id 99999999 has no app enum/
  );
});

test("app alias generation rejects an existing serializer alias for another enum", () => {
  assert.throws(
    () =>
      addAppAliases(
        [
          { key: "wrong", gameId: 1 },
          { key: "right", gameId: 2 },
        ],
        { appname: "wrong" },
        new Map([
          [1, "other_app"],
          [2, "app_name"],
        ])
      ),
    /serializer alias "appname" points to "wrong" instead of "right"/
  );
});

test("app alias generation allows aliases shared by equivalent traveler configs", () => {
  const aliases = { traveleranemo: "lumineanemo" };
  const capabilities = addAppAliases(
    [
      { key: "aetheranemo", gameId: 10000005 },
      { key: "lumineanemo", gameId: 10000007 },
    ],
    aliases,
    new Map(),
    () => "traveler_anemo"
  );

  assert.equal(aliases.traveleranemo, "lumineanemo");
  assert.deepEqual(capabilities, {
    traveler_anemo: "lumineanemo",
  });
});
