import { useMemo, useState } from "react";
import ReactLoading from "react-loading";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { List } from "react-window";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useWasmExecutor } from "../../hooks/useWasmExecutor";
import MultiCharacterSelect from "../characters/MultiCharacterSelect";
import ScriptCard from "./ScriptCard";
import { SimResults } from "../../gcsim/types/sim";
import { gcsimScriptToScript } from "../../utils/gcsim";

interface ScriptState {
  isRunning: boolean;
  result: SimResults | null;
  error: string | null;
  progress: {
    current: number;
    total: number;
  };
}

const Teams = () => {
  const { t } = useTranslation();
  const { artifactsId } = useParams();
  const { scripts, isScriptLoading } = useSelector((state: any) => state.gcsim);
  const artifacts = useSelector(
    (state: any) => (state.uploads.artifacts[artifactsId] ?? {}).items ?? []
  );
  const [workers, setWorkers] = useLocalStorage<number>("wasm-num-workers", 1);
  const [selectedCharacters, setSelectedCharacters] = useState<number[]>([]);
  const [scriptStates, setScriptStates] = useState<{ [index: number]: ScriptState }>({});

  // Use the custom hook for WASM executor lifecycle management
  const { isReady, isRunning, run, cancel } = useWasmExecutor({
    wasmPath: "/gcsim/main.wasm",
    workerCount: workers,
  });

  // Handle running a script simulation
  const handleRunScript = async (index: number, script: any) => {
    if (!run || !isReady) return;

    // Set running state
    setScriptStates(prev => ({
      ...prev,
      [index]: {
        isRunning: true,
        result: null,
        error: null,
        progress: { current: 0, total: 0 }
      }
    }));

    try {
      const config = gcsimScriptToScript(script);
      console.log(`Running simulation ${index} with config:`, config);

      const runResult = await run(config, (simResult: SimResults, hash: string) => {
        console.log(`Simulation ${index} result received:`, simResult);

        // Update progress and result
        setScriptStates(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            result: simResult,
            progress: {
              current: simResult.statistics?.iterations || 0,
              total: simResult.simulator_settings?.iterations || 0
            }
          }
        }));
      });

      console.log(`Simulation ${index} completed with result:`, runResult);

      // Handle completion
      if (runResult === false) {
        setScriptStates(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            isRunning: false,
            error: "Simulation was skipped - another simulation may be running"
          }
        }));
      } else {
        setScriptStates(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            isRunning: false
          }
        }));
      }
    } catch (err) {
      console.error(`Simulation ${index} error:`, err);
      setScriptStates(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          isRunning: false,
          error: err instanceof Error ? err.message : "Simulation failed"
        }
      }));
    }
  };

  // Build character-to-artifacts mapping from artifacts
  const characterToArtifacts = useMemo(() => {
    const mapping: { [key: number]: any[] } = {};

    artifacts.forEach((artifact: any) => {
      if (artifact.character && artifact.character !== 0) {
        if (!mapping[artifact.character]) {
          mapping[artifact.character] = [];
        }
        mapping[artifact.character].push(artifact);
      }
    });

    return mapping;
  }, [artifacts]);

  // Get list of available characters from artifacts
  const availableCharacters = useMemo(() => {
    return Object.keys(characterToArtifacts).map(Number).sort();
  }, [characterToArtifacts]);

  // Filter scripts based on selected characters
  const filteredScripts = useMemo(() => {
    if (!scripts || selectedCharacters.length === 0) {
      return scripts || [];
    }

    return scripts.filter((script: any) => {
      const scriptCharacters = script.characterInfos.map(
        (info: any) => info.character
      );

      // Check if all selected characters are in the script
      return selectedCharacters.every((char) => scriptCharacters.includes(char));
    });
  }, [scripts, selectedCharacters]);

  // Show loading state if scripts are loading
  if (isScriptLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <ReactLoading
          type="bars"
          className="fill-primary"
        />
        <p className="mt-4 text-lg">Loading scripts...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full max-w-screen-lg flex-col px-4 lg:px-0">
      <div className="my-8 flex w-full flex-col gap-4">
        <h1 className="text-2xl font-bold">Teams</h1>

        {/* Character Filter */}
        <div className="flex w-full flex-col gap-2">
          <label className="text-sm font-medium">
            {t("Filter by Character")}
          </label>
          <MultiCharacterSelect
            selectedCharacters={selectedCharacters}
            setSelectedCharacters={setSelectedCharacters}
            availableCharacters={availableCharacters}
          />
        </div>

        {/* Scripts count and status */}
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            {t("Loaded X gcsim scripts", { num: filteredScripts.length })}
            {selectedCharacters.length > 0 && (
              <span className="ml-2 text-xs opacity-70">
                ({scripts?.length || 0} total)
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-base-300 px-3 py-1 text-xs">
              {t("Status")}: {isRunning ? t("Running") : isReady ? t("Ready") : t("Loading")}
            </span>
            {isRunning && (
              <button
                onClick={cancel}
                className="btn btn-error btn-xs sm:btn-sm"
              >
                {t("Cancel Simulation")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scripts List */}
      <div className="mb-4 flex w-full flex-1 flex-col items-center justify-start">
        {filteredScripts.length === 0 ? (
          <div className="flex h-40 w-full items-center justify-center rounded-lg bg-base-200 text-center">
            <p className="text-lg opacity-70">
              {selectedCharacters.length > 0
                ? t("No scripts found with selected characters")
                : t("No scripts available")}
            </p>
          </div>
        ) : (
          <div className="h-full w-full">
            <List
              style={{ height: "calc(100vh - 400px)", width: "100%" }}
              rowComponent={({ index, style, scripts, selected, onRunHandler, isReadyProp, states }) => (
                <div style={{ ...style, padding: "8px 0" }}>
                  <ScriptCard
                    script={scripts[index]}
                    index={index}
                    selectedCharacters={selected}
                    onRun={() => onRunHandler(index, scripts[index])}
                    isWasmReady={isReadyProp}
                    scriptState={states[index]}
                  />
                </div>
              )}
              rowCount={filteredScripts.length}
              rowHeight={250}
              rowProps={{
                scripts: filteredScripts,
                selected: selectedCharacters,
                onRunHandler: handleRunScript,
                isReadyProp: isReady,
                states: scriptStates,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;
