import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import type { Artifact } from "../../genshin/artifact";
import type { Build } from "../../genshin/build";
import { evaluateArtifactBatchCooperatively } from "../../utils/artifactScoring";
import type {
  NormalSourceFiveStarProfile,
  PairRef,
  PotentialFinishTarget,
  ScoringPhase,
  ScoringWorkerRequest,
  ScoringWorkerResponse,
} from "../../workers/artifactScoringProtocol";
import {
  artifactScoringSessionReducer,
  initialArtifactScoringSessionState,
} from "./scoringSessionState";

const requestId = (phase: ScoringPhase): string => {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${phase}-${random}`;
};

interface UseArtifactScoringSessionInput {
  readonly datasetId: string;
  readonly artifacts: readonly Artifact[];
  readonly builds: readonly { readonly id: string; readonly build: Build }[];
  readonly sourceProfile: NormalSourceFiveStarProfile;
}

export const useArtifactScoringSession = ({
  datasetId,
  artifacts,
  builds,
  sourceProfile,
}: UseArtifactScoringSessionInput) => {
  const [state, dispatch] = useReducer(
    artifactScoringSessionReducer,
    undefined,
    initialArtifactScoringSessionState
  );
  const activeRequests = useRef<Partial<Record<ScoringPhase, string>>>({});
  const previousSourceProfile = useRef(sourceProfile);

  const [worker, setWorker] = useState<Worker | null>();

  useEffect(() => {
    if (typeof Worker === "undefined") {
      setWorker(null);
      return;
    }

    let nextWorker: Worker;
    try {
      nextWorker = new Worker(
        new URL("../../workers/calculator.ts", import.meta.url),
        { type: "module" }
      );
    } catch {
      setWorker(null);
      return;
    }
    setWorker(nextWorker);
    return () => nextWorker.terminate();
  }, []);

  const cancel = useCallback(
    (phase: ScoringPhase) => {
      const current = activeRequests.current[phase];
      if (worker && current) {
        worker.postMessage({
          type: "cancel",
          requestId: current,
        } satisfies ScoringWorkerRequest);
      }
      delete activeRequests.current[phase];
    },
    [worker]
  );

  useEffect(() => {
    if (worker === undefined) return;
    if (!worker) {
      dispatch({ type: "workerUnavailable" });
      return;
    }

    const onMessage = (event: MessageEvent<ScoringWorkerResponse>) => {
      const response = event.data;
      dispatch({ type: "response", response });
      const terminalPhase =
        response.type === "summaryComplete"
          ? "summary"
          : response.type === "prospectComplete"
          ? "prospect"
          : response.type === "potentialComplete"
          ? "potential"
          : response.type === "error" || response.type === "cancelled"
          ? response.phase
          : undefined;
      if (
        terminalPhase &&
        activeRequests.current[terminalPhase] === response.requestId
      ) {
        delete activeRequests.current[terminalPhase];
      }
    };
    const onError = () => {
      (Object.keys(activeRequests.current) as ScoringPhase[]).forEach(
        (phase) => {
          const current = activeRequests.current[phase];
          if (!current) return;
          dispatch({
            type: "response",
            response: {
              type: "error",
              requestId: current,
              phase,
              issues: [{ code: "SCORING_WORKER_ERROR", severity: "error" }],
            },
          });
          delete activeRequests.current[phase];
        }
      );
    };
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    return () => {
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
    };
  }, [worker]);

  useEffect(() => {
    if (worker === undefined) return;
    cancel("summary");
    cancel("prospect");
    cancel("potential");
    if (artifacts.length === 0 || builds.length === 0) {
      dispatch({ type: "reset" });
      return;
    }
    if (!worker) return;
    const id = requestId("summary");
    activeRequests.current.summary = id;
    dispatch({ type: "request", phase: "summary", requestId: id });
    worker.postMessage({
      type: "summary",
      requestId: id,
      datasetId,
      artifacts,
      builds,
    } satisfies ScoringWorkerRequest);
  }, [worker, datasetId, artifacts, builds, cancel]);

  useEffect(() => {
    const previous = previousSourceProfile.current;
    previousSourceProfile.current = sourceProfile;
    if (
      previous.kind === sourceProfile.kind &&
      previous.fourLineStartProbability ===
        sourceProfile.fourLineStartProbability
    ) {
      return;
    }
    cancel("prospect");
    cancel("potential");
    dispatch({ type: "invalidatePopulationResults" });
  }, [sourceProfile, cancel]);

  useEffect(() => {
    if (worker !== null || artifacts.length === 0 || builds.length === 0)
      return;
    let active = true;
    const id = requestId("summary");
    activeRequests.current.summary = id;
    dispatch({ type: "request", phase: "summary", requestId: id });
    const timeout = window.setTimeout(async () => {
      if (!active) return;
      try {
        const snapshot = await evaluateArtifactBatchCooperatively(
          datasetId,
          artifacts,
          builds,
          {
            maxSliceMs: 8,
            shouldCancel: () => !active,
            onProgress: (completed, total) => {
              if (!active) return;
              dispatch({
                type: "response",
                response: {
                  type: "progress",
                  requestId: id,
                  phase: "summary",
                  completed,
                  total,
                },
              });
            },
          }
        );
        if (!active || !snapshot) return;
        dispatch({
          type: "response",
          response: {
            type: "summaryComplete",
            requestId: id,
            batch: snapshot.batch,
            summaryKey: snapshot.summaryKey,
            issues: snapshot.issues,
          },
        });
        dispatch({ type: "workerUnavailable" });
      } catch {
        dispatch({
          type: "response",
          response: {
            type: "error",
            requestId: id,
            phase: "summary",
            issues: [{ code: "SCORING_FALLBACK_ERROR", severity: "error" }],
          },
        });
      }
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [worker, datasetId, artifacts, builds]);

  const requestProspect = useCallback(
    (targets: readonly PairRef[]) => {
      if (
        !worker ||
        state.summary.status !== "ready" ||
        !state.summary.summaryKey
      ) {
        return;
      }
      cancel("prospect");
      const id = requestId("prospect");
      activeRequests.current.prospect = id;
      dispatch({ type: "request", phase: "prospect", requestId: id });
      worker.postMessage({
        type: "prospect",
        requestId: id,
        datasetId,
        summaryKey: state.summary.summaryKey,
        targets,
        sourceProfile,
      } satisfies ScoringWorkerRequest);
    },
    [
      worker,
      state.summary.status,
      state.summary.summaryKey,
      cancel,
      datasetId,
      sourceProfile,
    ]
  );

  const requestPotential = useCallback(
    (
      targets: readonly PairRef[],
      finishTarget: PotentialFinishTarget = {
        kind: "conservative-top-ten",
        sourceProfile,
      }
    ) => {
      if (
        !worker ||
        state.summary.status !== "ready" ||
        !state.summary.summaryKey
      ) {
        return;
      }
      cancel("potential");
      const id = requestId("potential");
      activeRequests.current.potential = id;
      dispatch({ type: "request", phase: "potential", requestId: id });
      worker.postMessage({
        type: "potential",
        requestId: id,
        datasetId,
        summaryKey: state.summary.summaryKey,
        targets,
        finishTarget,
      } satisfies ScoringWorkerRequest);
    },
    [
      worker,
      state.summary.status,
      state.summary.summaryKey,
      cancel,
      datasetId,
      sourceProfile,
    ]
  );

  return { state, requestProspect, requestPotential, cancel };
};
