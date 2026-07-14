import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("WASM build pins its toolchain and removes nondeterministic metadata", () => {
  const source = readFileSync("scripts/build-wasm.sh", "utf8");

  assert.match(source, /GOTOOLCHAIN=/);
  assert.match(source, /-trimpath/);
  assert.match(source, /-buildvcs=false/);
  assert.match(source, /-buildid=/);
  assert.match(source, /gzip -n -9/);
  assert.doesNotMatch(source, /command -v wasm-opt/);
});
