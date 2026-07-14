import assert from "node:assert/strict";
import test from "node:test";

import { GCSim, GCSimScript } from "../../src/genshin/gcsim";
import {
  beginGCSimFetch,
  completeGCSimFetch,
  decodeGCSimScripts,
  failGCSimFetch,
  initialGCSimState,
  shouldStartGCSimFetch,
} from "../../src/store/reducers/gcsimState";

const script = GCSimScript.create({ scripts: ["attack;"] });

test("GCSIM script payloads are decoded before they enter Redux state", () => {
  const payload = GCSim.encode(GCSim.create({ scripts: [script] })).finish();

  assert.deepEqual(decodeGCSimScripts(payload), [script]);
  assert.throws(() => decodeGCSimScripts(new Uint8Array()), /catalog is empty/);
  assert.throws(
    () => decodeGCSimScripts(new Uint8Array([0x0a, 0xff])),
    /index out of range|invalid wire type|premature EOF/i
  );
});

test("GCSIM loading state is recoverable and retains a previous catalog", () => {
  let state = initialGCSimState;
  assert.equal(state.status, "idle");
  assert.equal(state.error, null);
  assert.equal(state.currentRequestId, null);

  state = beginGCSimFetch(
    {
      scripts: [script],
      status: "ready",
      error: null,
      currentRequestId: null,
    },
    "request-1"
  );
  assert.equal(state.status, "loading");
  assert.deepEqual(state.scripts, [script]);

  state = failGCSimFetch(state, "network unavailable", "request-1");
  assert.equal(state.status, "error");
  assert.equal(state.error, "network unavailable");
  assert.deepEqual(state.scripts, [script]);

  state = beginGCSimFetch(state, "request-2");
  state = completeGCSimFetch(state, [script], "request-2");
  assert.equal(state.status, "ready");
  assert.equal(state.error, null);
  assert.deepEqual(state.scripts, [script]);
});

test("stale GCSIM responses cannot overwrite the latest request", () => {
  const newerScript = GCSimScript.create({ scripts: ["skill;"] });
  let state = beginGCSimFetch(initialGCSimState, "older");
  state = beginGCSimFetch(state, "newer");

  const afterOldSuccess = completeGCSimFetch(state, [script], "older");
  assert.equal(afterOldSuccess.status, "loading");
  assert.deepEqual(afterOldSuccess.scripts, []);

  state = completeGCSimFetch(afterOldSuccess, [newerScript], "newer");
  assert.equal(state.status, "ready");
  assert.deepEqual(state.scripts, [newerScript]);

  const afterOldFailure = failGCSimFetch(state, "late network error", "older");
  assert.equal(afterOldFailure.status, "ready");
  assert.equal(afterOldFailure.error, null);
  assert.deepEqual(afterOldFailure.scripts, [newerScript]);
});

test("an in-flight GCSIM catalog request is not started twice", () => {
  assert.equal(shouldStartGCSimFetch(initialGCSimState), true);
  assert.equal(
    shouldStartGCSimFetch(beginGCSimFetch(initialGCSimState, "active")),
    false
  );
});
