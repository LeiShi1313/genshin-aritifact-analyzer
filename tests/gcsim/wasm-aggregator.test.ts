import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const workerSource = ts.transpileModule(
  readFileSync("src/gcsim/executors/Workers/aggregator.ts", "utf8"),
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }
).outputText;

const flushWorker = (response: { result: string; hash: string } | string) => {
  const messages: unknown[] = [];
  const worker = {
    self: { importScripts: () => {} },
    flush: () => response,
    postMessage: (message: unknown) => messages.push(message),
    onmessage: (_event: { data: { type: string } }) => {},
  };
  runInNewContext(workerSource, worker);
  worker.onmessage({ data: { type: "flush" } });
  return JSON.parse(JSON.stringify(messages));
};

test("the aggregator forwards statistics and the hash from the pinned WASM result", () => {
  const statistics = { iterations: 100, dps: { mean: 12345 } };
  assert.deepEqual(
    flushWorker({
      result: JSON.stringify({
        statistics,
        simulator_settings: { iterations: 100 },
      }),
      hash: "fixture-hash",
    }),
    [{ type: "result", result: { stats: statistics, hash: "fixture-hash" } }]
  );
});

test("the aggregator forwards WASM errors instead of leaving the simulation pending", () => {
  assert.deepEqual(flushWorker(JSON.stringify({ error: "fixture failure" })), [
    { type: "failed", reason: "fixture failure" },
  ]);
});
