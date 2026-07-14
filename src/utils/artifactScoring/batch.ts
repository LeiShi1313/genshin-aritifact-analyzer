import type { Artifact } from "../../genshin/artifact";
import type { Build } from "../../genshin/build";
import type { ArtifactEvaluationBatch } from "../../workers/artifactScoringProtocol";
import { ARTIFACT_SCORING_ALGORITHM_VERSION } from "../../workers/artifactScoringProtocol";
import { canonicalizeArtifact } from "./canonicalize";
import {
  CooperativeComputation,
  type CooperativeComputationOptions,
} from "./cooperative";
import { evaluateExpectedBuildMatchAt20FromContext } from "./expected";
import {
  createBuildMatchContext,
  projectWeightedRollPointsToMatch,
} from "./match";
import type {
  BuildScoringProfile,
  CanonicalArtifactState,
  EvaluationIssue,
  EvaluationIssueCode,
} from "./types";
import { validateBuild } from "./validation";

export const ENTITY_STATUS = {
  OK: 0,
  UNSUPPORTED: 1,
  INVALID: 2,
} as const;

const ISSUE_CODES: readonly EvaluationIssueCode[] = [
  "UNSUPPORTED_ARTIFACT_STAR_RARITY",
  "MISSING_MAIN_STAT",
  "DUPLICATE_SUBSTAT",
  "SUBSTAT_EQUALS_MAIN_STAT",
  "INVALID_ARTIFACT_LEVEL",
  "INVALID_VISIBLE_LINE_COUNT",
  "IMPOSSIBLE_SUBSTAT_VALUE",
  "IMPOSSIBLE_TOTAL_ROLL_COUNT",
  "INVALID_BUILD_MAIN_STAT",
  "INVALID_BUILD_SUBSTAT",
  "DUPLICATE_BUILD_SUBSTAT",
  "INVALID_BUILD_IMPORTANCE",
  "NO_LEGAL_DESIRED_SUBSTAT",
  "INVALID_WORKER_REQUEST",
  "STALE_SCORING_SNAPSHOT",
] as const;

const ISSUE_FLAG = new Map(
  ISSUE_CODES.map((code, index) => [code, 1 << index] as const)
);

export const evaluationIssueFlags = (
  issues: readonly EvaluationIssue[]
): number =>
  issues.reduce(
    (flags, issue) => flags | (ISSUE_FLAG.get(issue.code) ?? 0),
    0
  ) >>> 0;

const fnv1a32 = (value: string, seed: number): string => {
  let hash = seed;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

const contentHash64 = (value: string): string =>
  `${fnv1a32(value, 0x811c9dc5)}${fnv1a32(value, 0x9e3779b9)}`;

const summaryContentSignature = (
  artifacts: readonly Artifact[],
  builds: readonly { readonly id: string; readonly build: Build }[]
): string =>
  contentHash64(
    JSON.stringify([
      artifacts.map((artifact) => [
        artifact.star,
        artifact.level,
        artifact.position,
        artifact.mainAttribute?.type ?? 0,
        artifact.subAttributes.map((attribute) => [
          attribute.type,
          attribute.value,
        ]),
      ]),
      builds.map(({ id, build }) => [
        id,
        build.flowerAttributes,
        build.plumeAttributes,
        build.sandsAttributes,
        build.gobletAttributes,
        build.circletAttributes,
        build.subAttributes.map((attribute) => [
          attribute.type,
          attribute.value,
        ]),
      ]),
    ])
  );

export interface ArtifactScoringSnapshot {
  readonly datasetId: string;
  readonly summaryKey: string;
  readonly batch: ArtifactEvaluationBatch;
  readonly canonicalArtifacts: readonly (CanonicalArtifactState | undefined)[];
  readonly buildProfiles: readonly (BuildScoringProfile | undefined)[];
  readonly issues: readonly EvaluationIssue[];
}

interface PreparedArtifactBatch {
  readonly datasetId: string;
  readonly artifactCount: number;
  readonly buildCount: number;
  readonly batch: ArtifactEvaluationBatch;
  readonly canonicalArtifacts: (CanonicalArtifactState | undefined)[];
  readonly buildProfiles: (BuildScoringProfile | undefined)[];
  readonly issues: EvaluationIssue[];
  readonly summaryKey: string;
}

const prepareArtifactBatch = (
  datasetId: string,
  artifacts: readonly Artifact[],
  builds: readonly { readonly id: string; readonly build: Build }[]
): PreparedArtifactBatch => {
  const artifactCount = artifacts.length;
  const buildCount = builds.length;
  const pairCount = artifactCount * buildCount;
  const artifactStatus = new Uint8Array(artifactCount);
  const artifactIssueFlags = new Uint32Array(artifactCount);
  const buildStatus = new Uint8Array(buildCount);
  const buildIssueFlags = new Uint32Array(buildCount);
  const match = new Float64Array(pairCount);
  const expectedFinalMatch = new Float64Array(pairCount);
  const isPreferredMain = new Uint8Array(pairCount);
  const pairIssueFlags = new Uint32Array(pairCount);
  match.fill(Number.NaN);
  expectedFinalMatch.fill(Number.NaN);

  const issues: EvaluationIssue[] = [];
  const canonicalArtifacts = artifacts.map((artifact, artifactIndex) => {
    const result = canonicalizeArtifact(artifact, artifactIndex);
    issues.push(...result.issues);
    artifactIssueFlags[artifactIndex] = evaluationIssueFlags(result.issues);
    if (result.status !== "ok") {
      artifactStatus[artifactIndex] =
        result.status === "unsupported"
          ? ENTITY_STATUS.UNSUPPORTED
          : ENTITY_STATUS.INVALID;
      return undefined;
    }
    return result.artifact;
  });
  const buildProfiles = builds.map(({ id, build }, buildIndex) => {
    const result = validateBuild(build, id);
    issues.push(...result.issues);
    buildIssueFlags[buildIndex] = evaluationIssueFlags(result.issues);
    if (result.status !== "ok") {
      buildStatus[buildIndex] = ENTITY_STATUS.INVALID;
      return undefined;
    }
    return result.profile;
  });
  const batch: ArtifactEvaluationBatch = {
    datasetId,
    algorithmVersion: ARTIFACT_SCORING_ALGORITHM_VERSION,
    buildIds: builds.map(({ id }) => id),
    artifactCount,
    buildCount,
    artifactStatus,
    artifactIssueFlags,
    buildStatus,
    buildIssueFlags,
    match,
    expectedFinalMatch,
    isPreferredMain,
    pairIssueFlags,
  };

  return {
    datasetId,
    artifactCount,
    buildCount,
    batch,
    canonicalArtifacts,
    buildProfiles,
    issues,
    summaryKey: `${ARTIFACT_SCORING_ALGORITHM_VERSION}:${datasetId}:${summaryContentSignature(
      artifacts,
      builds
    )}`,
  };
};

const evaluateArtifactRow = (
  prepared: PreparedArtifactBatch,
  artifactIndex: number
): void => {
  const artifact = prepared.canonicalArtifacts[artifactIndex];
  if (!artifact) return;

  prepared.buildProfiles.forEach((profile, buildIndex) => {
    if (!profile) return;
    const pairIndex = artifactIndex * prepared.buildCount + buildIndex;
    const context = createBuildMatchContext(artifact, profile);
    const current = projectWeightedRollPointsToMatch(
      context,
      context.currentWeightedRollPoints
    );
    const expected = evaluateExpectedBuildMatchAt20FromContext(context);
    prepared.batch.match[pairIndex] = current.value;
    prepared.batch.expectedFinalMatch[pairIndex] = expected.value;
    prepared.batch.isPreferredMain[pairIndex] = Number(current.isPreferredMain);
    prepared.batch.pairIssueFlags[pairIndex] = evaluationIssueFlags([
      ...current.issues,
      ...expected.issues,
    ]);
  });
};

const finishArtifactBatch = (
  prepared: PreparedArtifactBatch
): ArtifactScoringSnapshot =>
  Object.freeze({
    datasetId: prepared.datasetId,
    summaryKey: prepared.summaryKey,
    batch: prepared.batch,
    canonicalArtifacts: Object.freeze(prepared.canonicalArtifacts),
    buildProfiles: Object.freeze(prepared.buildProfiles),
    issues: Object.freeze(prepared.issues),
  });

export const evaluateArtifactBatch = (
  datasetId: string,
  artifacts: readonly Artifact[],
  builds: readonly { readonly id: string; readonly build: Build }[],
  onProgress?: (completed: number, total: number) => void
): ArtifactScoringSnapshot => {
  const prepared = prepareArtifactBatch(datasetId, artifacts, builds);
  for (
    let artifactIndex = 0;
    artifactIndex < prepared.artifactCount;
    artifactIndex += 1
  ) {
    evaluateArtifactRow(prepared, artifactIndex);
    onProgress?.(artifactIndex + 1, prepared.artifactCount);
  }
  return finishArtifactBatch(prepared);
};

export interface CooperativeBatchOptions extends CooperativeComputationOptions {
  readonly onProgress?: (completed: number, total: number) => void;
}

export const evaluateArtifactBatchCooperatively = async (
  datasetId: string,
  artifacts: readonly Artifact[],
  builds: readonly { readonly id: string; readonly build: Build }[],
  options: CooperativeBatchOptions = {}
): Promise<ArtifactScoringSnapshot | undefined> => {
  const computation = new CooperativeComputation(options);
  const prepared = prepareArtifactBatch(datasetId, artifacts, builds);

  for (
    let artifactIndex = 0;
    artifactIndex < prepared.artifactCount;
    artifactIndex += 1
  ) {
    if (computation.cancelled) return undefined;
    evaluateArtifactRow(prepared, artifactIndex);
    options.onProgress?.(artifactIndex + 1, prepared.artifactCount);
    if (computation.cancelled) return undefined;
    if (computation.isYieldDue() && !(await computation.yield())) {
      return undefined;
    }
  }

  return finishArtifactBatch(prepared);
};

export const artifactBatchTransferList = (
  batch: ArtifactEvaluationBatch
): Transferable[] => [
  batch.artifactStatus.buffer,
  batch.artifactIssueFlags.buffer,
  batch.buildStatus.buffer,
  batch.buildIssueFlags.buffer,
  batch.match.buffer,
  batch.expectedFinalMatch.buffer,
  batch.isPreferredMain.buffer,
  batch.pairIssueFlags.buffer,
];

export const artifactBatchByteLength = (
  batch: ArtifactEvaluationBatch
): number =>
  artifactBatchTransferList(batch).reduce(
    (total, buffer) => total + (buffer as ArrayBuffer).byteLength,
    0
  );
