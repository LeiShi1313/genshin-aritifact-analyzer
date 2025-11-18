import { useTranslation } from "react-i18next";
import ReactLoading from "react-loading";
import CharacterInfo from "./CharacterInfo";
import { SimResults } from "../../gcsim/types/sim";

interface ScriptState {
  isRunning: boolean;
  result: SimResults | null;
  error: string | null;
  progress: {
    current: number;
    total: number;
  };
}

interface ScriptCardProps {
  script: any;
  index: number;
  selectedCharacters: number[];
  onRun?: () => void;
  isWasmReady?: boolean;
  scriptState?: ScriptState;
}

const ScriptCard = ({
  script,
  index,
  selectedCharacters,
  onRun,
  isWasmReady = false,
  scriptState
}: ScriptCardProps) => {
  const { t } = useTranslation();

  // Extract state from props or use defaults
  const isRunning = scriptState?.isRunning || false;
  const result = scriptState?.result || null;
  const error = scriptState?.error || null;
  const progress = scriptState?.progress || { current: 0, total: 0 };

  const handleRun = () => {
    if (!onRun || !isWasmReady) return;
    onRun();
  };

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg bg-base-200 p-2 shadow-lg sm:p-4">
      {/* Script header */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium opacity-70 sm:text-sm">
          {t("Script")} #{index + 1}
        </div>
        {onRun && (
          <button
            onClick={handleRun}
            disabled={!isWasmReady || isRunning}
            className="btn btn-primary btn-xs sm:btn-sm"
          >
            {isRunning ? t("Running") : t("Run")}
          </button>
        )}
      </div>

      {/* Character cards */}
      <div className="flex w-full flex-row flex-wrap gap-1 sm:gap-2">
        {script.characterInfos.map((characterInfo: any, charIdx: number) => (
          <CharacterInfo
            key={charIdx}
            characterInfo={characterInfo}
            saturate={
              !selectedCharacters.includes(characterInfo.character) &&
              selectedCharacters.length > 0
            }
          />
        ))}
      </div>

      {/* Loading animation */}
      {isRunning && (
        <div className="flex items-center justify-center gap-2 p-4">
          <ReactLoading type="spin" height={24} width={24} className="fill-primary" />
          <span className="text-xs sm:text-sm">{t("Running")} {t("Script").toLowerCase()}...</span>
        </div>
      )}

      {/* Progress bar */}
      {isRunning && progress.total > 0 && (
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center justify-between text-xs opacity-70">
            <span>Progress</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-base-300">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="alert alert-error p-2 text-xs sm:text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {result && result.statistics && (
        <div className="flex flex-col gap-2 rounded-lg bg-base-300 p-2 sm:p-3">
          <div className="text-xs font-bold sm:text-sm">{t("Results")}:</div>

          {/* DPS Summary */}
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div className="flex flex-col">
              <span className="opacity-70">Mean DPS</span>
              <span className="font-bold">{result.statistics.dps?.mean?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex flex-col">
              <span className="opacity-70">Min DPS</span>
              <span className="font-bold">{result.statistics.dps?.min?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex flex-col">
              <span className="opacity-70">Max DPS</span>
              <span className="font-bold">{result.statistics.dps?.max?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex flex-col">
              <span className="opacity-70">Duration (s)</span>
              <span className="font-bold">{result.statistics.duration?.mean?.toFixed(1)}</span>
            </div>
          </div>

          {/* Character DPS */}
          {result.statistics.character_dps && result.statistics.character_dps.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold opacity-70">Character DPS:</span>
              <div className="flex flex-col gap-1">
                {result.character_details?.map((char, idx) => {
                  const charDps = result.statistics?.character_dps?.[idx];
                  if (!charDps) return null;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span>{char.name}</span>
                      <span className="font-mono">{charDps.mean?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScriptCard;
