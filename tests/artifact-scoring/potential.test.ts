import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  addRationals,
  compareRationals,
  createRational,
  rationalFromFiniteDecimal,
  rationalKey,
  rationalToNumber,
} from "../../src/utils/artifactScoring/rational";
import {
  calculatePotential,
  calculatePotentialCooperatively,
  probabilityAtLeast,
} from "../../src/utils/artifactScoring/potential";
import { createScoreDistribution } from "../../src/utils/artifactScoring/probabilityTypes";
import {
  calculateConservativeTopTenFinish,
  evaluateProspect,
  findConservativeTopTenTarget,
  mixStartClassPopulations,
} from "../../src/utils/artifactScoring/prospect";

const EPSILON = 1e-12;

const assertClose = (actual: number, expected: number): void => {
  assert.ok(
    Math.abs(actual - expected) <= EPSILON,
    `expected ${actual} to be within ${EPSILON} of ${expected}`
  );
};

describe("exact rational score keys", () => {
  it("normalizes signs and common factors", () => {
    assert.deepEqual(createRational(-6n, -8n), {
      numerator: 3n,
      denominator: 4n,
    });
    assert.equal(rationalKey(createRational(10n, 20n)), "1/2");
  });

  it("compares and adds without converting through floating point", () => {
    const oneThird = createRational(1n, 3n);
    const twoSixths = createRational(2n, 6n);

    assert.equal(compareRationals(oneThird, twoSixths), 0);
    assert.deepEqual(addRationals(oneThird, createRational(1n, 6n)), {
      numerator: 1n,
      denominator: 2n,
    });
    assert.equal(rationalToNumber(oneThird), 1 / 3);
  });

  it("normalizes raw denominator signs before comparison", () => {
    assert.equal(
      compareRationals(
        { numerator: 1n, denominator: -2n },
        { numerator: 0n, denominator: 1n }
      ),
      -1
    );
  });

  it("rejects a zero denominator", () => {
    assert.throws(() => createRational(1n, 0n), /denominator/i);
  });

  it("parses UI decimal targets without binary floating-point keys", () => {
    assert.deepEqual(rationalFromFiniteDecimal(0.75), {
      numerator: 3n,
      denominator: 4n,
    });
    assert.deepEqual(rationalFromFiniteDecimal(1e-3), {
      numerator: 1n,
      denominator: 1000n,
    });
    assert.throws(() => rationalFromFiniteDecimal(Number.NaN), /finite/i);
  });

  it("normalizes caller-provided equivalent scores before PMF aggregation", () => {
    const distribution = createScoreDistribution([
      {
        score: { numerator: 2n, denominator: 4n },
        probability: 0.4,
      },
      {
        score: { numerator: 1n, denominator: 2n },
        probability: 0.6,
      },
    ]);

    assert.equal(distribution.atoms.length, 1);
    assert.deepEqual(distribution.atoms[0].score, createRational(1n, 2n));
    assertClose(distribution.atoms[0].probability, 1);
  });
});

describe("four-line Potential", () => {
  it("keeps cooperative calculation identical and cancellable", async () => {
    const input = {
      lines: [
        { importance: 10, rollValuePoints: 7 },
        { importance: 8, rollValuePoints: 8 },
        { importance: 5, rollValuePoints: 9 },
        { importance: 0, rollValuePoints: 10 },
      ],
      remainingUpgradeEvents: 5,
      preferredMain: true,
      denominatorImportance: 113,
    } as const;
    const synchronous = calculatePotential(input);
    let yieldCount = 0;
    const cooperative = await calculatePotentialCooperatively(input, {
      maxSliceMs: 0,
      yieldControl: async () => {
        yieldCount += 1;
      },
    });

    assert.ok(cooperative);
    assert.ok(yieldCount > 0);
    assert.deepEqual(cooperative.pmf.atoms, synchronous.pmf.atoms);
    assert.equal(
      cooperative.expectedFinalMatch,
      synchronous.expectedFinalMatch
    );
    assert.equal(cooperative.p10FinalMatch, synchronous.p10FinalMatch);
    assert.equal(cooperative.medianFinalMatch, synchronous.medianFinalMatch);
    assert.equal(cooperative.p90FinalMatch, synchronous.p90FinalMatch);

    let cancelled = false;
    const abandoned = await calculatePotentialCooperatively(input, {
      maxSliceMs: 0,
      shouldCancel: () => cancelled,
      yieldControl: async () => {
        cancelled = true;
      },
    });
    assert.equal(abandoned, undefined);
  });

  it("matches the +0 two-useful-line golden distribution", () => {
    const result = calculatePotential({
      lines: [
        { importance: 1, rollValuePoints: 7 },
        { importance: 1, rollValuePoints: 7 },
        { importance: 0, rollValuePoints: 7 },
        { importance: 0, rollValuePoints: 7 },
      ],
      remainingUpgradeEvents: 5,
      preferredMain: true,
      denominatorImportance: 9,
    });
    const currentScore = createRational(47n, 85n);
    const bestScore = createRational(72n, 85n);

    assertClose(result.expectedFinalMatch, 461 / 680);
    assertClose(result.bestReachableFinalMatch, 72 / 85);
    assertClose(result.pmf.totalProbability, 1);
    assertClose(result.pmf.probabilityOf(currentScore), 1 / 32);
    assertClose(result.pmf.probabilityOf(bestScore), 1 / 32768);
    assertClose(probabilityAtLeast(result.pmf, bestScore), 1 / 32768);
  });

  it("returns the complete one-event distribution and inverse-CDF quantiles", () => {
    const result = calculatePotential({
      lines: [
        { importance: 1, rollValuePoints: 10 },
        { importance: 0, rollValuePoints: 7 },
        { importance: 0, rollValuePoints: 7 },
        { importance: 0, rollValuePoints: 7 },
      ],
      remainingUpgradeEvents: 1,
      preferredMain: true,
      denominatorImportance: 9,
    });

    assert.deepEqual(
      result.pmf.atoms.map(({ score, probability }) => [
        rationalKey(score),
        probability,
      ]),
      [
        ["9/17", 3 / 4],
        ["97/170", 1 / 16],
        ["49/85", 1 / 16],
        ["99/170", 1 / 16],
        ["10/17", 1 / 16],
      ]
    );
    assertClose(result.expectedFinalMatch, 737 / 1360);
    assertClose(result.p10FinalMatch, 9 / 17);
    assertClose(result.medianFinalMatch, 9 / 17);
    assertClose(result.p90FinalMatch, 9.9 / 17);
  });

  it("collapses every summary statistic at +20", () => {
    const result = calculatePotential({
      lines: [
        { importance: 1, rollValuePoints: 60 },
        { importance: 1, rollValuePoints: 10 },
        { importance: 0, rollValuePoints: 20 },
        { importance: 0, rollValuePoints: 10 },
      ],
      remainingUpgradeEvents: 0,
      preferredMain: true,
      denominatorImportance: 9,
    });

    assert.equal(result.pmf.atoms.length, 1);
    assertClose(result.pmf.atoms[0].probability, 1);
    assertClose(result.p10FinalMatch, result.expectedFinalMatch);
    assertClose(result.medianFinalMatch, result.expectedFinalMatch);
    assertClose(result.p90FinalMatch, result.expectedFinalMatch);
    assertClose(result.bestReachableFinalMatch, result.expectedFinalMatch);
  });

  it("collapses mechanical paths when the Build has no legal desired substat", () => {
    const result = calculatePotential({
      lines: [
        { importance: 0, rollValuePoints: 7 },
        { importance: 0, rollValuePoints: 8 },
        { importance: 0, rollValuePoints: 9 },
        { importance: 0, rollValuePoints: 10 },
      ],
      remainingUpgradeEvents: 5,
      preferredMain: true,
      denominatorImportance: 0,
    });

    assert.equal(result.pmf.atoms.length, 1);
    assert.equal(rationalKey(result.pmf.atoms[0].score), "8/17");
    assertClose(result.pmf.atoms[0].probability, 1);
  });
});

describe("three-line pre-reveal Potential", () => {
  const calculateGoldenFixture = (fourLineStartProbability: number) =>
    calculatePotential({
      lines: [
        { importance: 1, rollValuePoints: 7 },
        { importance: 1, rollValuePoints: 7 },
        { importance: 0, rollValuePoints: 7 },
      ],
      revealOptions: [
        { importance: 0, probability: 11 / 15 },
        { importance: 1, probability: 4 / 15 },
      ],
      remainingUpgradeEvents: 4,
      preferredMain: true,
      denominatorImportance: 9,
      fourLineStartProbability,
    });

  it("matches the reveal and upgrade golden probabilities", () => {
    const result = calculateGoldenFixture(0.2);
    const currentScore = createRational(47n, 85n);
    const bestScore = createRational(72n, 85n);

    assertClose(result.expectedFinalMatch, 1733 / 2550);
    assertClose(result.bestReachableFinalMatch, 72 / 85);
    assertClose(result.pmf.probabilityOf(currentScore), 11 / 240);
    assertClose(result.pmf.probabilityOf(bestScore), 27 / 327680);
  });

  it("does not use the population four-line-start prior", () => {
    const withDefaultPrior = calculateGoldenFixture(0.2);
    const withDifferentPrior = calculateGoldenFixture(0.8);

    assert.deepEqual(withDefaultPrior.pmf.atoms, withDifferentPrior.pmf.atoms);
    assert.equal(
      withDefaultPrior.expectedFinalMatch,
      withDifferentPrior.expectedFinalMatch
    );
  });

  it("rejects a reveal distribution whose mass is not one", () => {
    assert.throws(
      () =>
        calculatePotential({
          lines: [
            { importance: 1, rollValuePoints: 7 },
            { importance: 1, rollValuePoints: 7 },
            { importance: 0, rollValuePoints: 7 },
          ],
          revealOptions: [{ importance: 0, probability: 0.9 }],
          remainingUpgradeEvents: 4,
          preferredMain: true,
          denominatorImportance: 9,
        }),
      /probability mass/i
    );
  });
});

describe("Prospect Rarity", () => {
  const syntheticPopulation = createScoreDistribution([
    { score: createRational(2n, 5n), probability: 0.1 },
    { score: createRational(3n, 10n), probability: 0.2 },
    { score: createRational(1n, 5n), probability: 0.7 },
  ]);

  it("uses the inclusive population tail for percentile", () => {
    const result = evaluateProspect(
      syntheticPopulation,
      createRational(3n, 10n)
    );
    const maximum = evaluateProspect(
      syntheticPopulation,
      createRational(2n, 5n)
    );

    assertClose(result.tailProbability, 0.3);
    assertClose(result.percentile, 0.7);
    assertClose(maximum.tailProbability, 0.1);
    assertClose(maximum.percentile, 0.9);
  });

  it("finds the conservative inclusive top-10 target, not inverse-CDF P90", () => {
    const target = findConservativeTopTenTarget(syntheticPopulation);

    assert.equal(target.status, "available");
    if (target.status === "available") {
      assert.equal(rationalKey(target.score), "2/5");
      assertClose(target.tailProbability, 0.1);
    }
  });

  it("reports unavailable when the maximum-score tie exceeds ten percent", () => {
    const population = createScoreDistribution([
      { score: createRational(2n, 5n), probability: 0.11 },
      { score: createRational(1n, 5n), probability: 0.89 },
    ]);

    assert.deepEqual(findConservativeTopTenTarget(population), {
      status: "unavailable",
      reason: "TOP_DECILE_CUT_NOT_REACHABLE",
    });
    assert.deepEqual(
      calculateConservativeTopTenFinish(population, population),
      {
        status: "unavailable",
        reason: "TOP_DECILE_CUT_NOT_REACHABLE",
      }
    );
  });

  it("treats cutoff differences within 1e-12 as equal", () => {
    const withinTolerance = createScoreDistribution([
      { score: createRational(2n, 5n), probability: 0.1 + EPSILON / 2 },
      { score: createRational(1n, 5n), probability: 0.9 - EPSILON / 2 },
    ]);
    const outsideTolerance = createScoreDistribution([
      { score: createRational(2n, 5n), probability: 0.1 + 2 * EPSILON },
      { score: createRational(1n, 5n), probability: 0.9 - 2 * EPSILON },
    ]);

    assert.equal(
      findConservativeTopTenTarget(withinTolerance).status,
      "available"
    );
    assert.equal(
      findConservativeTopTenTarget(outsideTolerance).status,
      "unavailable"
    );
  });

  it("composes the finished cutoff with the conditional Potential PMF", () => {
    const potential = createScoreDistribution([
      { score: createRational(2n, 5n), probability: 0.25 },
      { score: createRational(3n, 10n), probability: 0.5 },
      { score: createRational(1n, 5n), probability: 0.25 },
    ]);

    const result = calculateConservativeTopTenFinish(
      potential,
      syntheticPopulation
    );
    assert.equal(result.status, "available");
    if (result.status === "available") {
      assert.equal(rationalKey(result.targetScore), "2/5");
      assertClose(result.targetFinalMatch, 0.4);
      assertClose(result.probability, 0.25);
    }
  });

  it("mixes three- and four-line population classes using q4StartPrior", () => {
    const threeLine = createScoreDistribution([
      { score: createRational(1n, 5n), probability: 1 },
    ]);
    const fourLine = createScoreDistribution([
      { score: createRational(2n, 5n), probability: 1 },
    ]);
    const population = mixStartClassPopulations({
      threeLine,
      fourLine,
      fourLineStartProbability: 0.2,
    });

    assert.deepEqual(
      population.atoms.map(({ score, probability }) => [
        rationalKey(score),
        probability,
      ]),
      [
        ["1/5", 0.8],
        ["2/5", 0.2],
      ]
    );
  });
});
