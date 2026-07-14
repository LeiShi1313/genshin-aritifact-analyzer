import assert from "node:assert/strict";
import test from "node:test";

import { ByteBudgetLruCache } from "../../src/utils/artifactScoring/cache";

test("evicts least-recently-used entries within its byte budget", () => {
  const cache = new ByteBudgetLruCache<string>(10);
  cache.set("first", "a", 4);
  cache.set("second", "b", 4);
  assert.equal(cache.get("first"), "a");
  cache.set("third", "c", 4);

  assert.equal(cache.get("second"), undefined);
  assert.equal(cache.get("first"), "a");
  assert.equal(cache.get("third"), "c");
  assert.equal(cache.sizeBytes, 8);
});

test("does not retain a single entry larger than the cache", () => {
  const cache = new ByteBudgetLruCache<string>(4);
  cache.set("large", "value", 5);
  assert.equal(cache.size, 0);
});
