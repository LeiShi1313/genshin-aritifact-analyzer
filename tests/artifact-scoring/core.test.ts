import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";

import type { Artifact } from "../../src/genshin/artifact";
import {
  AttributePosition,
  AttributeType,
  type Attribute,
} from "../../src/genshin/attribute";
import type { Build } from "../../src/genshin/build";
import { canonicalizeArtifact } from "../../src/utils/artifactScoring/canonicalize";
import { evaluateExpectedBuildMatchAt20 } from "../../src/utils/artifactScoring/expected";
import { evaluateBuildMatch } from "../../src/utils/artifactScoring/match";
import {
  FIVE_STAR_ROLL_LOOKUP_SIZES,
  getCanonicalRoll,
  getFiveStarRollLookup,
} from "../../src/utils/artifactScoring/rollData";
import { validateBuild } from "../../src/utils/artifactScoring/validation";

const attribute = (type: AttributeType, value: number): Attribute => ({
  type,
  value,
});

const artifact = (
  mainType: AttributeType,
  subAttributes: Attribute[],
  overrides: Partial<Artifact> = {}
): Artifact => ({
  set: 0,
  star: 5,
  level: 0,
  position: AttributePosition.SANDS,
  mainAttribute: attribute(mainType, 0),
  subAttributes,
  character: 0,
  locked: false,
  ...overrides,
});

const build = (
  subAttributes: Attribute[] = [
    attribute(AttributeType.CRIT_RATE, 1),
    attribute(AttributeType.CRIT_DAMAGE, 1),
    attribute(AttributeType.ENERGY_RECHARGE, 1),
    attribute(AttributeType.ELEMENTAL_MASTERY, 1),
  ],
  overrides: Partial<Build> = {}
): Build => ({
  name: "ATK sands",
  character: 0,
  weapons: [],
  suits: [],
  flowerAttributes: [AttributeType.HP],
  plumeAttributes: [AttributeType.ATK],
  sandsAttributes: [AttributeType.ATK_PERCENT],
  gobletAttributes: [],
  circletAttributes: [],
  subAttributes,
  ...overrides,
});

const requireCanonicalArtifact = (input: Artifact) => {
  const result = canonicalizeArtifact(input);
  if (result.status !== "ok") assert.fail(JSON.stringify(result));
  return result.artifact;
};

const requireProfile = (input: Build, id = "build-1") => {
  const result = validateBuild(input, id);
  if (result.status !== "ok") assert.fail(JSON.stringify(result));
  return result.profile;
};

describe("five-star canonical roll lookup", () => {
  it("maps protobuf percentage fractions to the documented canonical totals", () => {
    const examples: Array<
      readonly [AttributeType, number, number, readonly number[]]
    > = [
      [AttributeType.CRIT_RATE, 0.027, 7, [1]],
      [AttributeType.CRIT_RATE, 0.039, 10, [1]],
      [AttributeType.CRIT_RATE, 0.086, 22, [3]],
      [AttributeType.CRIT_RATE, 0.109, 28, [3, 4]],
      [AttributeType.CRIT_RATE, 0.194, 50, [5, 6]],
      [AttributeType.CRIT_RATE, 0.233, 60, [6]],
      [AttributeType.DEF_PERCENT, 0.241, 33, [4]],
      [AttributeType.ENERGY_RECHARGE, 0.389, 60, [6]],
    ];

    for (const [type, value, rollValuePoints, possibleRollCounts] of examples) {
      const result = getCanonicalRoll(type, value);
      if (result.status !== "ok") {
        assert.fail(
          `${AttributeType[type]} ${value}: ${JSON.stringify(result)}`
        );
      }
      assert.equal(result.rollValuePoints, rollValuePoints);
      assert.deepEqual(result.possibleRollCounts, possibleRollCounts);
    }
  });

  it("generates every stat lookup with the pinned float32 accumulation sizes", () => {
    assert.deepEqual(FIVE_STAR_ROLL_LOOKUP_SIZES, {
      [AttributeType.HP]: 51,
      [AttributeType.ATK]: 52,
      [AttributeType.DEF]: 52,
      [AttributeType.HP_PERCENT]: 58,
      [AttributeType.ATK_PERCENT]: 58,
      [AttributeType.DEF_PERCENT]: 56,
      [AttributeType.ELEMENTAL_MASTERY]: 51,
      [AttributeType.ENERGY_RECHARGE]: 59,
      [AttributeType.CRIT_RATE]: 53,
      [AttributeType.CRIT_DAMAGE]: 58,
    });
  });

  it("matches every entry in the pinned Genshin Optimizer exhaustive fixture", () => {
    // SHA-256 of sorted [display key, nominal points, compatible counts] tuples
    // derived from artifact_sub_rolls.json at the pinned generator commit.
    const fixtureDigests: Readonly<Partial<Record<AttributeType, string>>> = {
      [AttributeType.HP]:
        "0844957e62db2affed65977a32ca6015289b0bf41b1381a893b9680f1a44acd8",
      [AttributeType.ATK]:
        "b2598b388138c9b89a728c0d074c806db9533b742fdd62bf51514f14d6c384e2",
      [AttributeType.DEF]:
        "9aeff28a87b863c9b12fbb265799c9494ff3c1c12a77cee065ff96d2221ecade",
      [AttributeType.HP_PERCENT]:
        "a70c6079a63c5d541126ffd5ea735b71cda6666714adf3d565d557aa9aa29da9",
      [AttributeType.ATK_PERCENT]:
        "a70c6079a63c5d541126ffd5ea735b71cda6666714adf3d565d557aa9aa29da9",
      [AttributeType.DEF_PERCENT]:
        "217b06505b1b9d5f1b85e4e1147cb3a63feeef9a79002f36cd5f8545cf1ec3e1",
      [AttributeType.ELEMENTAL_MASTERY]:
        "2ed494319fd82fa5ebb8411d052af96d4e8043790373df2647790e9d323e57ad",
      [AttributeType.ENERGY_RECHARGE]:
        "84d24d95cb9506464a8bce2b3a407e7cd4e6255799b8ed0c4b9c6eb91979fdb7",
      [AttributeType.CRIT_RATE]:
        "5a0ad68cbb6d792c6ed8b981ad5fa0b35db1a5fccea05741b80ca9031716214b",
      [AttributeType.CRIT_DAMAGE]:
        "b3fb719a2af839f5ad20640e66cb0b1693c4d668dbe2fcc3fb6ed0eb3526a71f",
    };

    for (const [typeText, fixtureDigest] of Object.entries(fixtureDigests)) {
      const type = Number(typeText) as AttributeType;
      const lookup = getFiveStarRollLookup(type);
      assert.ok(lookup);
      const tuples = [...lookup.values()]
        .map((entry) => [
          entry.displayValueKey,
          entry.rollValuePoints,
          entry.possibleRollCounts,
        ])
        .sort(([left], [right]) => Number(left) - Number(right));
      const actualDigest = createHash("sha256")
        .update(JSON.stringify(tuples))
        .digest("hex");
      assert.equal(actualDigest, fixtureDigest, AttributeType[type]);
    }
  });

  it("accepts float32 transport noise but rejects off-grid and impossible values", () => {
    assert.equal(
      getCanonicalRoll(AttributeType.CRIT_RATE, Math.fround(0.039)).status,
      "ok"
    );
    assert.deepEqual(getCanonicalRoll(AttributeType.CRIT_RATE, 0.0391), {
      status: "invalid-display-value",
    });
    assert.deepEqual(getCanonicalRoll(AttributeType.CRIT_RATE, 0.04), {
      status: "impossible-roll-value",
      displayValueKey: 40,
    });
    assert.deepEqual(getCanonicalRoll(AttributeType.HP, 209.1), {
      status: "invalid-display-value",
    });
  });
});

describe("artifact and build validation", () => {
  it("returns an explicit unsupported result for non-five-star artifacts", () => {
    const result = canonicalizeArtifact(
      artifact(
        AttributeType.ATK_PERCENT,
        [
          attribute(AttributeType.CRIT_RATE, 0.027),
          attribute(AttributeType.CRIT_DAMAGE, 0.054),
          attribute(AttributeType.HP_PERCENT, 0.041),
        ],
        { star: 4 }
      )
    );

    assert.equal(result.status, "unsupported");
    assert.deepEqual(
      result.issues.map((issue) => issue.code),
      ["UNSUPPORTED_ARTIFACT_STAR_RARITY"]
    );
  });

  it("rejects duplicate, main-equal, and jointly impossible roll histories", () => {
    const duplicate = canonicalizeArtifact(
      artifact(AttributeType.ATK_PERCENT, [
        attribute(AttributeType.CRIT_RATE, 0.027),
        attribute(AttributeType.CRIT_RATE, 0.031),
        attribute(AttributeType.HP_PERCENT, 0.041),
      ])
    );
    assert.equal(duplicate.status, "invalid");
    assert.ok(
      duplicate.issues.some((issue) => issue.code === "DUPLICATE_SUBSTAT")
    );

    const equalsMain = canonicalizeArtifact(
      artifact(AttributeType.ATK_PERCENT, [
        attribute(AttributeType.ATK_PERCENT, 0.041),
        attribute(AttributeType.CRIT_RATE, 0.027),
        attribute(AttributeType.CRIT_DAMAGE, 0.054),
      ])
    );
    assert.equal(equalsMain.status, "invalid");
    assert.ok(
      equalsMain.issues.some(
        (issue) => issue.code === "SUBSTAT_EQUALS_MAIN_STAT"
      )
    );

    const impossibleTotal = canonicalizeArtifact(
      artifact(AttributeType.ATK_PERCENT, [
        attribute(AttributeType.CRIT_RATE, 0.194),
        attribute(AttributeType.CRIT_DAMAGE, 0.054),
        attribute(AttributeType.HP_PERCENT, 0.041),
        attribute(AttributeType.DEF_PERCENT, 0.051),
      ])
    );
    assert.equal(impossibleTotal.status, "invalid");
    assert.ok(
      impossibleTotal.issues.some(
        (issue) => issue.code === "IMPOSSIBLE_TOTAL_ROLL_COUNT"
      )
    );
  });

  it("rejects illegal main stats and off-grid manual importance", () => {
    const illegalMain = validateBuild(
      build(undefined, { flowerAttributes: [AttributeType.CRIT_RATE] }),
      "illegal-main"
    );
    assert.equal(illegalMain.status, "invalid");
    assert.ok(
      illegalMain.issues.some(
        (issue) => issue.code === "INVALID_BUILD_MAIN_STAT"
      )
    );

    const offGrid = validateBuild(
      build([attribute(AttributeType.CRIT_RATE, 0.55)]),
      "off-grid"
    );
    assert.equal(offGrid.status, "invalid");
    assert.ok(
      offGrid.issues.some((issue) => issue.code === "INVALID_BUILD_IMPORTANCE")
    );
  });

  it("normalizes importance ratios without changing scoring meaning", () => {
    const first = requireProfile(
      build([
        attribute(AttributeType.CRIT_RATE, 1),
        attribute(AttributeType.CRIT_DAMAGE, 0.5),
      ]),
      "first"
    );
    const second = requireProfile(
      build([
        attribute(AttributeType.CRIT_RATE, 0.2),
        attribute(AttributeType.CRIT_DAMAGE, 0.1),
      ]),
      "second"
    );

    assert.deepEqual(first.importanceBySubstat, second.importanceBySubstat);
    assert.deepEqual(first.importanceBySubstat, {
      [AttributeType.CRIT_RATE]: 2,
      [AttributeType.CRIT_DAMAGE]: 1,
    });
  });
});

describe("Build Match", () => {
  const equalProfile = requireProfile(build());

  it("uses the fixed 8/17 main budget and keeps the wrong-main ceiling below 55%", () => {
    const twoMinimum = requireCanonicalArtifact(
      artifact(AttributeType.ATK_PERCENT, [
        attribute(AttributeType.CRIT_RATE, 0.027),
        attribute(AttributeType.CRIT_DAMAGE, 0.054),
        attribute(AttributeType.HP_PERCENT, 0.041),
        attribute(AttributeType.DEF_PERCENT, 0.051),
      ])
    );
    const twoMinimumScore = evaluateBuildMatch(twoMinimum, equalProfile);
    assert.equal(twoMinimumScore.value, 47 / 85);
    assert.equal(twoMinimumScore.mainContribution, 8 / 17);
    assert.equal(twoMinimumScore.substatContribution, 7 / 85);

    const perfectWrongMain = requireCanonicalArtifact(
      artifact(
        AttributeType.DEF_PERCENT,
        [
          attribute(AttributeType.CRIT_RATE, 0.233),
          attribute(AttributeType.CRIT_DAMAGE, 0.078),
          attribute(AttributeType.ENERGY_RECHARGE, 0.065),
          attribute(AttributeType.ELEMENTAL_MASTERY, 23),
        ],
        { level: 20 }
      )
    );
    const wrongMainScore = evaluateBuildMatch(perfectWrongMain, equalProfile);
    assert.equal(wrongMainScore.value, 9 / 17);
    assert.ok(wrongMainScore.value < 0.55);
  });

  it("maps perfect nine-roll and eight-roll outcomes to their absolute ceilings", () => {
    const perfectNineRoll = requireCanonicalArtifact(
      artifact(
        AttributeType.ATK_PERCENT,
        [
          attribute(AttributeType.CRIT_RATE, 0.233),
          attribute(AttributeType.CRIT_DAMAGE, 0.078),
          attribute(AttributeType.ENERGY_RECHARGE, 0.065),
          attribute(AttributeType.ELEMENTAL_MASTERY, 23),
        ],
        { level: 20 }
      )
    );
    assert.equal(evaluateBuildMatch(perfectNineRoll, equalProfile).value, 1);

    const perfectEightRoll = requireCanonicalArtifact(
      artifact(
        AttributeType.ATK_PERCENT,
        [
          attribute(AttributeType.CRIT_RATE, 0.194),
          attribute(AttributeType.CRIT_DAMAGE, 0.078),
          attribute(AttributeType.ENERGY_RECHARGE, 0.065),
          attribute(AttributeType.ELEMENTAL_MASTERY, 23),
        ],
        { level: 20 }
      )
    );
    assert.equal(
      evaluateBuildMatch(perfectEightRoll, equalProfile).value,
      16 / 17
    );
  });

  it("uses the build-specific ceiling for unequal useful-stat importance", () => {
    const weightedProfile = requireProfile(
      build([
        attribute(AttributeType.CRIT_RATE, 1),
        attribute(AttributeType.CRIT_DAMAGE, 0.5),
        attribute(AttributeType.ENERGY_RECHARGE, 0.5),
        attribute(AttributeType.ELEMENTAL_MASTERY, 0.5),
      ])
    );
    const perfectEightRoll = requireCanonicalArtifact(
      artifact(
        AttributeType.ATK_PERCENT,
        [
          attribute(AttributeType.CRIT_RATE, 0.194),
          attribute(AttributeType.CRIT_DAMAGE, 0.078),
          attribute(AttributeType.ENERGY_RECHARGE, 0.065),
          attribute(AttributeType.ELEMENTAL_MASTERY, 23),
        ],
        { level: 20 }
      )
    );

    assert.equal(
      evaluateBuildMatch(perfectEightRoll, weightedProfile).value,
      79 / 85
    );
  });

  it("returns a finite main-only score plus an explicit issue when no desired substat is legal", () => {
    const critOnlyProfile = requireProfile(
      build([attribute(AttributeType.CRIT_RATE, 1)], {
        sandsAttributes: [],
        circletAttributes: [AttributeType.CRIT_RATE],
      })
    );
    const critMain = requireCanonicalArtifact(
      artifact(
        AttributeType.CRIT_RATE,
        [
          attribute(AttributeType.CRIT_DAMAGE, 0.054),
          attribute(AttributeType.ENERGY_RECHARGE, 0.045),
          attribute(AttributeType.HP_PERCENT, 0.041),
          attribute(AttributeType.DEF_PERCENT, 0.051),
        ],
        { position: AttributePosition.CIRCLET }
      )
    );

    const result = evaluateBuildMatch(critMain, critOnlyProfile);
    assert.equal(result.value, 8 / 17);
    assert.ok(Number.isFinite(result.value));
    assert.deepEqual(
      result.issues.map((issue) => issue.code),
      ["NO_LEGAL_DESIRED_SUBSTAT"]
    );
  });
});

describe("closed-form Expected +20 Match", () => {
  const equalProfile = requireProfile(build());

  it("matches the four-line +0 golden expectation", () => {
    const state = requireCanonicalArtifact(
      artifact(AttributeType.ATK_PERCENT, [
        attribute(AttributeType.CRIT_RATE, 0.027),
        attribute(AttributeType.CRIT_DAMAGE, 0.054),
        attribute(AttributeType.HP_PERCENT, 0.041),
        attribute(AttributeType.DEF_PERCENT, 0.051),
      ])
    );

    assert.equal(
      evaluateExpectedBuildMatchAt20(state, equalProfile).value,
      461 / 680
    );
  });

  it("includes the weighted fourth-line reveal in the three-line golden expectation", () => {
    const state = requireCanonicalArtifact(
      artifact(AttributeType.ATK_PERCENT, [
        attribute(AttributeType.CRIT_RATE, 0.027),
        attribute(AttributeType.CRIT_DAMAGE, 0.054),
        attribute(AttributeType.HP_PERCENT, 0.041),
      ])
    );

    assert.equal(
      evaluateExpectedBuildMatchAt20(state, equalProfile).value,
      1733 / 2550
    );
  });

  it("equals current Match at +20", () => {
    const state = requireCanonicalArtifact(
      artifact(
        AttributeType.ATK_PERCENT,
        [
          attribute(AttributeType.CRIT_RATE, 0.194),
          attribute(AttributeType.CRIT_DAMAGE, 0.078),
          attribute(AttributeType.ENERGY_RECHARGE, 0.065),
          attribute(AttributeType.ELEMENTAL_MASTERY, 23),
        ],
        { level: 20 }
      )
    );

    assert.deepEqual(
      evaluateExpectedBuildMatchAt20(state, equalProfile),
      evaluateBuildMatch(state, equalProfile)
    );
  });
});
