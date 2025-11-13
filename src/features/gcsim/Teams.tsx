import { useEffect } from "react";
import { useSelector } from "react-redux";
import { characterToJSON } from "../../genshin/character";
import { GCSimScript, GCSimScriptOptions } from "../../genshin/gcsim";
import { gcsimScriptToScript } from "../../utils/gcsim";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useWasmExecutor } from "../../hooks/useWasmExecutor";

const Teams = () => {
  const { scripts } = useSelector((state) => (state as any).gcsim);
  const [workers, setWorkers] = useLocalStorage<number>("wasm-num-workers", 1);

  // Use the custom hook for WASM executor lifecycle management
  const { isReady, isRunning, run, cancel } = useWasmExecutor({
    wasmPath: "/gcsim/main.wasm",
    workerCount: workers,
  });

  useEffect(() => {
    console.log("ready", isReady, "running", isRunning);
  }, [isReady, isRunning]);

  // Run simulation when ready and scripts are available
  useEffect(() => {
    if (!isReady || !scripts || scripts.length === 0) return;
    if (isRunning) {
      console.log("Simulation already running, skipping");
      return;
    }

    const script = GCSimScript.toJSON(scripts[0]) as GCSimScript;
    if (!script.options) {
      script.options = GCSimScriptOptions.fromJSON({ iteration: 10 });
    } else {
      script.options.iteration = 10;
    }

    console.log("Starting simulation with", workers, "workers");
    run(gcsimScriptToScript(GCSimScript.fromJSON(script)), (result, hash) => {
      console.log("Simulation result:", result, hash);
    })
      .then(() => {
        console.log("Simulation completed");
      })
      .catch((err) => {
        console.error("Simulation error:", err);
      });
  }, [scripts, isReady, isRunning, workers, run]);

  return (
    <div>
      <h1>Teams</h1>
      <div className="mb-4">
        <button
          onClick={cancel}
          disabled={!isRunning}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isRunning ? "Cancel Simulation" : "Not Running"}
        </button>
        <span className="ml-4">
          Status: {isReady ? (isRunning ? "Running" : "Ready") : "Loading..."}
        </span>
        <span className="ml-4">Workers: {workers}</span>
      </div>
      <div className="flex flex-col items-center justify-center">
        {scripts &&
          scripts.map((script, scriptIdx) => (
            <div key={scriptIdx} className="flex flex-row items-center justify-center space-x-2">
              {script.characterInfos.map((characterInfo, charIdx) => (
                <span key={charIdx}>{characterToJSON(characterInfo.character)}</span>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Teams;
