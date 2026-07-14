import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { isArtifactExportReady } from "../../src/features/artifacts/scoringViewModel";
import { createLatestFileReadGuard } from "../../src/features/builds/latestFileRead";

const readSource = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("the level range can be reopened at its upper collapsed boundary", () => {
  const component = readSource("src/features/inputs/MultiRange.jsx");
  const styles = readSource("src/features/inputs/MultiRange.css");

  assert.doesNotMatch(component, /max - 100/);
  assert.match(component, /thumb--zindex-5/);
  assert.match(styles, /height:\s*28px/);
  assert.match(styles, /\.thumb:focus-visible::/);
});

test("artifact stat values include real accessible stat names", () => {
  const component = readSource("src/features/artifacts/ArtifactCard.jsx");
  const accessibleNames = component.match(/className="sr-only"/g) ?? [];
  assert.ok(accessibleNames.length >= 2);
});

test("invalid artifact enums use fallbacks instead of crashing the warning card", () => {
  const component = readSource("src/features/artifacts/ArtifactCard.jsx");
  assert.match(component, /typeof setName !== "string"/);
  assert.match(component, /typeof mainTypeName === "string"/);
  assert.match(component, /Icon_Inventory_Artifacts/);
});

test("V2 lock export operates only on successfully scored artifacts", () => {
  const component = readSource("src/features/artifacts/ArtifactsUpload.jsx");
  assert.match(
    component,
    /scoredArtifactIndices[\s\S]*lock_indices: scoredArtifactIndices\.filter[\s\S]*unlock_indices: scoredArtifactIndices\.filter/
  );
});

test("lock exports remain blocked until the complete score selection is ready", () => {
  for (const status of [
    "pending-summary",
    "pending-prospect",
    "unavailable",
  ] as const) {
    assert.equal(isArtifactExportReady("GOOD", status), false);
  }
  assert.equal(isArtifactExportReady("MINGYU_LAB", "ready"), false);
  assert.equal(isArtifactExportReady("GOOD", "ready"), true);

  const filter = readSource("src/features/artifacts/ArtifactsFilter.jsx");
  assert.match(
    filter,
    /role="menuitem"[\s\S]{0,160}disabled={downloadDisabled}/
  );
  const upload = readSource("src/features/artifacts/ArtifactsUpload.jsx");
  assert.equal((upload.match(/if \(!exportReady\) return;/g) ?? []).length, 2);
});

test("long translated download states can wrap inside the mobile split button", () => {
  const filter = readSource("src/features/artifacts/ArtifactsFilter.jsx");
  const splitButtonClass = filter.match(
    /className="([^"]*whitespace-normal[^"]*)"/
  )?.[1];
  assert.ok(splitButtonClass);
  for (const className of [
    "h-auto",
    "min-h-12",
    "min-w-0",
    "flex-1",
    "shrink",
    "whitespace-normal",
  ]) {
    assert.ok(splitButtonClass.split(/\s+/).includes(className));
  }
  assert.match(filter, /dropdown dropdown-end flex shrink-0 self-stretch/);
});

test("the add-substat selector has an accessible name", () => {
  const component = readSource("src/features/builds/SubAttributesEditor.jsx");
  assert.match(
    component,
    /<select[\s\S]{0,160}aria-label={t\("Add substat"\)}/
  );
});

test("only the latest build-backup read may update the import dialog", () => {
  const guard = createLatestFileReadGuard();
  const firstRead = guard.begin();
  const secondRead = guard.begin();

  assert.equal(guard.isCurrent(firstRead), false);
  assert.equal(guard.isCurrent(secondRead), true);

  guard.invalidate();
  assert.equal(guard.isCurrent(secondRead), false);

  const component = readSource("src/features/builds/RestoreBuildsModal.jsx");
  assert.match(component, /fileReader\?\.readyState === 1/);
  assert.match(component, /if \(!isCurrentRead\(\)\) return;/);
  assert.match(component, /useEffect\(\(\) => \(\) => abortPendingRead\(\)/);
});
