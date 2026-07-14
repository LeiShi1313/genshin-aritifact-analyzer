import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AttributePosition, AttributeType } from "../../src/genshin/attribute";
import type { Artifact } from "../../src/genshin/artifact";
import type { Build } from "../../src/genshin/build";
import { canonicalizeArtifact } from "../../src/utils/artifactScoring/canonicalize";
import { evaluateExpectedBuildMatchAt20 } from "../../src/utils/artifactScoring/expected";
import {
  getNormalFiveStarMainStatOutcomes,
  NORMAL_FIVE_STAR_MAIN_STAT_WEIGHTS,
} from "../../src/utils/artifactScoring/mechanics";
import {
  buildScoringSignature,
  createPopulationCacheKey,
  expectedFinalQualityRational,
  generateNormalFiveStarPopulation,
  generateNormalFiveStarPopulationCooperatively,
} from "../../src/utils/artifactScoring/population";
import {
  compensatedSum,
  expectedScore,
  PROBABILITY_EPSILON,
  type DiscreteScoreDistribution,
} from "../../src/utils/artifactScoring/probabilityTypes";
import { findConservativeTopTenTarget } from "../../src/utils/artifactScoring/prospect";
import { rationalKey } from "../../src/utils/artifactScoring/rational";
import type {
  BuildScoringProfile,
  Milestone,
  NormalSourceFiveStarProfile,
} from "../../src/utils/artifactScoring/types";
import { validateBuild } from "../../src/utils/artifactScoring/validation";

const SOURCE: NormalSourceFiveStarProfile = Object.freeze({
  kind: "normal-five-star",
  fourLineStartProbability: 0.2,
});

const build = (
  subAttributes: Build["subAttributes"] = [
    { type: AttributeType.CRIT_RATE, value: 1 },
    { type: AttributeType.CRIT_DAMAGE, value: 1 },
    { type: AttributeType.ENERGY_RECHARGE, value: 1 },
    { type: AttributeType.ELEMENTAL_MASTERY, value: 1 },
  ],
  overrides: Partial<Build> = {}
): Build => ({
  name: "population fixture",
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

const requireProfile = (input: Build, id = "population-build") => {
  const result = validateBuild(input, id);
  if (result.status !== "ok") assert.fail(JSON.stringify(result));
  return result.profile;
};

const requireArtifact = (input: Artifact) => {
  const result = canonicalizeArtifact(input);
  if (result.status !== "ok") assert.fail(JSON.stringify(result));
  return result.artifact;
};

const distributionTuples = (distribution: DiscreteScoreDistribution) =>
  distribution.atoms.map((atom) => [rationalKey(atom.score), atom.probability]);

const assertDistributionEqual = (
  left: DiscreteScoreDistribution,
  right: DiscreteScoreDistribution
): void =>
  assert.deepEqual(distributionTuples(left), distributionTuples(right));

describe("normal five-star mechanics", () => {
  it("uses the fixed repository main-stat weight tables", () => {
    assert.equal(
      compensatedSum(
        Object.values(
          NORMAL_FIVE_STAR_MAIN_STAT_WEIGHTS[AttributePosition.SANDS]!
        )
      ),
      5000
    );
    assert.equal(
      compensatedSum(
        Object.values(
          NORMAL_FIVE_STAR_MAIN_STAT_WEIGHTS[AttributePosition.GOBLET]!
        )
      ),
      4000
    );
    assert.equal(
      compensatedSum(
        Object.values(
          NORMAL_FIVE_STAR_MAIN_STAT_WEIGHTS[AttributePosition.CIRCLET]!
        )
      ),
      5000
    );
  });

  it("treats Flower and Plume main stats as fixed outcomes", () => {
    assert.deepEqual(
      getNormalFiveStarMainStatOutcomes(AttributePosition.FLOWER),
      [{ type: AttributeType.HP, weight: 1, probability: 1 }]
    );
    assert.deepEqual(
      getNormalFiveStarMainStatOutcomes(AttributePosition.PLUME),
      [{ type: AttributeType.ATK, weight: 1, probability: 1 }]
    );
  });

  it("rejects unsupported positions", () => {
    assert.throws(
      () =>
        getNormalFiveStarMainStatOutcomes(
          AttributePosition.ATTRIBUTE_POSITION_UNSPECIFIED
        ),
      /position/i
    );
  });
});

describe("exact Prospect population", () => {
  const profile = requireProfile(build());

  it("keeps observed Expected +20 quality exact through the worker lookup boundary", () => {
    const threeLine = requireArtifact({
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
    });

    const exact = expectedFinalQualityRational(threeLine, profile);
    assert.equal(rationalKey(exact), "1733/2550");
    assert.equal(
      Number(exact.numerator) / Number(exact.denominator),
      evaluateExpectedBuildMatchAt20(threeLine, profile).value
    );

    const fourLine = requireArtifact({
      set: 0,
      star: 5,
      level: 0,
      position: AttributePosition.SANDS,
      mainAttribute: { type: AttributeType.ATK_PERCENT, value: 0 },
      subAttributes: [
        { type: AttributeType.CRIT_RATE, value: 0.027 },
        { type: AttributeType.CRIT_DAMAGE, value: 0.054 },
        { type: AttributeType.HP_PERCENT, value: 0.041 },
        { type: AttributeType.DEF_PERCENT, value: 0.051 },
      ],
      character: 0,
      locked: false,
    });
    const fourLineExact = expectedFinalQualityRational(fourLine, profile);
    assert.equal(rationalKey(fourLineExact), "461/680");
    assert.equal(
      Number(fourLineExact.numerator) / Number(fourLineExact.denominator),
      evaluateExpectedBuildMatchAt20(fourLine, profile).value
    );
  });

  it("normalizes every milestone population and merges exact rational ties", () => {
    const milestones: readonly Milestone[] = [0, 4, 8, 12, 16, 20];
    for (const milestone of milestones) {
      const result = generateNormalFiveStarPopulation({
        profile,
        position: AttributePosition.SANDS,
        milestone,
        sourceProfile: SOURCE,
      });
      assert.ok(
        Math.abs(result.distribution.totalProbability - 1) <=
          PROBABILITY_EPSILON
      );
      assert.equal(
        new Set(
          result.distribution.atoms.map((atom) => rationalKey(atom.score))
        ).size,
        result.distribution.atoms.length
      );
      assert.ok(
        result.distribution.atoms.every((atom) => atom.probability >= 0)
      );
    }
  });

  it("keeps cooperative generation bit-for-bit equal to synchronous generation", async () => {
    const input = {
      profile,
      position: AttributePosition.SANDS,
      milestone: 8 as const,
      sourceProfile: SOURCE,
    };
    const synchronous = generateNormalFiveStarPopulation(input);
    let yieldCount = 0;
    const cooperative = await generateNormalFiveStarPopulationCooperatively(
      input,
      {
        maxSliceMs: 0,
        yieldControl: async () => {
          yieldCount += 1;
        },
      }
    );

    assert.ok(cooperative);
    assert.ok(yieldCount > 0);
    assertDistributionEqual(cooperative.distribution, synchronous.distribution);
    assertDistributionEqual(cooperative.threeLine, synchronous.threeLine);
    assertDistributionEqual(cooperative.fourLine, synchronous.fourLine);
  });

  it("matches the synchronous oracle across every slot and milestone", async () => {
    const positions = [
      AttributePosition.FLOWER,
      AttributePosition.PLUME,
      AttributePosition.SANDS,
      AttributePosition.GOBLET,
      AttributePosition.CIRCLET,
    ] as const;
    const milestones = [0, 4, 8, 12, 16, 20] as const;

    for (const position of positions) {
      for (const milestone of milestones) {
        const input = {
          profile,
          position,
          milestone,
          sourceProfile: {
            ...SOURCE,
            fourLineStartProbability: 0.37,
          },
        };
        const synchronous = generateNormalFiveStarPopulation(input);
        const cooperative = await generateNormalFiveStarPopulationCooperatively(
          input,
          { maxSliceMs: 10_000 }
        );

        assert.ok(cooperative);
        assertDistributionEqual(
          cooperative.distribution,
          synchronous.distribution
        );
        assertDistributionEqual(cooperative.threeLine, synchronous.threeLine);
        assertDistributionEqual(cooperative.fourLine, synchronous.fourLine);
      }
    }
  });

  it("abandons cooperative generation after cancellation without a partial result", async () => {
    let cancelled = false;
    const result = await generateNormalFiveStarPopulationCooperatively(
      {
        profile,
        position: AttributePosition.GOBLET,
        milestone: 0,
        sourceProfile: SOURCE,
      },
      {
        maxSliceMs: 0,
        shouldCancel: () => cancelled,
        yieldControl: async () => {
          cancelled = true;
        },
      }
    );

    assert.equal(result, undefined);
  });

  it("preserves the population mean Expected +20 Match at every milestone", () => {
    const milestones: readonly Milestone[] = [0, 4, 8, 12, 16, 20];
    const means = milestones.map((milestone) =>
      expectedScore(
        generateNormalFiveStarPopulation({
          profile,
          position: AttributePosition.SANDS,
          milestone,
          sourceProfile: SOURCE,
        }).distribution
      )
    );

    for (const mean of means.slice(1)) {
      assert.ok(
        Math.abs(mean - means[0]) <= 1e-12,
        `${means.map((value) => value.toPrecision(16)).join(", ")}`
      );
    }
  });

  it("uses q4 only to mix independently generated start-class populations", () => {
    const threeOnly = generateNormalFiveStarPopulation({
      profile,
      position: AttributePosition.SANDS,
      milestone: 12,
      sourceProfile: { ...SOURCE, fourLineStartProbability: 0 },
    });
    const fourOnly = generateNormalFiveStarPopulation({
      profile,
      position: AttributePosition.SANDS,
      milestone: 12,
      sourceProfile: { ...SOURCE, fourLineStartProbability: 1 },
    });
    const mixed = generateNormalFiveStarPopulation({
      profile,
      position: AttributePosition.SANDS,
      milestone: 12,
      sourceProfile: { ...SOURCE, fourLineStartProbability: 0.73 },
    });

    assertDistributionEqual(threeOnly.distribution, threeOnly.threeLine);
    assertDistributionEqual(fourOnly.distribution, fourOnly.fourLine);
    assertDistributionEqual(threeOnly.threeLine, mixed.threeLine);
    assertDistributionEqual(fourOnly.fourLine, mixed.fourLine);
    assert.notDeepEqual(
      distributionTuples(mixed.distribution),
      distributionTuples(threeOnly.distribution)
    );
  });

  it("produces an available finished top-10 target for a broad Sands build", () => {
    const finished = generateNormalFiveStarPopulation({
      profile,
      position: AttributePosition.SANDS,
      milestone: 20,
      sourceProfile: SOURCE,
    }).distribution;
    const target = findConservativeTopTenTarget(finished);

    if (target.status !== "available") assert.fail(JSON.stringify(target));
    assert.ok(target.tailProbability <= 0.1 + PROBABILITY_EPSILON);
  });

  it("keeps a fixed-main no-legal-substat Flower population as one atom", () => {
    const hpOnly = requireProfile(
      build([{ type: AttributeType.HP, value: 1 }]),
      "hp-only"
    );
    const finished = generateNormalFiveStarPopulation({
      profile: hpOnly,
      position: AttributePosition.FLOWER,
      milestone: 20,
      sourceProfile: SOURCE,
    }).distribution;

    assert.deepEqual(distributionTuples(finished), [["8/17", 1]]);
    assert.deepEqual(findConservativeTopTenTarget(finished), {
      status: "unavailable",
      reason: "TOP_DECILE_CUT_NOT_REACHABLE",
    });
  });
});

describe("population cache signatures", () => {
  it("is stable across build ids and importance scaling, but keys every input", () => {
    const full = requireProfile(
      build([
        { type: AttributeType.CRIT_RATE, value: 1 },
        { type: AttributeType.CRIT_DAMAGE, value: 0.5 },
      ]),
      "full"
    );
    const scaled = requireProfile(
      build([
        { type: AttributeType.CRIT_RATE, value: 0.2 },
        { type: AttributeType.CRIT_DAMAGE, value: 0.1 },
      ]),
      "scaled"
    );
    assert.equal(buildScoringSignature(full), buildScoringSignature(scaled));

    const base = {
      profile: full,
      position: AttributePosition.SANDS,
      milestone: 0 as const,
      sourceProfile: SOURCE,
    };
    assert.equal(
      createPopulationCacheKey(base),
      createPopulationCacheKey({ ...base, profile: scaled })
    );
    assert.notEqual(
      createPopulationCacheKey(base),
      createPopulationCacheKey({ ...base, milestone: 4 })
    );
    assert.notEqual(
      createPopulationCacheKey(base),
      createPopulationCacheKey({
        ...base,
        sourceProfile: { ...SOURCE, fourLineStartProbability: 0.3 },
      })
    );
  });

  it("rejects an invalid normal-source assumption", () => {
    const profile: BuildScoringProfile = requireProfile(build());
    assert.throws(
      () =>
        createPopulationCacheKey({
          profile,
          position: AttributePosition.SANDS,
          milestone: 0,
          sourceProfile: {
            kind: "normal-five-star",
            fourLineStartProbability: Number.NaN,
          },
        }),
      /fourLineStartProbability/i
    );
  });
});
