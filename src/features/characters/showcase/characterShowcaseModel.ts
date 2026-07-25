import type { Artifact } from "../../../genshin/artifact";
import {
  AttributePosition,
  type AttributeType,
} from "../../../genshin/attribute";
import type { Build } from "../../../genshin/build";
import type { Character } from "../../../genshin/character";
import { getArtifactMainStatValue } from "../../../utils/artifactMainStat";
import {
  canonicalizeArtifact,
  classifyArtifactSetCompatibility,
  classifyBuildSetPlan,
  evaluateBuildMatch,
  SET_COMPATIBILITY,
  toPublicArtifactScore,
  validateBuild,
} from "../../../utils/artifactScoring";

export const CHARACTER_ARTIFACT_POSITIONS = Object.freeze([
  AttributePosition.FLOWER,
  AttributePosition.PLUME,
  AttributePosition.SANDS,
  AttributePosition.GOBLET,
  AttributePosition.CIRCLET,
]);

export type CharacterStatsPresentationStatus =
  | "loading"
  | "error"
  | "invalid"
  | "partial"
  | "complete";

export const getCharacterStatsPresentation = (
  status: CharacterStatsPresentationStatus
) => {
  const isComplete = status === "complete";
  const noticeKey =
    status === "loading"
      ? "notice.statsLoading"
      : status === "error"
      ? "notice.statsError"
      : status === "invalid" || status === "partial"
      ? "notice.statsUnavailable"
      : undefined;

  return {
    canDisplay: isComplete,
    canExport: isComplete,
    noticeKey,
  } as const;
};

const exportFileStem = (value: string): string =>
  value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

export const getCharacterShowcaseExportFileName = (
  displayName: string,
  characterKey: string
): string => {
  const stem =
    exportFileStem(displayName) || exportFileStem(characterKey) || "character";
  return `${stem}-build.png`;
};

interface CharacterSourceUpload {
  readonly date?: Date | string | number;
  readonly characters?: readonly { readonly character: Character }[];
  readonly items?: readonly Artifact[];
  readonly [key: string]: unknown;
}

export interface CharacterSource {
  readonly id: string;
  readonly upload: CharacterSourceUpload;
}

export const getLatestCharacterSource = (
  uploads: Readonly<Record<string, CharacterSourceUpload>> | undefined
): CharacterSource | undefined => {
  if (!uploads) return undefined;

  return Object.entries(uploads)
    .filter(([, upload]) => (upload.characters?.length ?? 0) > 0)
    .map(([id, upload]) => ({ id, upload }))
    .sort((left, right) => {
      const leftDate = new Date(left.upload.date ?? 0).getTime() || 0;
      const rightDate = new Date(right.upload.date ?? 0).getTime() || 0;
      return rightDate - leftDate;
    })[0];
};

export const getEquippedArtifacts = (
  upload: { readonly items?: readonly Artifact[] } | undefined,
  character: Character
): readonly (Artifact | undefined)[] =>
  CHARACTER_ARTIFACT_POSITIONS.map((position) =>
    upload?.items?.find(
      (artifact) =>
        artifact.character === character && artifact.position === position
    )
  );

export const getResolvedArtifactMainAttribute = (
  artifact: Artifact
): Artifact["mainAttribute"] => {
  if (!artifact.mainAttribute) return undefined;
  return {
    type: artifact.mainAttribute.type,
    value:
      getArtifactMainStatValue(
        artifact.mainAttribute.type,
        artifact.star,
        artifact.level
      ) ?? artifact.mainAttribute.value,
  };
};

export interface CharacterBuildOption {
  readonly id: string;
  readonly build: Build;
  readonly source: "custom" | "preset";
  readonly enabled: boolean;
}

interface CharacterBuildOptionsInput {
  readonly character: Character;
  readonly customBuilds?: Readonly<Record<string, Build>>;
  readonly presetBuilds?: Readonly<Record<string, Build>>;
  readonly config?: Readonly<Record<string, { readonly enabled?: boolean }>>;
}

export const getCharacterBuildOptions = ({
  character,
  customBuilds = {},
  presetBuilds = {},
  config = {},
}: CharacterBuildOptionsInput): readonly CharacterBuildOption[] => {
  const custom = Object.entries(customBuilds)
    .filter(([, build]) => build.character === character)
    .map(([id, build]) => ({
      id,
      build,
      source: "custom" as const,
      enabled: config[id]?.enabled !== false,
    }))
    .sort((left, right) => Number(right.enabled) - Number(left.enabled));
  const presets = Object.entries(presetBuilds)
    .filter(([, build]) => build.character === character)
    .map(([id, build]) => ({
      id,
      build,
      source: "preset" as const,
      enabled: true,
    }));

  return Object.freeze([...custom, ...presets]);
};

export const selectCharacterBuildOption = (
  options: readonly CharacterBuildOption[],
  requestedId?: string | null
): CharacterBuildOption | undefined => {
  if (requestedId) {
    const requested = options.find((option) => option.id === requestedId);
    if (requested) return requested;
  }

  return (
    options.find((option) => option.source === "custom" && option.enabled) ??
    options.find((option) => option.enabled) ??
    options[0]
  );
};

interface CharacterRosterScore {
  readonly averageScore?: number;
}

export const sortCharacterRosterByAverageScore = <
  Entry extends CharacterRosterScore,
>(entries: readonly Entry[]): readonly Entry[] =>
  [...entries].sort((left, right) => {
    if (left.averageScore === undefined) {
      return right.averageScore === undefined ? 0 : 1;
    }
    if (right.averageScore === undefined) return -1;
    return right.averageScore - left.averageScore;
  });

export type ShowcaseSubstatImportance =
  | "core"
  | "useful"
  | "minor"
  | "neutral";

const substatImportance = (
  build: Build,
  type: AttributeType
): ShowcaseSubstatImportance => {
  const value = build.subAttributes.find(
    (attribute) => attribute.type === type
  )?.value;
  if (value === undefined || value <= 0) return "neutral";
  if (value >= 0.8) return "core";
  if (value >= 0.5) return "useful";
  return "minor";
};

const setRoleFor = (
  artifact: Artifact,
  build: Build
): "set-match" | "off-piece" | "neutral" => {
  const compatibility = classifyArtifactSetCompatibility(
    artifact.set,
    classifyBuildSetPlan(build)
  );
  if (compatibility === SET_COMPATIBILITY.MATCH) return "set-match";
  if (compatibility === SET_COMPATIBILITY.MISMATCH) return "off-piece";
  return "neutral";
};

export const buildArtifactShowcase = (
  artifact: Artifact,
  buildOption: CharacterBuildOption | undefined
) => {
  if (!buildOption) {
    return { status: "unscored" as const, issues: Object.freeze([]) };
  }

  const canonical = canonicalizeArtifact(artifact);
  if (canonical.status !== "ok") {
    return {
      status: canonical.status,
      issues: canonical.issues,
    } as const;
  }

  const validated = validateBuild(buildOption.build, buildOption.id);
  if (validated.status !== "ok") {
    return { status: "invalid-build" as const, issues: validated.issues };
  }

  const match = evaluateBuildMatch(canonical.artifact, validated.profile);
  const score = toPublicArtifactScore(match.value);
  if (score === undefined) {
    return { status: "invalid" as const, issues: match.issues };
  }

  return {
    status: "ok" as const,
    score,
    isPreferredMain: match.isPreferredMain,
    setRole: setRoleFor(artifact, buildOption.build),
    substats: canonical.artifact.substats.map((substat) => ({
      type: substat.type,
      importance: substatImportance(buildOption.build, substat.type),
      rollEquivalent: substat.rollValuePoints / 10,
      possibleRollCounts: substat.possibleRollCounts,
    })),
    issues: match.issues,
  };
};
