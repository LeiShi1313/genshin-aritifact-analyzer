import {
  FIVE_STAR_SUBSTAT_TYPES,
  FIVE_STAR_SUBSTAT_TYPE_WEIGHTS,
} from "./rollData";
import {
  createBuildMatchContext,
  projectWeightedRollPointsToMatch,
  type BuildMatchContext,
} from "./match";
import type {
  BuildMatchResult,
  BuildScoringProfile,
  CanonicalArtifactState,
} from "./types";

export const getExpectedFourthLineImportance = (
  artifact: CanonicalArtifactState,
  profile: BuildScoringProfile
): number => {
  const excludedTypes = new Set([
    artifact.mainStat,
    ...artifact.substats.map((substat) => substat.type),
  ]);
  let remainingTypeWeight = 0;
  let weightedImportance = 0;

  for (const type of FIVE_STAR_SUBSTAT_TYPES) {
    if (excludedTypes.has(type)) continue;
    const typeWeight = FIVE_STAR_SUBSTAT_TYPE_WEIGHTS[type];
    remainingTypeWeight += typeWeight;
    weightedImportance += typeWeight * (profile.importanceBySubstat[type] ?? 0);
  }

  return remainingTypeWeight === 0
    ? 0
    : weightedImportance / remainingTypeWeight;
};

export const evaluateExpectedBuildMatchAt20 = (
  artifact: CanonicalArtifactState,
  profile: BuildScoringProfile
): BuildMatchResult => {
  const context = createBuildMatchContext(artifact, profile);
  return evaluateExpectedBuildMatchAt20FromContext(context);
};

export const evaluateExpectedBuildMatchAt20FromContext = (
  context: BuildMatchContext
): BuildMatchResult => {
  const { artifact, profile } = context;
  const existingImportance = artifact.substats.reduce(
    (total, substat) =>
      total + (context.legalImportanceBySubstat[substat.type] ?? 0),
    0
  );
  let expectedWeightedRollPoints = context.currentWeightedRollPoints;

  if (artifact.substats.length === 3) {
    expectedWeightedRollPoints +=
      (17 / 2) * existingImportance +
      17 * getExpectedFourthLineImportance(artifact, profile);
  } else {
    const remainingUpgradeEvents = 5 - artifact.milestone / 4;
    expectedWeightedRollPoints +=
      remainingUpgradeEvents * (17 / 8) * existingImportance;
  }

  return projectWeightedRollPointsToMatch(context, expectedWeightedRollPoints);
};
