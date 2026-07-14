import assert from "node:assert/strict";
import test from "node:test";

import type { Artifact } from "../../src/genshin/artifact";
import { AttributePosition, AttributeType } from "../../src/genshin/attribute";
import type { Build } from "../../src/genshin/build";
import { canonicalizeArtifact } from "../../src/utils/artifactScoring/canonicalize";
import { calculateArtifactPotential } from "../../src/utils/artifactScoring/evaluation";
import { evaluateExpectedBuildMatchAt20 } from "../../src/utils/artifactScoring/expected";
import { validateBuild } from "../../src/utils/artifactScoring/validation";

const artifact: Artifact = {
  set: 0,
  star: 5,
  level: 0,
  position: AttributePosition.SANDS,
  mainAttribute: { type: AttributeType.ATK_PERCENT, value: 0 },
  subAttributes: [
    { type: AttributeType.CRIT_RATE, value: 0.027 },
    { type: AttributeType.CRIT_DAMAGE, value: 0.054 },
    { type: AttributeType.HP_PERCENT, value: 0.041 },
  ],
  character: 0,
  locked: false,
};
const build: Build = {
  name: "test",
  character: 0,
  weapons: [],
  suits: [],
  flowerAttributes: [AttributeType.HP],
  plumeAttributes: [AttributeType.ATK],
  sandsAttributes: [AttributeType.ATK_PERCENT],
  gobletAttributes: [],
  circletAttributes: [],
  subAttributes: [
    { type: AttributeType.CRIT_RATE, value: 1 },
    { type: AttributeType.CRIT_DAMAGE, value: 1 },
    { type: AttributeType.ENERGY_RECHARGE, value: 1 },
    { type: AttributeType.ELEMENTAL_MASTERY, value: 1 },
  ],
};

test("the exact Potential PMF has the same expectation as the closed form", () => {
  const canonical = canonicalizeArtifact(artifact);
  const validated = validateBuild(build, "build");
  if (canonical.status !== "ok" || validated.status !== "ok") {
    assert.fail("fixture did not validate");
  }

  const potential = calculateArtifactPotential(
    canonical.artifact,
    validated.profile
  );
  const closedForm = evaluateExpectedBuildMatchAt20(
    canonical.artifact,
    validated.profile
  );
  assert.ok(Math.abs(potential.expectedFinalMatch - closedForm.value) <= 1e-12);
  assert.ok(potential.p10FinalMatch <= potential.medianFinalMatch);
  assert.ok(potential.medianFinalMatch <= potential.p90FinalMatch);
});
