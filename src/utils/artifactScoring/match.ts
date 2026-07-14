import type { AttributeType } from "../../genshin/attribute";
import type {
  BuildMatchResult,
  BuildScoringProfile,
  CanonicalArtifactState,
  EvaluationIssue,
} from "./types";

export interface BuildMatchContext {
  readonly artifact: CanonicalArtifactState;
  readonly profile: BuildScoringProfile;
  readonly isPreferredMain: boolean;
  readonly legalImportanceBySubstat: Readonly<
    Partial<Record<AttributeType, number>>
  >;
  readonly denominatorImportance: number;
  readonly currentWeightedRollPoints: number;
  readonly issues: readonly EvaluationIssue[];
}

export const createBuildMatchContext = (
  artifact: CanonicalArtifactState,
  profile: BuildScoringProfile
): BuildMatchContext => {
  const legalImportanceBySubstat = Object.freeze(
    Object.fromEntries(
      Object.entries(profile.importanceBySubstat)
        .map(([type, importance]) => [
          Number(type) as AttributeType,
          importance,
        ])
        .filter(
          ([type, importance]) => type !== artifact.mainStat && importance > 0
        )
    ) as Partial<Record<AttributeType, number>>
  );
  const legalWeights = Object.values(legalImportanceBySubstat).filter(
    (importance): importance is number => importance !== undefined
  );
  const topFourWeights = [...legalWeights].sort((a, b) => b - a).slice(0, 4);
  const maximumWeight = topFourWeights[0] ?? 0;
  const denominatorImportance =
    topFourWeights.reduce((total, weight) => total + weight, 0) +
    5 * maximumWeight;
  const currentWeightedRollPoints = artifact.substats.reduce(
    (total, substat) =>
      total +
      (legalImportanceBySubstat[substat.type] ?? 0) * substat.rollValuePoints,
    0
  );
  const isPreferredMain =
    profile.preferredMainStats[artifact.position]?.includes(
      artifact.mainStat
    ) ?? false;
  const issues: readonly EvaluationIssue[] =
    denominatorImportance === 0
      ? Object.freeze([
          {
            code: "NO_LEGAL_DESIRED_SUBSTAT" as const,
            severity: "warning" as const,
            buildId: profile.id,
            details: Object.freeze({ mainStat: artifact.mainStat }),
          },
        ])
      : Object.freeze([]);

  return Object.freeze({
    artifact,
    profile,
    isPreferredMain,
    legalImportanceBySubstat,
    denominatorImportance,
    currentWeightedRollPoints,
    issues,
  });
};

export const projectWeightedRollPointsToMatch = (
  context: BuildMatchContext,
  weightedRollPoints: number
): BuildMatchResult => {
  const { denominatorImportance, isPreferredMain } = context;
  const mainContribution = isPreferredMain ? 8 / 17 : 0;

  if (denominatorImportance === 0) {
    return Object.freeze({
      value: mainContribution,
      isPreferredMain,
      mainContribution,
      substatContribution: 0,
      issues: context.issues,
    });
  }

  const denominatorPoints = 10 * denominatorImportance;
  const substatContribution =
    (9 * weightedRollPoints) / (17 * denominatorPoints);
  const value =
    (8 * Number(isPreferredMain) * denominatorPoints + 9 * weightedRollPoints) /
    (17 * denominatorPoints);

  return Object.freeze({
    value,
    isPreferredMain,
    mainContribution,
    substatContribution,
    issues: context.issues,
  });
};

export const evaluateBuildMatch = (
  artifact: CanonicalArtifactState,
  profile: BuildScoringProfile
): BuildMatchResult => {
  const context = createBuildMatchContext(artifact, profile);
  return projectWeightedRollPointsToMatch(
    context,
    context.currentWeightedRollPoints
  );
};
