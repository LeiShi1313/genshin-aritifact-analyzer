import type { Artifact } from "../../genshin/artifact";
import { getCanonicalRoll } from "./rollData";
import type {
  CanonicalArtifactState,
  CanonicalizeArtifactResult,
  CanonicalSubstat,
  EvaluationIssue,
  Milestone,
} from "./types";
import { isLegalMainStat } from "./validation";

const artifactError = (
  code: EvaluationIssue["code"],
  artifactIndex?: number,
  details?: EvaluationIssue["details"]
): EvaluationIssue => ({ code, severity: "error", artifactIndex, details });

const milestoneForLevel = (level: number): Milestone =>
  (Math.floor(level / 4) * 4) as Milestone;

const hasLegalTotalRollCount = (
  substats: readonly CanonicalSubstat[],
  milestone: Milestone
): boolean => {
  let possibleTotals = new Set([0]);
  for (const substat of substats) {
    const nextTotals = new Set<number>();
    for (const total of possibleTotals) {
      for (const count of substat.possibleRollCounts)
        nextTotals.add(total + count);
    }
    possibleTotals = nextTotals;
  }

  const upgradeCount = milestone / 4;
  const legalTotals =
    substats.length === 3
      ? upgradeCount === 0
        ? [3]
        : []
      : upgradeCount === 0
      ? [4]
      : [3 + upgradeCount, 4 + upgradeCount];

  return legalTotals.some((total) => possibleTotals.has(total));
};

export const canonicalizeArtifact = (
  artifact: Artifact,
  artifactIndex?: number
): CanonicalizeArtifactResult => {
  if (artifact.star !== 5) {
    return {
      status: "unsupported",
      issues: Object.freeze([
        artifactError("UNSUPPORTED_ARTIFACT_STAR_RARITY", artifactIndex, {
          star: artifact.star,
        }),
      ]),
    };
  }

  const issues: EvaluationIssue[] = [];
  if (
    !artifact.mainAttribute ||
    !isLegalMainStat(artifact.position, artifact.mainAttribute.type)
  ) {
    issues.push(
      artifactError("MISSING_MAIN_STAT", artifactIndex, {
        position: artifact.position,
        attributeType: artifact.mainAttribute?.type ?? 0,
      })
    );
  }

  const validLevel =
    Number.isInteger(artifact.level) &&
    artifact.level >= 0 &&
    artifact.level <= 20;
  if (!validLevel) {
    issues.push(
      artifactError("INVALID_ARTIFACT_LEVEL", artifactIndex, {
        level: artifact.level,
      })
    );
  }
  const milestone = validLevel ? milestoneForLevel(artifact.level) : 0;

  if (
    (artifact.subAttributes.length !== 3 &&
      artifact.subAttributes.length !== 4) ||
    (artifact.subAttributes.length === 3 && milestone >= 4)
  ) {
    issues.push(
      artifactError("INVALID_VISIBLE_LINE_COUNT", artifactIndex, {
        lineCount: artifact.subAttributes.length,
        milestone,
      })
    );
  }

  const seen = new Set<number>();
  const canonicalSubstats: CanonicalSubstat[] = [];
  for (const substat of artifact.subAttributes) {
    if (seen.has(substat.type)) {
      issues.push(
        artifactError("DUPLICATE_SUBSTAT", artifactIndex, {
          attributeType: substat.type,
        })
      );
    }
    seen.add(substat.type);

    if (substat.type === artifact.mainAttribute?.type) {
      issues.push(
        artifactError("SUBSTAT_EQUALS_MAIN_STAT", artifactIndex, {
          attributeType: substat.type,
        })
      );
    }

    const canonical = getCanonicalRoll(substat.type, substat.value);
    if (canonical.status !== "ok") {
      issues.push(
        artifactError("IMPOSSIBLE_SUBSTAT_VALUE", artifactIndex, {
          attributeType: substat.type,
          storedValue: substat.value,
          reason: canonical.status,
        })
      );
      continue;
    }

    canonicalSubstats.push(
      Object.freeze({
        type: substat.type,
        displayValueKey: canonical.displayValueKey,
        rollValuePoints: canonical.rollValuePoints,
        possibleRollCounts: canonical.possibleRollCounts,
      })
    );
  }

  if (
    canonicalSubstats.length === artifact.subAttributes.length &&
    (artifact.subAttributes.length === 3 ||
      artifact.subAttributes.length === 4) &&
    !hasLegalTotalRollCount(canonicalSubstats, milestone)
  ) {
    issues.push(
      artifactError("IMPOSSIBLE_TOTAL_ROLL_COUNT", artifactIndex, {
        milestone,
        lineCount: artifact.subAttributes.length,
      })
    );
  }

  if (issues.length > 0 || !artifact.mainAttribute) {
    return { status: "invalid", issues: Object.freeze(issues) };
  }

  const canonicalArtifact = Object.freeze({
    position: artifact.position,
    level: artifact.level,
    milestone,
    mainStat: artifact.mainAttribute.type,
    substats: Object.freeze(canonicalSubstats),
  }) as CanonicalArtifactState;

  return {
    status: "ok",
    artifact: canonicalArtifact,
    issues: Object.freeze([]),
  };
};
