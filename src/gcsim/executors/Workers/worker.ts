/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-ignore
self.importScripts("/gcsim/wasm_exec.js");

// Fetch and decompress gzipped WASM
async function fetchWasm(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  // Check if gzip compressed (magic bytes: 1f 8b)
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    // Decompress using DecompressionStream
    const ds = new DecompressionStream('gzip');
    const decompressedStream = new Response(buffer).body!.pipeThrough(ds);
    return await new Response(decompressedStream).arrayBuffer();
  }

  return buffer;
}

// @ts-ignore
function ready(req: { wasm: string }) {
  const go = new Go();
  fetchWasm(req.wasm)
    .then((buffer) => WebAssembly.instantiate(buffer, go.importObject))
    .then((result) => {
      go.run(result.instance);
      postMessage({ type: WorkerResponse.Ready });
    })
    .catch((e) => {
      console.error(e);
      postMessage({
        type: WorkerResponse.Failed,
        reason: e instanceof Error ? e.message : "Unknown Error",
      });
    });
}

// @ts-ignore
function initialize(req: { cfg: string }) {
  const resp = initializeWorker(req.cfg);
  if (resp != null) {
    return { type: WorkerResponse.Failed, reason: JSON.parse(resp).error };
  }
  return { type: WorkerResponse.Initialized };
}

function run(req: { itr: number }) {
  try {
    const resp = simulate();
    if (typeof resp == "string" || resp instanceof String) {
      return {
        type: WorkerResponse.Failed,
        reason: JSON.parse(resp as string).error,
      };
    }
    return { type: WorkerResponse.Done, result: resp, itr: req.itr };
  } catch (e) {
    console.log("simulate() call failed");
    return { type: WorkerResponse.Failed, reason: `Failed with error: ${e}` };
  }
}

// @ts-ignore
function handleRequest(req: any) {
  switch (req.type as WorkerRequest) {
    case WorkerRequest.Ready:
      return ready(req);
    case WorkerRequest.Initialize:
      return postMessage(initialize(req));
    case WorkerRequest.Run:
      return postMessage(run(req));
    default:
      console.error("aggregator - unknown request: ", req);
      throw new Error("aggregator unknown request");
  }
}
onmessage = (ev) => handleRequest(ev.data);

// TODO: I hate this
// Web Workers do not currently support modules (in all browsers), so instead the relevant code in common
// has to be copy/pasted over
// Clean up when supported: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

enum WorkerRequest {
  Ready = "ready",
  Initialize = "initialize",
  Run = "run",
}

enum WorkerResponse {
  Failed = "failed",
  Ready = "ready",
  Initialized = "initialized",
  Done = "done",
}
