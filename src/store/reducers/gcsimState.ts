import { GCSim, GCSimScript } from "../../genshin/gcsim";

export type GCSimCatalogStatus = "idle" | "loading" | "ready" | "error";

export interface GCSimState {
  scripts: GCSimScript[];
  status: GCSimCatalogStatus;
  error: string | null;
  currentRequestId: string | null;
}

export const initialGCSimState: GCSimState = {
  scripts: [],
  status: "idle",
  error: null,
  currentRequestId: null,
};

export const shouldStartGCSimFetch = (state: GCSimState): boolean =>
  state.status !== "loading";

export const decodeGCSimScripts = (
  payload: ArrayBuffer | Uint8Array
): GCSimScript[] => {
  const { scripts } = GCSim.decode(new Uint8Array(payload));
  if (scripts.length === 0) {
    throw new Error("GCSim script catalog is empty");
  }
  return scripts;
};

export const beginGCSimFetch = (
  state: GCSimState,
  requestId: string
): GCSimState => ({
  ...state,
  status: "loading",
  error: null,
  currentRequestId: requestId,
});

export const completeGCSimFetch = (
  state: GCSimState,
  scripts: GCSimScript[],
  requestId: string
): GCSimState =>
  state.currentRequestId === requestId
    ? {
        ...state,
        scripts,
        status: "ready",
        error: null,
        currentRequestId: null,
      }
    : state;

export const failGCSimFetch = (
  state: GCSimState,
  error: string,
  requestId: string
): GCSimState =>
  state.currentRequestId === requestId
    ? {
        ...state,
        status: "error",
        error,
        currentRequestId: null,
      }
    : state;
