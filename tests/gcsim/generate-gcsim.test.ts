import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAliasMap,
  extractConfigKey,
} from "../../scripts/generate-gcsim.mjs";

test("buildAliasMap includes every canonical key from a Set", () => {
  const aliases = buildAliasMap(new Set(["durin"]), '"d": keys.Durin,');

  assert.deepEqual(aliases, {
    d: "durin",
    durin: "durin",
  });
});

test("extractConfigKey falls back to the config parent directory", () => {
  assert.equal(
    extractConfigKey(
      "# config without an explicit key",
      "/repo/gcsim/internal/characters/durin/config.yml"
    ),
    "durin"
  );
});
