import { createBuildMatchContext } from "./match";
import {
  calculatePotential,
  calculatePotentialCooperatively,
  type PotentialCalculation,
  type RevealImportanceOption,
} from "./potential";
import type {
  CooperativeComputation,
  CooperativeComputationOptions,
} from "./cooperative";
import {
  FIVE_STAR_SUBSTAT_TYPES,
  FIVE_STAR_SUBSTAT_TYPE_WEIGHTS,
} from "./rollData";
import type { BuildScoringProfile, CanonicalArtifactState } from "./types";

export const getRevealImportanceOptions = (
  artifact: CanonicalArtifactState,
  profile: BuildScoringProfile
): readonly RevealImportanceOption[] => {
  if (artifact.substats.length !== 3) return Object.freeze([]);
  const context = createBuildMatchContext(artifact, profile);
  const excluded = new Set([
    artifact.mainStat,
    ...artifact.substats.map((substat) => substat.type),
  ]);
  const candidates = FIVE_STAR_SUBSTAT_TYPES.filter(
    (type) => !excluded.has(type)
  );
  const totalWeight = candidates.reduce(
    (total, type) => total + FIVE_STAR_SUBSTAT_TYPE_WEIGHTS[type],
    0
  );
  return Object.freeze(
    candidates.map((type) =>
      Object.freeze({
        importance: context.legalImportanceBySubstat[type] ?? 0,
        probability: FIVE_STAR_SUBSTAT_TYPE_WEIGHTS[type] / totalWeight,
      })
    )
  );
};

export const calculateArtifactPotential = (
  artifact: CanonicalArtifactState,
  profile: BuildScoringProfile
): PotentialCalculation => {
  const context = createBuildMatchContext(artifact, profile);
  return calculatePotential({
    lines: artifact.substats.map((substat) => ({
      importance: context.legalImportanceBySubstat[substat.type] ?? 0,
      rollValuePoints: substat.rollValuePoints,
    })),
    revealOptions:
      artifact.substats.length === 3
        ? getRevealImportanceOptions(artifact, profile)
        : undefined,
    remainingUpgradeEvents:
      artifact.substats.length === 3 ? 4 : 5 - artifact.milestone / 4,
    preferredMain: context.isPreferredMain,
    denominatorImportance: context.denominatorImportance,
  });
};

export const calculateArtifactPotentialCooperatively = (
  artifact: CanonicalArtifactState,
  profile: BuildScoringProfile,
  options: CooperativeComputationOptions | CooperativeComputation = {}
): Promise<PotentialCalculation | undefined> => {
  const context = createBuildMatchContext(artifact, profile);
  return calculatePotentialCooperatively(
    {
      lines: artifact.substats.map((substat) => ({
        importance: context.legalImportanceBySubstat[substat.type] ?? 0,
        rollValuePoints: substat.rollValuePoints,
      })),
      revealOptions:
        artifact.substats.length === 3
          ? getRevealImportanceOptions(artifact, profile)
          : undefined,
      remainingUpgradeEvents:
        artifact.substats.length === 3 ? 4 : 5 - artifact.milestone / 4,
      preferredMain: context.isPreferredMain,
      denominatorImportance: context.denominatorImportance,
    },
    options
  );
};
