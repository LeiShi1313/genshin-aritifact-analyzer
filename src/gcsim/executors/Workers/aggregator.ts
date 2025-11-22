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
      console.log("aggregator loaded okay");
      postMessage({ type: AggResponse.Ready });
    })
    .catch((e) => {
      console.error(e);
      postMessage({
        type: AggResponse.Failed,
        reason: e instanceof Error ? e.message : "Unknown Error",
      });
    });
}

// @ts-ignore
function initialize(req: { cfg: string }) {
  const resp = JSON.parse(initializeAggregator(req.cfg));
  if (resp.error) {
    return { type: AggResponse.Failed, reason: resp.error };
  }
  return { type: AggResponse.Initialized, result: resp };
}

function add(req: { result: Uint8Array }) {
  const resp = aggregate(req.result);
  if (resp != null) {
    return { type: AggResponse.Failed, reason: JSON.parse(resp).error };
  }
  return { type: AggResponse.Done };
}

function doFlush() {
  // TODO: have a specific result response type to enforce (protos?)
  const resp = JSON.parse(flush());
  if (resp.error) {
    return { type: AggResponse.Failed, reason: resp.error };
  }
  return { type: AggResponse.Result, result: resp };
}

// @ts-ignore
function handleRequest(req: any): any {
  switch (req.type as AggRequest) {
    case AggRequest.Ready:
      return ready(req);
    case AggRequest.Initialize:
      return postMessage(initialize(req));
    case AggRequest.Add:
      return postMessage(add(req));
    case AggRequest.Flush:
      return postMessage(doFlush());
    default:
      console.error("aggregator - unknown request: ", req);
      throw new Error("aggregator unknown request");
  }
}
onmessage = (ev) => handleRequest(ev.data);

// TODO: I hate this
// Web Workers do not currently support modules (in all browsers), so instead all the relevant code in common
// has to be copy/pasted over
// Clean up when supported: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

enum AggRequest {
  Ready = "ready",
  Initialize = "initialize",
  Add = "add",
  Flush = "flush",
}

enum AggResponse {
  Failed = "failed",
  Ready = "ready",
  Initialized = "initialized",
  Done = "done",
  Result = "result",
}