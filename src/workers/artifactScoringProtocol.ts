import type { Artifact } from "../genshin/artifact";
import type { Build } from "../genshin/build";
import type { ScoreBatchView } from "../features/artifacts/scoringViewModel";

export const ARTIFACT_SCORING_ALGORITHM_VERSION = "artifact-scoring-v3";

export interface PairRef {
  readonly artifactIndex: number;
  readonly buildIndex: number;
}

export interface NormalSourceFiveStarProfile {
  readonly kind: "normal-five-star";
  readonly fourLineStartProbability: number;
}

export interface ArtifactEvaluationBatch extends ScoreBatchView {
  readonly datasetId: string;
  readonly algorithmVersion: string;
}

export const SET_ELIGIBILITY_GATE_STATUS = {
  NOT_APPLICABLE: 0,
  AVAILABLE: 1,
  UNAVAILABLE: 2,
} as const;

export interface SetEligibilityPolicyBatch {
  readonly buildCount: number;
  /** Two stages (+0 reference, +20) by five positions for every Build. */
  readonly gateStatus: Uint8Array;
  readonly offPieceCutoff: Uint8Array;
  readonly expectedFiveStarDrops: Float64Array;
}

export const SET_ELIGIBILITY_GATES_PER_BUILD = 10;

export const setEligibilityGateIndex = (
  buildIndex: number,
  referenceMilestone: 0 | 20,
  position: number
): number => {
  if (!Number.isInteger(buildIndex) || buildIndex < 0) {
    throw new RangeError("Build index must be a nonnegative integer");
  }
  if (!Number.isInteger(position) || position < 1 || position > 5) {
    throw new RangeError(
      "Set eligibility requires a standard artifact position"
    );
  }
  if (referenceMilestone !== 0 && referenceMilestone !== 20) {
    throw new RangeError("Set eligibility reference must be +0 or +20");
  }
  const stageOffset = referenceMilestone === 20 ? 5 : 0;
  return (
    buildIndex * SET_ELIGIBILITY_GATES_PER_BUILD + stageOffset + position - 1
  );
};

export interface WorkerIssue {
  readonly code: string;
  readonly severity: "warning" | "error";
  readonly artifactIndex?: number;
  readonly buildId?: string;
  readonly details?: Readonly<Record<string, string | number>>;
}

export interface ProspectResult {
  readonly percentile: number;
  readonly tailProbability: number;
  readonly position: number;
  readonly milestone: number;
  readonly sourceProfile: NormalSourceFiveStarProfile;
}

export type TopTenFinishResult =
  | {
      readonly status: "available";
      readonly targetFinalMatch: number;
      readonly probability: number;
    }
  | {
      readonly status: "unavailable";
      readonly reason: "TOP_DECILE_CUT_NOT_REACHABLE";
    };

export interface PotentialResult {
  readonly expectedFinalMatch: number;
  readonly p10FinalMatch: number;
  readonly medianFinalMatch: number;
  readonly p90FinalMatch: number;
  readonly bestReachableFinalMatch: number;
}

export type FinishChanceResult =
  | { readonly kind: "none" }
  | {
      readonly kind: "conservative-top-ten";
      readonly result: TopTenFinishResult;
    }
  | {
      readonly kind: "absolute-match";
      readonly targetFinalMatch: number;
      readonly probability: number;
    };

export interface ExactRationalTarget {
  readonly numerator: bigint;
  readonly denominator: bigint;
}

export type PotentialFinishTarget =
  | { readonly kind: "none" }
  | {
      readonly kind: "conservative-top-ten";
      readonly sourceProfile: NormalSourceFiveStarProfile;
    }
  | {
      readonly kind: "absolute-match";
      readonly target: ExactRationalTarget;
    };

export type ScoringWorkerRequest =
  | {
      readonly type: "summary";
      readonly requestId: string;
      readonly datasetId: string;
      readonly artifacts: readonly Artifact[];
      readonly builds: readonly {
        readonly id: string;
        readonly build: Build;
      }[];
    }
  | {
      readonly type: "setEligibility";
      readonly requestId: string;
      readonly datasetId: string;
      readonly summaryKey: string;
      readonly sourceProfile: NormalSourceFiveStarProfile;
    }
  | {
      readonly type: "prospect";
      readonly requestId: string;
      readonly datasetId: string;
      readonly summaryKey: string;
      readonly targets: readonly PairRef[];
      readonly sourceProfile: NormalSourceFiveStarProfile;
    }
  | {
      readonly type: "potential";
      readonly requestId: string;
      readonly datasetId: string;
      readonly summaryKey: string;
      readonly targets: readonly PairRef[];
      readonly finishTarget: PotentialFinishTarget;
    }
  | { readonly type: "cancel"; readonly requestId: string };

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export const scoringRequestIdOrUnknown = (value: unknown): string =>
  isNonEmptyString(value) ? value : "unknown";

export const hasValidLazyRequestIdentity = (
  value: unknown,
  phase: "setEligibility" | "prospect" | "potential"
): boolean => {
  if (!value || typeof value !== "object") return false;
  const request = value as Record<string, unknown>;
  return (
    request.type === phase &&
    isNonEmptyString(request.requestId) &&
    isNonEmptyString(request.datasetId) &&
    isNonEmptyString(request.summaryKey)
  );
};

export type ProspectDelta =
  | {
      readonly pair: PairRef;
      readonly status: "ok";
      readonly result: ProspectResult;
    }
  | {
      readonly pair: PairRef;
      readonly status: "unsupported" | "invalid";
      readonly issues: readonly WorkerIssue[];
    };

export type PotentialDelta =
  | {
      readonly pair: PairRef;
      readonly status: "ok";
      readonly result: PotentialResult;
      readonly finishChance: FinishChanceResult;
    }
  | {
      readonly pair: PairRef;
      readonly status: "unsupported" | "invalid";
      readonly issues: readonly WorkerIssue[];
    };

export type ScoringPhase =
  | "summary"
  | "setEligibility"
  | "prospect"
  | "potential";

export type ScoringWorkerResponse =
  | {
      readonly type: "progress";
      readonly requestId: string;
      readonly phase: ScoringPhase;
      readonly completed: number;
      readonly total: number;
    }
  | {
      readonly type: "summaryComplete";
      readonly requestId: string;
      readonly batch: ArtifactEvaluationBatch;
      readonly summaryKey: string;
      readonly issues: readonly WorkerIssue[];
    }
  | {
      readonly type: "setEligibilityComplete";
      readonly requestId: string;
      readonly policy: SetEligibilityPolicyBatch;
    }
  | {
      readonly type: "prospectChunk";
      readonly requestId: string;
      readonly results: readonly ProspectDelta[];
    }
  | { readonly type: "prospectComplete"; readonly requestId: string }
  | {
      readonly type: "potentialChunk";
      readonly requestId: string;
      readonly results: readonly PotentialDelta[];
    }
  | { readonly type: "potentialComplete"; readonly requestId: string }
  | {
      readonly type: "cancelled";
      readonly requestId: string;
      readonly phase: ScoringPhase;
    }
  | {
      readonly type: "error";
      readonly requestId: string;
      readonly phase: ScoringPhase;
      readonly issues: readonly WorkerIssue[];
    };

export const pairKey = ({ artifactIndex, buildIndex }: PairRef): string =>
  `${artifactIndex}:${buildIndex}`;
