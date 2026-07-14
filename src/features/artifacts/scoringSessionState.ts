import type {
  ArtifactEvaluationBatch,
  PotentialDelta,
  ProspectDelta,
  ScoringPhase,
  ScoringWorkerResponse,
  SetEligibilityPolicyBatch,
  WorkerIssue,
} from "../../workers/artifactScoringProtocol";
import { pairKey } from "../../workers/artifactScoringProtocol";

interface PhaseProgress {
  readonly completed: number;
  readonly total: number;
}

type PhaseStatus = "idle" | "pending" | "ready" | "error" | "unavailable";

interface PhaseState {
  readonly status: PhaseStatus;
  readonly requestId?: string;
  readonly progress: PhaseProgress;
  readonly issues: readonly WorkerIssue[];
}

export interface ArtifactScoringSessionState {
  readonly summary: PhaseState & {
    readonly batch?: ArtifactEvaluationBatch;
    readonly summaryKey?: string;
  };
  readonly setEligibility: PhaseState & {
    readonly policy?: SetEligibilityPolicyBatch;
  };
  readonly prospect: PhaseState & {
    readonly results: Readonly<Record<string, ProspectDelta>>;
  };
  readonly potential: PhaseState & {
    readonly results: Readonly<Record<string, PotentialDelta>>;
  };
}

const idlePhase = (): PhaseState => ({
  status: "idle",
  progress: { completed: 0, total: 0 },
  issues: [],
});

export const initialArtifactScoringSessionState =
  (): ArtifactScoringSessionState => ({
    summary: idlePhase(),
    setEligibility: idlePhase(),
    prospect: { ...idlePhase(), results: {} },
    potential: { ...idlePhase(), results: {} },
  });

export type SessionAction =
  | {
      readonly type: "request";
      readonly phase: ScoringPhase;
      readonly requestId: string;
    }
  | { readonly type: "response"; readonly response: ScoringWorkerResponse }
  | { readonly type: "reset" }
  | { readonly type: "invalidatePopulationResults" }
  | { readonly type: "workerUnavailable" };

const isCurrent = (phase: PhaseState, requestId: string): boolean =>
  phase.requestId === requestId;

const requested = (phase: PhaseState, requestId: string): PhaseState => ({
  ...phase,
  status: "pending",
  requestId,
  progress: { completed: 0, total: 0 },
  issues: [],
});

const invalidatedPhase = (phase: PhaseState): PhaseState => ({
  ...idlePhase(),
  status: phase.status === "unavailable" ? "unavailable" : "idle",
});

export const artifactScoringSessionReducer = (
  state: ArtifactScoringSessionState,
  action: SessionAction
): ArtifactScoringSessionState => {
  if (action.type === "reset") {
    return initialArtifactScoringSessionState();
  }

  if (action.type === "workerUnavailable") {
    return {
      ...state,
      prospect: {
        ...state.prospect,
        status: "unavailable",
        requestId: undefined,
      },
      potential: {
        ...state.potential,
        status: "unavailable",
        requestId: undefined,
      },
      setEligibility: {
        ...state.setEligibility,
        status: "unavailable",
        requestId: undefined,
        policy: undefined,
      },
    };
  }

  if (action.type === "invalidatePopulationResults") {
    const potentialResults = Object.fromEntries(
      Object.entries(state.potential.results).map(([key, delta]) => [
        key,
        delta.status === "ok" &&
        delta.finishChance.kind === "conservative-top-ten"
          ? { ...delta, finishChance: { kind: "none" as const } }
          : delta,
      ])
    );
    return {
      ...state,
      prospect: { ...invalidatedPhase(state.prospect), results: {} },
      potential: {
        ...invalidatedPhase(state.potential),
        results: potentialResults,
      },
      setEligibility: invalidatedPhase(state.setEligibility),
    };
  }

  if (action.type === "request") {
    if (action.phase === "summary") {
      return {
        summary: requested(idlePhase(), action.requestId),
        prospect: { ...idlePhase(), results: {} },
        potential: { ...idlePhase(), results: {} },
        setEligibility: idlePhase(),
      };
    }
    return {
      ...state,
      [action.phase]: requested(state[action.phase], action.requestId),
    };
  }

  const response = action.response;
  if (response.type === "progress") {
    const phase = state[response.phase];
    if (!isCurrent(phase, response.requestId)) return state;
    return {
      ...state,
      [response.phase]: {
        ...phase,
        progress: { completed: response.completed, total: response.total },
      },
    };
  }

  if (response.type === "summaryComplete") {
    if (!isCurrent(state.summary, response.requestId)) return state;
    return {
      ...state,
      summary: {
        ...state.summary,
        status: "ready",
        batch: response.batch,
        summaryKey: response.summaryKey,
        issues: response.issues,
        progress: {
          completed: response.batch.artifactCount,
          total: response.batch.artifactCount,
        },
      },
    };
  }

  if (response.type === "prospectChunk") {
    if (!isCurrent(state.prospect, response.requestId)) return state;
    const results = { ...state.prospect.results };
    response.results.forEach((result) => {
      results[pairKey(result.pair)] = result;
    });
    return { ...state, prospect: { ...state.prospect, results } };
  }

  if (response.type === "setEligibilityComplete") {
    if (!isCurrent(state.setEligibility, response.requestId)) return state;
    return {
      ...state,
      setEligibility: {
        ...state.setEligibility,
        status: "ready",
        policy: response.policy,
        progress: {
          completed: response.policy.buildCount,
          total: response.policy.buildCount,
        },
      },
    };
  }

  if (response.type === "potentialChunk") {
    if (!isCurrent(state.potential, response.requestId)) return state;
    const results = { ...state.potential.results };
    response.results.forEach((result) => {
      results[pairKey(result.pair)] = result;
    });
    return { ...state, potential: { ...state.potential, results } };
  }

  if (
    response.type === "prospectComplete" ||
    response.type === "potentialComplete"
  ) {
    const phaseName =
      response.type === "prospectComplete" ? "prospect" : "potential";
    const phase = state[phaseName];
    if (!isCurrent(phase, response.requestId)) return state;
    return { ...state, [phaseName]: { ...phase, status: "ready" } };
  }

  if (response.type === "error") {
    const phase = state[response.phase];
    if (!isCurrent(phase, response.requestId)) return state;
    return {
      ...state,
      [response.phase]: { ...phase, status: "error", issues: response.issues },
    };
  }

  if (response.type === "cancelled") {
    const phase = state[response.phase];
    if (!isCurrent(phase, response.requestId)) return state;
    return { ...state, [response.phase]: { ...phase, status: "idle" } };
  }

  return state;
};
