import { AttributePosition, AttributeType } from "../../genshin/attribute";
import { createBuildMatchContext } from "./match";
import {
  CooperativeComputation,
  type CooperativeComputationOptions,
  useCooperativeComputation,
} from "./cooperative";
import {
  FIVE_STAR_TIER_POINTS,
  getNormalFiveStarMainStatOutcomes,
  normalSourceProfileSignature,
  POPULATION_ALGORITHM_VERSION,
  validateNormalSourceFiveStarProfile,
} from "./mechanics";
import {
  CompensatedSum,
  compensatedSum,
  createScoreDistribution,
  createScoreDistributionCooperatively,
  PROBABILITY_EPSILON,
  type DiscreteScoreDistribution,
  type ScoreProbabilityAtom,
} from "./probabilityTypes";
import { mixStartClassPopulations } from "./prospect";
import {
  addRationals,
  createRational,
  rationalKey,
  type ExactRational,
} from "./rational";
import {
  FIVE_STAR_SUBSTAT_TYPES,
  FIVE_STAR_SUBSTAT_TYPE_WEIGHTS,
} from "./rollData";
import type {
  BuildScoringProfile,
  CanonicalArtifactState,
  Milestone,
  NormalSourceFiveStarProfile,
} from "./types";

const MILESTONES: readonly Milestone[] = Object.freeze([0, 4, 8, 12, 16, 20]);

export interface NormalFiveStarPopulationInput {
  readonly profile: BuildScoringProfile;
  readonly position: AttributePosition;
  readonly milestone: Milestone;
  readonly sourceProfile: NormalSourceFiveStarProfile;
}

export interface NormalFiveStarPopulation {
  readonly distribution: DiscreteScoreDistribution;
  readonly threeLine: DiscreteScoreDistribution;
  readonly fourLine: DiscreteScoreDistribution;
  readonly cacheKey: string;
  readonly position: AttributePosition;
  readonly milestone: Milestone;
  readonly sourceProfile: NormalSourceFiveStarProfile;
}

interface TypeSetOutcome {
  readonly types: readonly AttributeType[];
  readonly probability: number;
}

interface ImportanceGroup {
  readonly importances: readonly number[];
  readonly revealImportance?: ExactRational;
  readonly probability: number;
}

interface MainEvaluationContext {
  readonly preferredMain: boolean;
  readonly importanceByType: Readonly<Partial<Record<AttributeType, number>>>;
  readonly denominatorImportance: number;
}

const typeSetCache = new Map<string, readonly TypeSetOutcome[]>();
const weightedPointCache = new Map<string, ReadonlyMap<number, number>>();
const MAX_WEIGHTED_POINT_CACHE_ENTRIES = 64;

const assertMilestone = (milestone: Milestone): void => {
  if (!MILESTONES.includes(milestone)) {
    throw new RangeError(`Unsupported enhancement milestone: ${milestone}`);
  }
};

const addNumberMass = <Key>(
  states: Map<Key, CompensatedSum>,
  key: Key,
  probability: number
): void => {
  let accumulator = states.get(key);
  if (!accumulator) {
    accumulator = new CompensatedSum();
    states.set(key, accumulator);
  }
  accumulator.add(probability);
};

const normalizeNumberMap = (
  states: Map<number, CompensatedSum>,
  context: string
): ReadonlyMap<number, number> => {
  const entries = [...states.entries()]
    .map(([state, probability]) => [state, probability.value()] as const)
    .sort(([left], [right]) => left - right);
  const total = compensatedSum(entries.map(([, probability]) => probability));
  if (total <= 0 || Math.abs(total - 1) > PROBABILITY_EPSILON) {
    throw new RangeError(
      `${context} probability mass did not normalize: ${total}`
    );
  }
  return new Map(
    entries.map(([state, probability]) => [state, probability / total])
  );
};

const selectedTypeCount = (mask: number): number => {
  let value = mask;
  let count = 0;
  while (value !== 0) {
    count += value & 1;
    value >>>= 1;
  }
  return count;
};

const enumerateUnorderedTypeSets = (
  mainStat: AttributeType,
  lineCount: 3 | 4
): readonly TypeSetOutcome[] => {
  const cacheKey = `${mainStat}:${lineCount}`;
  const cached = typeSetCache.get(cacheKey);
  if (cached) return cached;

  const mainIndex = FIVE_STAR_SUBSTAT_TYPES.indexOf(
    mainStat as (typeof FIVE_STAR_SUBSTAT_TYPES)[number]
  );
  let states: ReadonlyMap<number, number> = new Map([[0, 1]]);

  for (let selectedCount = 0; selectedCount < lineCount; selectedCount += 1) {
    const next = new Map<number, CompensatedSum>();
    for (const [mask, probability] of [...states].sort(
      ([left], [right]) => left - right
    )) {
      let remainingWeight = 0;
      for (let index = 0; index < FIVE_STAR_SUBSTAT_TYPES.length; index += 1) {
        if (index === mainIndex || (mask & (1 << index)) !== 0) continue;
        remainingWeight +=
          FIVE_STAR_SUBSTAT_TYPE_WEIGHTS[FIVE_STAR_SUBSTAT_TYPES[index]];
      }

      for (let index = 0; index < FIVE_STAR_SUBSTAT_TYPES.length; index += 1) {
        if (index === mainIndex || (mask & (1 << index)) !== 0) continue;
        const type = FIVE_STAR_SUBSTAT_TYPES[index];
        addNumberMass(
          next,
          mask | (1 << index),
          probability * (FIVE_STAR_SUBSTAT_TYPE_WEIGHTS[type] / remainingWeight)
        );
      }
    }
    states = normalizeNumberMap(
      next,
      `substat type selection ${selectedCount + 1}`
    );
  }

  const outcomes = Object.freeze(
    [...states.entries()]
      .filter(([mask]) => selectedTypeCount(mask) === lineCount)
      .map(([mask, probability]) =>
        Object.freeze({
          types: Object.freeze(
            FIVE_STAR_SUBSTAT_TYPES.filter(
              (_, index) => (mask & (1 << index)) !== 0
            )
          ),
          probability,
        })
      )
      .sort((left, right) => {
        const leftKey = left.types.join(",");
        const rightKey = right.types.join(",");
        return leftKey.localeCompare(rightKey);
      })
  );
  const total = compensatedSum(outcomes.map((outcome) => outcome.probability));
  if (Math.abs(total - 1) > PROBABILITY_EPSILON) {
    throw new RangeError(
      "Unordered substat-set probability mass did not normalize"
    );
  }
  typeSetCache.set(cacheKey, outcomes);
  return outcomes;
};

const buildMainEvaluationContext = (
  profile: BuildScoringProfile,
  position: AttributePosition,
  mainStat: AttributeType
): MainEvaluationContext => {
  const importanceByType = Object.freeze(
    Object.fromEntries(
      Object.entries(profile.importanceBySubstat)
        .map(([type, importance]) => [
          Number(type) as AttributeType,
          importance,
        ])
        .filter(([type, importance]) => type !== mainStat && importance > 0)
    ) as Partial<Record<AttributeType, number>>
  );
  const topFour = Object.values(importanceByType)
    .filter((importance): importance is number => importance !== undefined)
    .sort((left, right) => right - left)
    .slice(0, 4);
  const maximum = topFour[0] ?? 0;

  return Object.freeze({
    preferredMain:
      profile.preferredMainStats[position]?.includes(mainStat) ?? false,
    importanceByType,
    denominatorImportance:
      topFour.reduce((total, importance) => total + importance, 0) +
      5 * maximum,
  });
};

const expectedRevealImportance = (
  mainStat: AttributeType,
  existingTypes: readonly AttributeType[],
  importanceByType: Readonly<Partial<Record<AttributeType, number>>>
): ExactRational => {
  const excluded = new Set([mainStat, ...existingTypes]);
  let remainingTypeWeight = 0;
  let weightedImportance = 0;

  for (const type of FIVE_STAR_SUBSTAT_TYPES) {
    if (excluded.has(type)) continue;
    const typeWeight = FIVE_STAR_SUBSTAT_TYPE_WEIGHTS[type];
    remainingTypeWeight += typeWeight;
    weightedImportance += typeWeight * (importanceByType[type] ?? 0);
  }

  if (remainingTypeWeight === 0) {
    throw new RangeError("No legal fourth substat type remains");
  }
  return createRational(
    BigInt(weightedImportance),
    BigInt(remainingTypeWeight)
  );
};

const groupTypeSetsByImportance = (
  mainStat: AttributeType,
  lineCount: 3 | 4,
  importanceByType: Readonly<Partial<Record<AttributeType, number>>>
): readonly ImportanceGroup[] => {
  const grouped = new Map<
    string,
    {
      importances: readonly number[];
      revealImportance?: ExactRational;
      probability: CompensatedSum;
    }
  >();

  for (const outcome of enumerateUnorderedTypeSets(mainStat, lineCount)) {
    const importances = Object.freeze(
      outcome.types
        .map((type) => importanceByType[type] ?? 0)
        .sort((left, right) => left - right)
    );
    const revealImportance =
      lineCount === 3
        ? expectedRevealImportance(mainStat, outcome.types, importanceByType)
        : undefined;
    const key = `${importances.join(",")}|${
      revealImportance ? rationalKey(revealImportance) : "known-four"
    }`;
    let group = grouped.get(key);
    if (!group) {
      group = {
        importances,
        revealImportance,
        probability: new CompensatedSum(),
      };
      grouped.set(key, group);
    }
    group.probability.add(outcome.probability);
  }

  const groups = [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, group]) =>
      Object.freeze({
        importances: group.importances,
        revealImportance: group.revealImportance,
        probability: group.probability.value(),
      })
    );
  const total = compensatedSum(groups.map((group) => group.probability));
  if (Math.abs(total - 1) > PROBABILITY_EPSILON) {
    throw new RangeError("Importance-group probability mass did not normalize");
  }
  return Object.freeze(
    groups.map((group) =>
      Object.freeze({ ...group, probability: group.probability / total })
    )
  );
};

const advanceWeightedPointStates = (
  states: ReadonlyMap<number, number>,
  increments: readonly number[],
  context: string
): ReadonlyMap<number, number> => {
  const next = new Map<number, CompensatedSum>();
  const branchProbability = 1 / increments.length;
  for (const [weightedPoints, probability] of states) {
    for (const increment of increments) {
      addNumberMass(
        next,
        weightedPoints + increment,
        probability * branchProbability
      );
    }
  }
  return normalizeNumberMap(next, context);
};

const advanceWeightedPointStatesCooperatively = async (
  states: ReadonlyMap<number, number>,
  increments: readonly number[],
  context: string,
  computation: CooperativeComputation
): Promise<ReadonlyMap<number, number> | undefined> => {
  const next = new Map<number, CompensatedSum>();
  const branchProbability = 1 / increments.length;
  for (const [weightedPoints, probability] of states) {
    for (const increment of increments) {
      addNumberMass(
        next,
        weightedPoints + increment,
        probability * branchProbability
      );
    }
    if (computation.cancelled) return undefined;
    if (computation.isYieldDue(64) && !(await computation.yield())) {
      return undefined;
    }
  }
  return normalizeNumberMap(next, context);
};

const weightedPointDistribution = (
  importancesInput: readonly number[],
  upgradeEvents: number
): ReadonlyMap<number, number> => {
  const importances = [...importancesInput].sort((left, right) => left - right);
  const cacheKey = `${importances.join(",")}|${upgradeEvents}`;
  const cached = weightedPointCache.get(cacheKey);
  if (cached) {
    weightedPointCache.delete(cacheKey);
    weightedPointCache.set(cacheKey, cached);
    return cached;
  }

  let states: ReadonlyMap<number, number> = new Map([[0, 1]]);
  for (const importance of importances) {
    states = advanceWeightedPointStates(
      states,
      FIVE_STAR_TIER_POINTS.map((tier) => importance * tier),
      "initial tier rolls"
    );
  }
  const upgradeIncrements = importances.flatMap((importance) =>
    FIVE_STAR_TIER_POINTS.map((tier) => importance * tier)
  );
  for (let event = 0; event < upgradeEvents; event += 1) {
    states = advanceWeightedPointStates(
      states,
      upgradeIncrements,
      `upgrade event ${event + 1}`
    );
  }

  weightedPointCache.set(cacheKey, states);
  if (weightedPointCache.size > MAX_WEIGHTED_POINT_CACHE_ENTRIES) {
    const leastRecentlyUsedKey = weightedPointCache.keys().next().value;
    if (leastRecentlyUsedKey !== undefined) {
      weightedPointCache.delete(leastRecentlyUsedKey);
    }
  }
  return states;
};

const weightedPointDistributionCooperatively = async (
  importancesInput: readonly number[],
  upgradeEvents: number,
  computation: CooperativeComputation
): Promise<ReadonlyMap<number, number> | undefined> => {
  const importances = [...importancesInput].sort((left, right) => left - right);
  const cacheKey = `${importances.join(",")}|${upgradeEvents}`;
  const cached = weightedPointCache.get(cacheKey);
  if (cached) {
    weightedPointCache.delete(cacheKey);
    weightedPointCache.set(cacheKey, cached);
    return cached;
  }

  let states: ReadonlyMap<number, number> = new Map([[0, 1]]);
  for (const importance of importances) {
    const next = await advanceWeightedPointStatesCooperatively(
      states,
      FIVE_STAR_TIER_POINTS.map((tier) => importance * tier),
      "initial tier rolls",
      computation
    );
    if (!next) return undefined;
    states = next;
  }
  const upgradeIncrements = importances.flatMap((importance) =>
    FIVE_STAR_TIER_POINTS.map((tier) => importance * tier)
  );
  for (let event = 0; event < upgradeEvents; event += 1) {
    const next = await advanceWeightedPointStatesCooperatively(
      states,
      upgradeIncrements,
      `upgrade event ${event + 1}`,
      computation
    );
    if (!next) return undefined;
    states = next;
  }

  weightedPointCache.set(cacheKey, states);
  if (weightedPointCache.size > MAX_WEIGHTED_POINT_CACHE_ENTRIES) {
    const leastRecentlyUsedKey = weightedPointCache.keys().next().value;
    if (leastRecentlyUsedKey !== undefined) {
      weightedPointCache.delete(leastRecentlyUsedKey);
    }
  }
  return states;
};

const projectExpectedPointsToMatch = (
  expectedWeightedPoints: ExactRational,
  preferredMain: boolean,
  denominatorImportance: number
): ExactRational => {
  if (denominatorImportance === 0) {
    if (expectedWeightedPoints.numerator !== 0n) {
      throw new RangeError("A zero denominator requires zero weighted points");
    }
    return createRational(preferredMain ? 8n : 0n, 17n);
  }

  const denominator = BigInt(denominatorImportance);
  const pointDenominator = expectedWeightedPoints.denominator;
  return createRational(
    (preferredMain ? 80n * denominator * pointDenominator : 0n) +
      9n * expectedWeightedPoints.numerator,
    170n * denominator * pointDenominator
  );
};

const knownFourExpectedQuality = (
  currentWeightedPoints: number,
  importances: readonly number[],
  remainingUpgradeEvents: number,
  context: MainEvaluationContext
): ExactRational => {
  const totalImportance = importances.reduce(
    (total, importance) => total + importance,
    0
  );
  const expectedPoints = addRationals(
    createRational(BigInt(currentWeightedPoints)),
    createRational(BigInt(remainingUpgradeEvents * 17 * totalImportance), 8n)
  );
  return projectExpectedPointsToMatch(
    expectedPoints,
    context.preferredMain,
    context.denominatorImportance
  );
};

const threeLineExpectedQuality = (
  currentWeightedPoints: number,
  importances: readonly number[],
  revealImportance: ExactRational,
  context: MainEvaluationContext
): ExactRational => {
  const totalImportance = importances.reduce(
    (total, importance) => total + importance,
    0
  );
  const expectedPoints = addRationals(
    addRationals(
      createRational(BigInt(currentWeightedPoints)),
      createRational(BigInt(17 * totalImportance), 2n)
    ),
    createRational(
      17n * revealImportance.numerator,
      revealImportance.denominator
    )
  );
  return projectExpectedPointsToMatch(
    expectedPoints,
    context.preferredMain,
    context.denominatorImportance
  );
};

const generateKnownFourStartClass = (
  profile: BuildScoringProfile,
  position: AttributePosition,
  observedUpgradeEvents: number,
  remainingUpgradeEvents: number
): DiscreteScoreDistribution => {
  const atoms: ScoreProbabilityAtom[] = [];

  for (const mainOutcome of getNormalFiveStarMainStatOutcomes(position)) {
    const context = buildMainEvaluationContext(
      profile,
      position,
      mainOutcome.type
    );
    const groups = groupTypeSetsByImportance(
      mainOutcome.type,
      4,
      context.importanceByType
    );
    for (const group of groups) {
      const pointStates = weightedPointDistribution(
        group.importances,
        observedUpgradeEvents
      );
      for (const [weightedPoints, probability] of pointStates) {
        atoms.push({
          score: knownFourExpectedQuality(
            weightedPoints,
            group.importances,
            remainingUpgradeEvents,
            context
          ),
          probability:
            mainOutcome.probability * group.probability * probability,
        });
      }
    }
  }

  return createScoreDistribution(atoms);
};

const generateKnownFourStartClassCooperatively = async (
  profile: BuildScoringProfile,
  position: AttributePosition,
  observedUpgradeEvents: number,
  remainingUpgradeEvents: number,
  computation: CooperativeComputation
): Promise<DiscreteScoreDistribution | undefined> => {
  const atoms: ScoreProbabilityAtom[] = [];

  for (const mainOutcome of getNormalFiveStarMainStatOutcomes(position)) {
    const context = buildMainEvaluationContext(
      profile,
      position,
      mainOutcome.type
    );
    const groups = groupTypeSetsByImportance(
      mainOutcome.type,
      4,
      context.importanceByType
    );
    for (const group of groups) {
      const pointStates = await weightedPointDistributionCooperatively(
        group.importances,
        observedUpgradeEvents,
        computation
      );
      if (!pointStates) return undefined;
      for (const [weightedPoints, probability] of pointStates) {
        atoms.push({
          score: knownFourExpectedQuality(
            weightedPoints,
            group.importances,
            remainingUpgradeEvents,
            context
          ),
          probability:
            mainOutcome.probability * group.probability * probability,
        });
        if (computation.cancelled) return undefined;
        if (computation.isYieldDue(64) && !(await computation.yield())) {
          return undefined;
        }
      }
    }
  }

  return createScoreDistributionCooperatively(atoms, computation);
};

const generateThreeLineAtMilestoneZero = (
  profile: BuildScoringProfile,
  position: AttributePosition
): DiscreteScoreDistribution => {
  const atoms: ScoreProbabilityAtom[] = [];

  for (const mainOutcome of getNormalFiveStarMainStatOutcomes(position)) {
    const context = buildMainEvaluationContext(
      profile,
      position,
      mainOutcome.type
    );
    const groups = groupTypeSetsByImportance(
      mainOutcome.type,
      3,
      context.importanceByType
    );
    for (const group of groups) {
      if (!group.revealImportance) {
        throw new Error("Three-line importance group lacks reveal expectation");
      }
      const pointStates = weightedPointDistribution(group.importances, 0);
      for (const [weightedPoints, probability] of pointStates) {
        atoms.push({
          score: threeLineExpectedQuality(
            weightedPoints,
            group.importances,
            group.revealImportance,
            context
          ),
          probability:
            mainOutcome.probability * group.probability * probability,
        });
      }
    }
  }

  return createScoreDistribution(atoms);
};

const generateThreeLineAtMilestoneZeroCooperatively = async (
  profile: BuildScoringProfile,
  position: AttributePosition,
  computation: CooperativeComputation
): Promise<DiscreteScoreDistribution | undefined> => {
  const atoms: ScoreProbabilityAtom[] = [];

  for (const mainOutcome of getNormalFiveStarMainStatOutcomes(position)) {
    const context = buildMainEvaluationContext(
      profile,
      position,
      mainOutcome.type
    );
    const groups = groupTypeSetsByImportance(
      mainOutcome.type,
      3,
      context.importanceByType
    );
    for (const group of groups) {
      if (!group.revealImportance) {
        throw new Error("Three-line importance group lacks reveal expectation");
      }
      const pointStates = await weightedPointDistributionCooperatively(
        group.importances,
        0,
        computation
      );
      if (!pointStates) return undefined;
      for (const [weightedPoints, probability] of pointStates) {
        atoms.push({
          score: threeLineExpectedQuality(
            weightedPoints,
            group.importances,
            group.revealImportance,
            context
          ),
          probability:
            mainOutcome.probability * group.probability * probability,
        });
        if (computation.cancelled) return undefined;
        if (computation.isYieldDue(64) && !(await computation.yield())) {
          return undefined;
        }
      }
    }
  }

  return createScoreDistributionCooperatively(atoms, computation);
};

export const expectedFinalQualityRational = (
  artifact: CanonicalArtifactState,
  profile: BuildScoringProfile
): ExactRational => {
  const matchContext = createBuildMatchContext(artifact, profile);
  const mainContext: MainEvaluationContext = {
    preferredMain: matchContext.isPreferredMain,
    importanceByType: matchContext.legalImportanceBySubstat,
    denominatorImportance: matchContext.denominatorImportance,
  };
  const importances = artifact.substats.map(
    (substat) => matchContext.legalImportanceBySubstat[substat.type] ?? 0
  );

  if (artifact.substats.length === 3) {
    return threeLineExpectedQuality(
      matchContext.currentWeightedRollPoints,
      importances,
      expectedRevealImportance(
        artifact.mainStat,
        artifact.substats.map((substat) => substat.type),
        matchContext.legalImportanceBySubstat
      ),
      mainContext
    );
  }

  return knownFourExpectedQuality(
    matchContext.currentWeightedRollPoints,
    importances,
    5 - artifact.milestone / 4,
    mainContext
  );
};

export const buildScoringSignature = (profile: BuildScoringProfile): string => {
  const mainSignature = [
    AttributePosition.FLOWER,
    AttributePosition.PLUME,
    AttributePosition.SANDS,
    AttributePosition.GOBLET,
    AttributePosition.CIRCLET,
  ]
    .map((position) => {
      const types = [...(profile.preferredMainStats[position] ?? [])].sort(
        (left, right) => left - right
      );
      return `${position}:${types.join(",")}`;
    })
    .join(";");
  const importanceSignature = Object.entries(profile.importanceBySubstat)
    .map(([type, importance]) => [Number(type), importance] as const)
    .filter(([, importance]) => importance > 0)
    .sort(([left], [right]) => left - right)
    .map(([type, importance]) => `${type}:${importance}`)
    .join(",");
  return `main=${mainSignature}|sub=${importanceSignature}`;
};

export const createPopulationCacheKey = (
  input: NormalFiveStarPopulationInput
): string => {
  assertMilestone(input.milestone);
  getNormalFiveStarMainStatOutcomes(input.position);
  validateNormalSourceFiveStarProfile(input.sourceProfile);
  return [
    POPULATION_ALGORITHM_VERSION,
    buildScoringSignature(input.profile),
    `position=${input.position}`,
    `milestone=${input.milestone}`,
    `source=${normalSourceProfileSignature(input.sourceProfile)}`,
  ].join("|");
};

export const generateNormalFiveStarPopulation = (
  input: NormalFiveStarPopulationInput
): NormalFiveStarPopulation => {
  const cacheKey = createPopulationCacheKey(input);
  const upgradeEvents = input.milestone / 4;
  const remainingUpgradeEvents = 5 - upgradeEvents;
  const fourLine = generateKnownFourStartClass(
    input.profile,
    input.position,
    upgradeEvents,
    remainingUpgradeEvents
  );
  const threeLine =
    input.milestone === 0
      ? generateThreeLineAtMilestoneZero(input.profile, input.position)
      : generateKnownFourStartClass(
          input.profile,
          input.position,
          upgradeEvents - 1,
          remainingUpgradeEvents
        );
  const distribution = mixStartClassPopulations({
    threeLine,
    fourLine,
    fourLineStartProbability: input.sourceProfile.fourLineStartProbability,
  });

  return Object.freeze({
    distribution,
    threeLine,
    fourLine,
    cacheKey,
    position: input.position,
    milestone: input.milestone,
    sourceProfile: Object.freeze({ ...input.sourceProfile }),
  });
};

export const generateNormalFiveStarPopulationCooperatively = async (
  input: NormalFiveStarPopulationInput,
  options: CooperativeComputationOptions | CooperativeComputation = {}
): Promise<NormalFiveStarPopulation | undefined> => {
  const cacheKey = createPopulationCacheKey(input);
  const computation = useCooperativeComputation(options);
  const upgradeEvents = input.milestone / 4;
  const remainingUpgradeEvents = 5 - upgradeEvents;
  const fourLine = await generateKnownFourStartClassCooperatively(
    input.profile,
    input.position,
    upgradeEvents,
    remainingUpgradeEvents,
    computation
  );
  if (!fourLine) return undefined;
  const threeLine =
    input.milestone === 0
      ? await generateThreeLineAtMilestoneZeroCooperatively(
          input.profile,
          input.position,
          computation
        )
      : await generateKnownFourStartClassCooperatively(
          input.profile,
          input.position,
          upgradeEvents - 1,
          remainingUpgradeEvents,
          computation
        );
  if (!threeLine) return undefined;

  const distribution = await createScoreDistributionCooperatively(
    [
      ...threeLine.atoms.map((atom) => ({
        score: atom.score,
        probability:
          atom.probability * (1 - input.sourceProfile.fourLineStartProbability),
      })),
      ...fourLine.atoms.map((atom) => ({
        score: atom.score,
        probability:
          atom.probability * input.sourceProfile.fourLineStartProbability,
      })),
    ],
    computation
  );
  if (!distribution) return undefined;

  return Object.freeze({
    distribution,
    threeLine,
    fourLine,
    cacheKey,
    position: input.position,
    milestone: input.milestone,
    sourceProfile: Object.freeze({ ...input.sourceProfile }),
  });
};
