import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  hasValidLazyRequestIdentity,
  scoringRequestIdOrUnknown,
} from "../../src/workers/artifactScoringProtocol";

const source = readFileSync(
  new URL(
    "../../src/features/artifacts/useArtifactScoringSession.ts",
    import.meta.url
  ),
  "utf8"
);
const workerSource = readFileSync(
  new URL("../../src/workers/calculator.ts", import.meta.url),
  "utf8"
);

test("creates the scoring Worker in an effect so Strict Mode can replace it", () => {
  assert.match(source, /useEffect\(\(\) => \{[\s\S]*new Worker\(/);
  assert.doesNotMatch(source, /useMemo\([\s\S]{0,200}new Worker\(/);
  assert.match(source, /return \(\) => nextWorker\.terminate\(\)/);
  assert.match(source, /catch \{\s*setWorker\(null\)/);
});

test("cleans cancellation ids and ignores cancellation after completion", () => {
  assert.match(
    workerSource,
    /const requestWasCancelled = cancelled\.delete\(request\.requestId\);\s*if \(!snapshot \|\| requestWasCancelled\)/
  );
  assert.match(
    workerSource,
    /activeSummaryRequest === request\.requestId \|\|\s*activeLazyRequests\.has\(request\.requestId\)/
  );
});

test("validates lazy request identity before snapshot lookup", () => {
  const valid = {
    type: "prospect",
    requestId: "prospect-1",
    datasetId: "data",
    summaryKey: "summary",
  };
  assert.equal(hasValidLazyRequestIdentity(valid, "prospect"), true);
  assert.equal(
    hasValidLazyRequestIdentity(
      { ...valid, type: "setEligibility" },
      "setEligibility"
    ),
    true
  );
  assert.equal(
    hasValidLazyRequestIdentity({ ...valid, requestId: {} }, "prospect"),
    false
  );
  assert.equal(
    hasValidLazyRequestIdentity({ ...valid, datasetId: "" }, "prospect"),
    false
  );
  assert.equal(
    hasValidLazyRequestIdentity(
      { ...valid, summaryKey: undefined },
      "prospect"
    ),
    false
  );
  assert.equal(scoringRequestIdOrUnknown({}), "unknown");
  assert.match(
    workerSource,
    /hasValidLazyRequestIdentity\(request, "prospect"\)[\s\S]*snapshotMatches\(request\)/
  );
});

test("empty inputs cancel work and reset the retained UI snapshot", () => {
  assert.match(
    source,
    /if \(artifacts\.length === 0 \|\| builds\.length === 0\) \{\s*dispatch\(\{ type: "reset" \}\)/
  );
});

test("the Worker uses the shared calibrated set references", () => {
  assert.match(workerSource, /SET_ELIGIBILITY_REFERENCES/);
  assert.doesNotMatch(workerSource, /\[0,\s*75\]|\[20,\s*80\]/);
});
