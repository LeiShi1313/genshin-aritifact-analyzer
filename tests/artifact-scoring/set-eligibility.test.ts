import assert from "node:assert/strict";
import test from "node:test";

import { AttributePosition, AttributeType } from "../../src/genshin/attribute";
import type { Build } from "../../src/genshin/build";
import { Set as ArtifactSet } from "../../src/genshin/set";
import {
  BUILD_SET_PLAN,
  classifyArtifactSetCompatibility,
  classifyBuildSetPlan,
  calculateSetEligibilityGates,
  expectedFiveStarDrops,
  lastArrivalProbabilities,
  oddsLimitedOffPieceFactor,
  publicScoreBins,
  selectConservativePublicScoreCutoff,
  setEligibilityReferenceForLevel,
  SET_COMPATIBILITY,
  SET_ELIGIBILITY_REFERENCES,
} from "../../src/utils/artifactScoring/setEligibility";
import { generateNormalFiveStarPopulation } from "../../src/utils/artifactScoring/population";
import { createScoreDistribution } from "../../src/utils/artifactScoring/probabilityTypes";
import { createRational } from "../../src/utils/artifactScoring/rational";
import { validateBuild } from "../../src/utils/artifactScoring/validation";

const distribution = (
  atoms: readonly (readonly [scorePercent: number, probability: number])[]
) =>
  createScoreDistribution(
    atoms.map(([scorePercent, probability]) => ({
      score: createRational(BigInt(scorePercent), 100n),
      probability,
    }))
  );

test("aggregates exact values into the same displayed public-score bucket", () => {
  const result = publicScoreBins(
    createScoreDistribution([
      { score: createRational(809n, 1000n), probability: 0.2 },
      { score: createRational(4n, 5n), probability: 0.2 },
      { score: createRational(29n, 50n), probability: 0.1 },
      { score: createRational(1n), probability: 0.5 },
    ])
  );

  assert.deepEqual(result, [
    { score: 100, probability: 0.5 },
    { score: 80, probability: 0.4 },
    { score: 58, probability: 0.1 },
  ]);
});

test("last-arrival probabilities are symmetric and total one", () => {
  const symmetric = lastArrivalProbabilities([1, 1, 1, 1, 1]);
  symmetric.forEach((probability) =>
    assert.ok(Math.abs(probability - 0.2) < 1e-12)
  );
  assert.ok(
    Math.abs(
      lastArrivalProbabilities([0.1, 0.2, 0.3, 0.4, 0.5]).reduce(
        (sum, probability) => sum + probability,
        0
      ) - 1
    ) < 1e-12
  );

  const asymmetric = lastArrivalProbabilities([1, 2, 3, 4, 5]);
  const scaled = lastArrivalProbabilities([10, 20, 30, 40, 50]);
  const expected = [
    0.5361360861360862, 0.2293650793650794, 0.12031302031302037,
    0.07022977022977024, 0.04395604395604381,
  ];
  asymmetric.forEach((probability, index) => {
    assert.ok(Math.abs(probability - expected[index]) < 1e-12);
    assert.ok(Math.abs(probability - scaled[index]) < 1e-12);
  });
});

test("keeps a positive last-arrival budget under highly asymmetric rates", () => {
  const rates = [1, 1e-7, 1e-7, 1e-7, 1e-7];
  const lastArrival = lastArrivalProbabilities(rates);
  assert.ok(lastArrival[0] > 0);
  assert.ok(Math.abs(lastArrival[0] / 2.3999976e-27 - 1) < 1e-6);

  const certain = distribution([[75, 1]]);
  const scarce = distribution([
    [75, 1e-7],
    [0, 1 - 1e-7],
  ]);
  const gate = calculateSetEligibilityGates(
    [certain, scarce, scarce, scarce, scarce],
    75
  )[0];
  assert.equal(gate.status, "available");
  if (gate.status !== "available") return;
  assert.equal(gate.forcedHighestBucket, true);
  assert.ok(gate.offPieceBudget > 0);
});

test("converts last-arrival demand to a capped odds supply factor", () => {
  assert.ok(Math.abs(oddsLimitedOffPieceFactor(0.2) - 0.25) < 1e-12);
  assert.equal(oddsLimitedOffPieceFactor(0.5), 1);
  assert.equal(oddsLimitedOffPieceFactor(0.8), 1);
});

test("uses one fixed acquisition reference for every unfinished level", () => {
  assert.deepEqual(SET_ELIGIBILITY_REFERENCES, [
    { referenceMilestone: 0, baseScore: 75 },
    { referenceMilestone: 20, baseScore: 80 },
  ]);
  for (const level of [0, 4, 8, 12, 16, 19]) {
    assert.deepEqual(setEligibilityReferenceForLevel(level), {
      referenceMilestone: 0,
      baseScore: 75,
    });
  }
  assert.deepEqual(setEligibilityReferenceForLevel(20), {
    referenceMilestone: 20,
    baseScore: 80,
  });
});

test("expresses farming rarity in five-star drops and avoids infinity", () => {
  assert.equal(expectedFiveStarDrops(0.25), 40);
  assert.equal(expectedFiveStarDrops(0), undefined);
});

test("uses the calibrated conservative whole-bucket budget", () => {
  const result = selectConservativePublicScoreCutoff(
    [
      { score: 100, probability: 0.05 },
      { score: 90, probability: 0.1 },
      { score: 84, probability: 0.2 },
      { score: 80, probability: 0.15 },
      { score: 75, probability: 0.2 },
      { score: 60, probability: 0.3 },
    ],
    75,
    0.4
  );

  assert.equal(result.status, "available");
  if (result.status !== "available") return;

  // Budget is .28. The complete 84 bucket would cross it, so it is excluded.
  assert.equal(result.offPieceCutoff, 90);
  assert.ok(Math.abs(result.retainedProbability - 0.15) < 1e-12);
  assert.ok(Math.abs(result.baseTailProbability - 0.7) < 1e-12);
});

test("always keeps the highest tied bucket even when it exceeds the budget", () => {
  const scarce = distribution([
    [91, 0.3],
    [75, 0.7],
  ]);
  const abundant = distribution([[100, 1]]);
  const gates = calculateSetEligibilityGates(
    [scarce, abundant, abundant, abundant, abundant],
    75
  );
  const gate = gates[0];

  assert.equal(gate.status, "available");
  if (gate.status !== "available") return;
  assert.equal(gate.offPieceCutoff, 91);
  assert.equal(gate.retainedProbability, 0.3);
  assert.equal(gate.forcedHighestBucket, true);
});

test("returns unavailable instead of lowering an unattainable base", () => {
  const unattainable = distribution([[74, 1]]);
  const attainable = distribution([[80, 1]]);
  const gates = calculateSetEligibilityGates(
    [unattainable, attainable, attainable, attainable, attainable],
    75
  );

  assert.deepEqual(gates[0], {
    status: "unavailable",
    baseScore: 75,
    baseTailProbability: 0,
    reason: "base-unattainable",
  });
  assert.deepEqual(gates[1], {
    status: "unavailable",
    baseScore: 75,
    baseTailProbability: 1,
    reason: "build-uncompletable",
  });
});

test("does not force a highest bucket when no off-piece budget exists", () => {
  assert.deepEqual(
    selectConservativePublicScoreCutoff(
      [{ score: 100, probability: 1 }],
      75,
      0
    ),
    {
      status: "unavailable",
      baseTailProbability: 1,
      reason: "zero-budget",
    }
  );
});

test("reproduces the calibrated triple-EM cutoffs", () => {
  const tripleEmBuild: Build = {
    name: "triple-em-calibration",
    character: 0,
    weapons: [],
    suits: [],
    flowerAttributes: [AttributeType.HP],
    plumeAttributes: [AttributeType.ATK],
    sandsAttributes: [AttributeType.ELEMENTAL_MASTERY],
    gobletAttributes: [AttributeType.ELEMENTAL_MASTERY],
    circletAttributes: [AttributeType.ELEMENTAL_MASTERY],
    subAttributes: [
      { type: AttributeType.ELEMENTAL_MASTERY, value: 1 },
      { type: AttributeType.ENERGY_RECHARGE, value: 0.6 },
      { type: AttributeType.CRIT_RATE, value: 0.5 },
      { type: AttributeType.CRIT_DAMAGE, value: 0.5 },
      { type: AttributeType.ATK_PERCENT, value: 0.4 },
    ],
  };
  const validation = validateBuild(tripleEmBuild, "triple-em-calibration");
  assert.equal(validation.status, "ok");
  if (validation.status !== "ok") return;

  const positions = [
    AttributePosition.FLOWER,
    AttributePosition.PLUME,
    AttributePosition.SANDS,
    AttributePosition.GOBLET,
    AttributePosition.CIRCLET,
  ];
  const sourceProfile = {
    kind: "normal-five-star" as const,
    fourLineStartProbability: 0.2,
  };
  const gatesAt = (milestone: 0 | 20, baseScore: number) =>
    calculateSetEligibilityGates(
      positions.map(
        (position) =>
          generateNormalFiveStarPopulation({
            profile: validation.profile,
            position,
            milestone,
            sourceProfile,
          }).distribution
      ),
      baseScore
    );

  const unfinished = gatesAt(0, 75);
  const finished = gatesAt(20, 80);
  const cutoffs = (gates: ReturnType<typeof gatesAt>) =>
    gates.map((gate) =>
      gate.status === "available" ? gate.offPieceCutoff : undefined
    );
  assert.deepEqual(cutoffs(unfinished), [84, 84, 80, 75, 77]);
  assert.deepEqual(cutoffs(finished), [92, 92, 86, 80, 82]);

  const expectedLastArrival = [
    0.0044074611753059925, 0.0044074611753059925, 0.08926588885345468,
    0.5636670324331493, 0.33825215636278416,
  ];
  unfinished.forEach((gate, index) => {
    assert.equal(gate.status, "available");
    if (gate.status !== "available") return;
    assert.ok(
      Math.abs(gate.lastArrivalProbability - expectedLastArrival[index]) < 1e-12
    );
  });
});

test("models only unambiguous four-piece alternatives", () => {
  const baseBuild: Build = {
    name: "set-plan",
    character: 0,
    weapons: [],
    suits: [],
    flowerAttributes: [AttributeType.HP],
    plumeAttributes: [AttributeType.ATK],
    sandsAttributes: [AttributeType.ATK_PERCENT],
    gobletAttributes: [],
    circletAttributes: [],
    subAttributes: [{ type: AttributeType.CRIT_RATE, value: 1 }],
  };

  assert.deepEqual(classifyBuildSetPlan(baseBuild), {
    kind: BUILD_SET_PLAN.NEUTRAL,
    targetSets: [],
  });

  const strict = classifyBuildSetPlan({
    ...baseBuild,
    suits: [
      { setCombos: [{ set: 10, count: 4 }] },
      { setCombos: [{ set: 20, count: 4 }] },
      { setCombos: [{ set: 10, count: 4 }] },
    ],
  });
  assert.deepEqual(strict, {
    kind: BUILD_SET_PLAN.STRICT_FOUR_PIECE,
    targetSets: [10, 20],
  });
  assert.equal(
    classifyArtifactSetCompatibility(20, strict),
    SET_COMPATIBILITY.MATCH
  );
  assert.equal(
    classifyArtifactSetCompatibility(30, strict),
    SET_COMPATIBILITY.MISMATCH
  );

  for (const suits of [
    [
      {
        setCombos: [
          { set: 10, count: 2 },
          { set: 20, count: 2 },
        ],
      },
    ],
    [
      {
        setCombos: [
          { set: 10, count: 4 },
          { set: 20, count: 4 },
        ],
      },
    ],
    [{ setCombos: [{ set: 10, count: 2 }] }],
    [{ setCombos: [{ set: 999, count: 4 }] }],
    [
      {
        setCombos: [{ set: ArtifactSet.INSTRUCTOR, count: 4 }],
      },
    ],
    [
      {
        setCombos: [{ set: ArtifactSet.PRAYERS_FOR_DESTINY, count: 4 }],
      },
    ],
  ]) {
    assert.deepEqual(classifyBuildSetPlan({ ...baseBuild, suits }), {
      kind: BUILD_SET_PLAN.NEUTRAL,
      targetSets: [],
    });
  }
});
