import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGCSim } from "../../store/reducers/gcsim";
import { Character, characterToJSON } from "../../genshin/character";
import { GCSimScript, GCSimScriptOptions } from "../../genshin/gcsim";
import { gcsimScriptToScript } from "../../utils/gcsim";
import { WasmExecutor, ExecutorSupplier } from "../../gcsim/executors";
import { useLocalStorage } from "../../hooks/useLocalStorage";

let exec: WasmExecutor | undefined;

const Teams = () => {
  const dispatch = useDispatch();
  const { scripts } = useSelector((state) => (state as any).gcsim);
  const [workers, setWorkers] = useLocalStorage<number>("wasm-num-workers", 1);
  const [isReady, setReady] = useState<boolean>(false);
  const exec = useCallback<ExecutorSupplier<WasmExecutor>>(() => {
    const _exec = new WasmExecutor("/gcsim/main.wasm");
    _exec.setWorkerCount(workers);
    return _exec;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setReady(exec().ready());
    }, 250);
    return () => clearInterval(interval);
  }, [exec]);
  useEffect(() => {
    console.log("ready", isReady);
  }, [isReady]);

  useEffect(() => {
    dispatch(fetchGCSim());
  }, []);

  useEffect(() => {
    // for (let script of scripts) {
    //   // console.log(gcsimScriptToScript(script));
    // }
    if (isReady && scripts && scripts.length > 0) {
      const script = GCSimScript.toJSON(scripts[0]) as GCSimScript;
      if (!script.options) {
        script.options = GCSimScriptOptions.fromJSON({ iteration: 10 });
      } else {
        script.options.iteration = 10;
      }
      exec()
        .run(gcsimScriptToScript(GCSimScript.fromJSON(script)), (result, hash) => {
          console.log(result, hash);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [scripts, isReady]);

  return (
    <div>
      <h1>Teams</h1>
      <div className="flex flex-col items-center justify-center">
        {scripts &&
          scripts.map((script) => (
            <div className="flex flex-row items-center justify-center space-x-2">
              {script.characterInfos.map((characterInfo) => (
                <span>{characterToJSON(characterInfo.character)}</span>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Teams;
