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

test("the score card leads with one accessible colored integer score and plain-language action", () => {
  const component = readSource("src/features/artifacts/ArtifactScoreCard.jsx");

  assert.match(
    component,
    /presentArtifactScore\(\s*summary,\s*artifact\.level,\s*minimum\s*\)/
  );
  assert.match(component, /text-6xl/);
  assert.match(component, /md:grid-cols-\[auto_minmax\(0,1fr\)_auto\]/);
  assert.match(component, /flex min-w-0 max-w-full items-stretch gap-2 py-1/);
  assert.match(component, /flex min-w-0 flex-1 items-start/);
  assert.match(component, /!showAll && "md:flex-none"/);
  assert.match(component, /font-(bold|black)/);
  assert.match(component, /tabular-nums/);
  assert.match(component, /bg-base-100 text-base-content/);
  assert.match(component, /border-l-8 border-info/);
  assert.match(component, /border-l-8 border-success/);
  assert.match(component, /border-l-8 border-accent/);
  assert.doesNotMatch(component, /bg-info text-info-content/);
  assert.doesNotMatch(component, /bg-success text-success-content/);
  assert.doesNotMatch(component, /bg-accent text-accent-content/);
  assert.doesNotMatch(component, /style:\s*"percent"/);
  assert.doesNotMatch(component, /t\("Prospect Rarity"\)/);
  assert.doesNotMatch(component, /t\("P10"\)/);
  assert.doesNotMatch(component, /t\("P90"\)/);
  assert.doesNotMatch(component, /t\("Upgrade forecast"\)/);
});

test("the score card embeds an unhighlighted ranked character rail", () => {
  const component = readSource("src/features/artifacts/ArtifactScoreCard.jsx");

  assert.match(component, /matchingCharacterScores/);
  assert.match(component, /t\("Matching characters"/);
  assert.match(component, /if \(!bestBuild\) return null/);
  assert.match(component, /DEFAULT_VISIBLE_CHARACTERS = 5/);
  assert.match(component, /slice\(0, DEFAULT_VISIBLE_CHARACTERS\)/);
  assert.match(component, /text-6xl/);
  assert.match(component, /overflow-x-auto/);
  assert.match(component, /const railId = useId\(\)/);
  assert.match(component, /id={railId}/);
  assert.match(component, /aria-controls={railId}/);
  assert.match(component, /aria-expanded={showAll}/);
  assert.equal((component.match(/aria-expanded={showAll}/g) ?? []).length, 1);
  assert.match(component, /onShowAllChange\(!showAll\)/);
  assert.match(component, /scores\.length - DEFAULT_VISIBLE_CHARACTERS/);
  assert.doesNotMatch(component, /<details/);
  assert.doesNotMatch(component, /t\("Matching builds"/);
  assert.doesNotMatch(
    component,
    /score\.buildId === presentation\.primary\.buildId/
  );
});

test("artifact score loading uses the public score terminology", () => {
  const filter = readSource("src/features/artifacts/ArtifactsFilter.jsx");

  assert.match(filter, /t\("Calculating artifact scores"\)/);
  assert.doesNotMatch(filter, /t\("Calculating Build Match"\)/);
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
    "pending-set-eligibility",
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

test("set roles expose one simple keyboard and touch friendly farming tooltip", () => {
  const component = readSource("src/features/artifacts/ArtifactScoreCard.jsx");

  assert.match(component, /useId\(\)/);
  assert.match(component, /aria-describedby={tooltipId}/);
  assert.match(component, /role="tooltip"/);
  assert.match(component, /const tooltipVisible/);
  assert.match(component, /hidden={!tooltipVisible}/);
  assert.match(component, /onMouseEnter=/);
  assert.match(component, /onFocus=/);
  assert.match(component, /setPinned/);
  assert.match(component, /event\.key === "Escape"/);
  assert.match(component, /max-w-\[calc\(100vw-4rem\)\]/);
  assert.match(component, /right-0/);
  assert.doesNotMatch(
    component,
    /aria-expanded={(open|tooltipVisible|pinned)}/
  );
  assert.doesNotMatch(component, /tooltip-open|tooltip-content/);
  assert.match(component, /t\("Set farming estimate", \{ drops \}\)/);
  assert.doesNotMatch(component, /lastArrival|offPieceFactor|tailProbability/);
});

test("set recommendation work has a visible loading state instead of a false empty result", () => {
  const upload = readSource("src/features/artifacts/ArtifactsUpload.jsx");

  assert.match(upload, /setEligibilityIsPending/);
  assert.match(
    upload,
    /setEligibilityIsPending[\s\S]*?<Calculating[\s\S]*?Calculating set recommendations/
  );
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

test("mobile score filters collapse behind a compact accessible summary", () => {
  const filter = readSource("src/features/artifacts/ArtifactsFilter.jsx");

  assert.match(filter, /aria-controls="artifact-score-filter-controls"/);
  assert.match(filter, /aria-expanded={filtersOpen}/);
  assert.match(filter, /filtersOpen \? "grid" : "hidden"/);
  assert.match(filter, /md:grid/);
});

test("expected unscored rows do not visually compete with artifact scores", () => {
  const upload = readSource("src/features/artifacts/ArtifactsUpload.jsx");

  assert.doesNotMatch(upload, /alert alert-warning/);
  assert.match(upload, /bg-base-200 text-base-content/);
});

test("mobile score controls keep short views and sorting on one compact row", () => {
  const sort = readSource("src/features/artifacts/ArtifactSortSelect.jsx");

  assert.match(sort, /{t\("Recommended"\)}/);
  assert.match(sort, /{t\("Other"\)}/);
  assert.match(sort, /{t\("Sort by"\)}/);
  assert.match(sort, /w-full/);
  assert.match(sort, /md:w-auto/);
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
