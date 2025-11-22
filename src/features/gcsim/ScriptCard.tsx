import { useState } from "react";
import { useTranslation } from "react-i18next";
import ReactLoading from "react-loading";
import { Copy, Check } from "phosphor-react";
import CharacterInfo from "./CharacterInfo";
import { SimResults } from "../../gcsim/types/sim";
import { CharacterOverrides } from "./types";
import { generateOverriddenScript } from "../../utils/gcsim";

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
  characterOverrides?: CharacterOverrides;
}

const ScriptCard = ({
  script,
  index,
  selectedCharacters,
  onRun,
  isWasmReady = false,
  scriptState,
  characterOverrides = {}
}: ScriptCardProps) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Helper function to get translated character name
  const getCharacterName = (characterKey: string) => {
    return t(characterKey, { ns: 'characters', defaultValue: characterKey });
  };

  // Extract state from props or use defaults
  const isRunning = scriptState?.isRunning || false;
  const result = scriptState?.result || null;
  const error = scriptState?.error || null;
  const progress = scriptState?.progress || { current: 0, total: 0 };

  const handleRun = () => {
    if (!onRun || !isWasmReady) return;
    onRun();
  };

  const handleCopy = async () => {
    try {
      const scriptText = generateOverriddenScript(script, characterOverrides);

      // Try modern clipboard API first
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(scriptText);
      } else {
        // Fallback for non-HTTPS contexts
        const textArea = document.createElement('textarea');
        textArea.value = scriptText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy script:", err);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg bg-base-200 p-2 shadow-lg sm:p-4">
      {/* Script header */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium opacity-70 sm:text-sm">
          {t("Script")} #{index + 1}
        </div>
        <div className="flex items-center gap-2">
          <div className="tooltip tooltip-bottom" data-tip={copied ? t("Copied!") : t("Copy Script")}>
            <button
              onClick={handleCopy}
              className="btn btn-ghost btn-xs sm:btn-sm"
            >
              {copied ? (
                <Check size={16} weight="bold" className="text-success" />
              ) : (
                <Copy size={16} weight="bold" />
              )}
            </button>
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
      </div>

      {/* Main content row - characters and progress/results */}
      <div className="flex w-full flex-col gap-2 md:flex-row md:gap-4">
        {/* Character cards */}
        <div className="flex flex-row flex-wrap gap-1 sm:gap-2">
          {script.characterInfos.map((characterInfo: any, charIdx: number) => (
            <CharacterInfo
              key={charIdx}
              characterInfo={characterInfo}
              saturate={
                !selectedCharacters.includes(characterInfo.character) &&
                selectedCharacters.length > 0
              }
              override={characterOverrides[characterInfo.character]}
            />
          ))}
        </div>

        {/* Progress/Results section - fixed 5-row layout */}
        <div className="flex flex-1 flex-col gap-1 rounded-lg bg-base-300 p-2 text-xs">
          {/* Row 1: Progress bar OR Results label */}
          <div className="flex h-5 items-center">
            {isRunning ? (
              progress.total > 0 ? (
                <div className="flex w-full items-center gap-2">
                  <span className="opacity-70">{t("Progress")}</span>
                  <progress
                    className="progress progress-primary flex-1"
                    value={progress.current}
                    max={progress.total}
                  />
                  <span className="opacity-70">{progress.current}/{progress.total}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ReactLoading type="spin" height={14} width={14} className="fill-primary" />
                  <span>{t("Running")}...</span>
                </div>
              )
            ) : result?.statistics ? (
              <span className="font-semibold opacity-70">{t("Results")}</span>
            ) : (
              <div className="skeleton h-4 w-20" />
            )}
          </div>

          {/* Row 2: Mean DPS | Character 1 */}
          <div className="flex h-5 gap-x-8">
            <div className="flex flex-1 items-center justify-between">
              <span className="opacity-70">{t("Mean DPS")}:</span>
              {result?.statistics ? (
                <span className="font-bold">{result.statistics.dps?.mean?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              ) : (
                <div className="skeleton h-3 w-16" />
              )}
            </div>
            <div className="flex flex-1 items-center justify-between">
              {result?.character_details?.[0] ? (
                <>
                  <span className="opacity-70">{getCharacterName(result.character_details[0].name)}:</span>
                  <span className="font-mono">{result.statistics?.character_dps?.[0]?.mean?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </>
              ) : (
                <>
                  <div className="skeleton h-3 w-12" />
                  <div className="skeleton h-3 w-16" />
                </>
              )}
            </div>
          </div>

          {/* Row 3: Max | Character 2 */}
          <div className="flex h-5 gap-x-8">
            <div className="flex flex-1 items-center justify-between">
              <span className="opacity-70">{t("Max")}:</span>
              {result?.statistics ? (
                <span className="font-mono">{result.statistics.dps?.max?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              ) : (
                <div className="skeleton h-3 w-16" />
              )}
            </div>
            <div className="flex flex-1 items-center justify-between">
              {result?.character_details?.[1] ? (
                <>
                  <span className="opacity-70">{getCharacterName(result.character_details[1].name)}:</span>
                  <span className="font-mono">{result.statistics?.character_dps?.[1]?.mean?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </>
              ) : (
                <>
                  <div className="skeleton h-3 w-12" />
                  <div className="skeleton h-3 w-16" />
                </>
              )}
            </div>
          </div>

          {/* Row 4: Min | Character 3 */}
          <div className="flex h-5 gap-x-8">
            <div className="flex flex-1 items-center justify-between">
              <span className="opacity-70">{t("Min")}:</span>
              {result?.statistics ? (
                <span className="font-mono">{result.statistics.dps?.min?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              ) : (
                <div className="skeleton h-3 w-16" />
              )}
            </div>
            <div className="flex flex-1 items-center justify-between">
              {result?.character_details?.[2] ? (
                <>
                  <span className="opacity-70">{getCharacterName(result.character_details[2].name)}:</span>
                  <span className="font-mono">{result.statistics?.character_dps?.[2]?.mean?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </>
              ) : (
                <>
                  <div className="skeleton h-3 w-12" />
                  <div className="skeleton h-3 w-16" />
                </>
              )}
            </div>
          </div>

          {/* Row 5: Total Damage | Character 4 */}
          <div className="flex h-5 gap-x-8">
            <div className="flex flex-1 items-center justify-between">
              <span className="opacity-70">{t("Total Damage")}:</span>
              {result?.statistics ? (
                <span className="font-mono">{result.statistics.total_damage?.mean?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              ) : (
                <div className="skeleton h-3 w-16" />
              )}
            </div>
            <div className="flex flex-1 items-center justify-between">
              {result?.character_details?.[3] ? (
                <>
                  <span className="opacity-70">{getCharacterName(result.character_details[3].name)}:</span>
                  <span className="font-mono">{result.statistics?.character_dps?.[3]?.mean?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </>
              ) : (
                <>
                  <div className="skeleton h-3 w-12" />
                  <div className="skeleton h-3 w-16" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-error p-2 text-xs sm:text-sm">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ScriptCard;
