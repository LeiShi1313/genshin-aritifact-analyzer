import assert from "node:assert/strict";
import test from "node:test";

import { createDatabaseQuery } from "../../scripts/scrape-gcsim.mjs";

test("the scraper requests the complete valid database without tag filters", () => {
  assert.deepEqual(createDatabaseQuery(200, 100), {
    query: {},
    project: { _id: 1, config: 1 },
    sort: { _id: 1 },
    limit: 100,
    skip: 200,
  });
});
