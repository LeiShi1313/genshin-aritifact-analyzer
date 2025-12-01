import { useMemo, useState, useCallback } from "react";
import ReactLoading from "react-loading";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { List } from "react-window";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useWasmExecutor } from "../../hooks/useWasmExecutor";
import MultiCharacterSelect from "../characters/MultiCharacterSelect";
import ScriptCard from "./ScriptCard";
import ScriptOptionsConfig, { ScriptOverrides } from "./ScriptOptionsConfig";
import SelectedCharacterCard from "./SelectedCharacterCard";
import { CharacterOverride, CharacterOverrides } from "./types";
import { SimResults } from "../../gcsim/types/sim";
import { gcsimScriptToScript, generateOverriddenScript, applyAllOverrides } from "../../utils/gcsim";
import { AttributePosition } from "../../genshin/attribute";

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
  const uploadedData = useSelector(
    (state: any) => state.uploads.artifacts[artifactsId] ?? {}
  );
  const artifacts = uploadedData.items ?? [];
  const uploadedCharacters = uploadedData.characters ?? [];
  const uploadedWeapons = uploadedData.weapons ?? [];
  const isGOODFormat = uploadedData.format === 'GOOD';
  const [workers, setWorkers] = useLocalStorage<number>("wasm-num-workers", 1);
  const [selectedCharacters, setSelectedCharacters] = useState<number[]>([]);
  const [scriptStates, setScriptStates] = useState<{ [index: number]: ScriptState }>({});
  const [scriptOverrides, setScriptOverrides] = useState<ScriptOverrides>({});
  const [characterOverrides, setCharacterOverrides] = useState<CharacterOverrides>({});
  const [viewScriptModal, setViewScriptModal] = useState<{ isOpen: boolean; scriptText: string; scriptIndex: number }>({
    isOpen: false,
    scriptText: '',
    scriptIndex: -1
  });

  // Build character-to-artifacts mapping from artifacts (must be before handleSelectedCharactersChange)
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

  // Handle character override changes
  const handleCharacterOverrideChange = useCallback((characterId: number, override: CharacterOverride) => {
    setCharacterOverrides(prev => ({
      ...prev,
      [characterId]: override
    }));
  }, []);

  // Handle removing a character from selection
  const handleRemoveCharacter = useCallback((characterId: number) => {
    setSelectedCharacters(prev => prev.filter(id => id !== characterId));
    setCharacterOverrides(prev => {
      const newOverrides = { ...prev };
      delete newOverrides[characterId];
      return newOverrides;
    });
  }, []);

  // Helper to infer sets from artifacts
  const inferSetsFromArtifacts = (charArtifacts: any[]): { set: number; count: 2 | 4 }[] | undefined => {
    if (!charArtifacts || charArtifacts.length === 0) return undefined;

    // Count artifacts by set
    const setCounts: { [key: number]: number } = {};
    charArtifacts.forEach((art: any) => {
      if (art.set) {
        setCounts[art.set] = (setCounts[art.set] || 0) + 1;
      }
    });

    // Convert to SetOverride format (only sets with 2+ pieces)
    const sets: { set: number; count: 2 | 4 }[] = [];
    Object.entries(setCounts).forEach(([setId, count]) => {
      if (count >= 2) {
        sets.push({
          set: parseInt(setId),
          count: count >= 4 ? 4 : 2,
        });
      }
    });

    return sets.length > 0 ? sets : undefined;
  };

  // When a character is selected, initialize their override state with GOOD data if available
  const handleSelectedCharactersChange = useCallback((newSelected: number[]) => {
    setSelectedCharacters(newSelected);
    // Initialize overrides for newly added characters
    setCharacterOverrides(prev => {
      const updated = { ...prev };
      newSelected.forEach(charId => {
        if (!updated[charId]) {
          // Start with default override
          const override: CharacterOverride = { enabled: true };

          // If GOOD format, try to populate from uploaded character/weapon data
          if (isGOODFormat) {
            // Find character info from uploaded data
            const charInfo = uploadedCharacters.find(
              (c: any) => c.character === charId
            );
            if (charInfo) {
              override.level = charInfo.level;
              override.maxLevel = charInfo.maxLevel;
              override.constellation = charInfo.constellation;
              if (charInfo.talents && charInfo.talents.length === 3) {
                override.talents = [charInfo.talents[0], charInfo.talents[1], charInfo.talents[2]];
              }
            }

            // Find weapon equipped by this character
            const weaponInfo = uploadedWeapons.find(
              (w: any) => w.location === charId
            );
            if (weaponInfo && weaponInfo.weapon) {
              override.weapon = {
                weapon: weaponInfo.weapon,
                level: weaponInfo.level,
                maxLevel: weaponInfo.maxLevel,
                refinement: weaponInfo.refinement,
              };
            }
          }

          // Infer sets from character's equipped artifacts
          const charArtifacts = characterToArtifacts[charId];
          if (charArtifacts) {
            override.sets = inferSetsFromArtifacts(charArtifacts);

            // Initialize artifact overrides with equipped artifacts for all 5 positions
            const positions = [
              AttributePosition.FLOWER,
              AttributePosition.PLUME,
              AttributePosition.SANDS,
              AttributePosition.GOBLET,
              AttributePosition.CIRCLET,
            ];
            override.artifacts = positions.map(position => {
              const equippedArtifact = charArtifacts.find(
                (a: any) => a.position === position
              );
              return {
                position,
                artifact: equippedArtifact || undefined,
              };
            });
          }

          updated[charId] = override;
        }
      });
      // Remove overrides for deselected characters
      Object.keys(updated).forEach(key => {
        const id = Number(key);
        if (!newSelected.includes(id)) {
          delete updated[id];
        }
      });
      return updated;
    });
  }, [isGOODFormat, uploadedCharacters, uploadedWeapons, characterToArtifacts]);

  // Use the custom hook for WASM executor lifecycle management
  const { isReady, isRunning, run, cancel } = useWasmExecutor({
    wasmPath: "/gcsim/main.wasm",
    workerCount: workers,
  });

  // Handle cancel - clear all running states
  const handleCancel = useCallback(() => {
    cancel();
    setScriptStates(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (updated[Number(key)]?.isRunning) {
          updated[Number(key)] = {
            ...updated[Number(key)],
            isRunning: false,
            error: "Simulation cancelled",
          };
        }
      });
      return updated;
    });
  }, [cancel]);

  // Handle copying a script with all overrides applied
  const handleCopyScript = useCallback(async (script: any) => {
    try {
      const scriptText = generateOverriddenScript(
        script,
        scriptOverrides,
        characterOverrides,
        characterToArtifacts
      );

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

      return true; // Success
    } catch (err) {
      console.error("Failed to copy script:", err);
      return false; // Failure
    }
  }, [scriptOverrides, characterOverrides, characterToArtifacts]);

  // Handle viewing a script in modal
  const handleViewScript = useCallback((index: number, script: any) => {
    const scriptText = generateOverriddenScript(
      script,
      scriptOverrides,
      characterOverrides,
      characterToArtifacts
    );
    setViewScriptModal({
      isOpen: true,
      scriptText,
      scriptIndex: index
    });
  }, [scriptOverrides, characterOverrides, characterToArtifacts]);

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
      // Apply all overrides using the centralized logic
      const scriptWithOverrides = applyAllOverrides(
        script,
        scriptOverrides,
        characterOverrides,
        characterToArtifacts
      );

      // Debug logging for applied overrides
      if (scriptWithOverrides.characterInfos) {
        scriptWithOverrides.characterInfos.forEach(charInfo => {
          const charId = charInfo.character;
          const override = characterOverrides[charId];

          if (override?.enabled) {
            console.log(`Applied overrides to character ${charId}:`, {
              level: charInfo.level,
              maxLevel: charInfo.maxLevel,
              constellation: charInfo.constellation,
              talents: charInfo.talents,
              weapon: charInfo.weaponInfo,
              sets: charInfo.setInfos,
            });
          }

          // Log artifact application
          const hasArtifactOverrides = override?.enabled && override.artifacts;
          const artifactCount = hasArtifactOverrides
            ? override.artifacts?.filter(ao => ao.artifact).length || 0
            : (characterToArtifacts[charId] || []).length;

          if (artifactCount > 0) {
            console.log(`Applied ${artifactCount} artifacts to character ${charId}:`, {
              stats: charInfo.stats.length,
              sets: charInfo.setInfos,
              fromOverride: !!hasArtifactOverrides
            });
          }
        });
      }

      const config = gcsimScriptToScript(scriptWithOverrides);
      console.log(`Running simulation ${index} with config:`, config);

      const runResult = await run(config, (simResult: SimResults, hash: string) => {
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
          error: `Simulation error: ${err}`
        }
      }));
    }
  };

  // Allow all characters to be selected (MultiCharacterSelect will use enumToIdx(Character))
  const availableCharacters = useMemo(() => {
    return null;
  }, []);

  // Track which characters have uploaded data (GOOD format or artifacts)
  const charactersWithData = useMemo(() => {
    const charIds = new Set<number>();

    // Add characters from GOOD format
    if (isGOODFormat) {
      uploadedCharacters.forEach((char: any) => {
        if (char.character) {
          charIds.add(char.character);
        }
      });
    }

    // Add characters with artifacts
    Object.keys(characterToArtifacts).forEach(charId => {
      charIds.add(Number(charId));
    });

    return charIds;
  }, [isGOODFormat, uploadedCharacters, characterToArtifacts]);

  // Filter scripts based on selected characters, preserving original indices
  const filteredScripts = useMemo(() => {
    if (!scripts) return [];

    // Map scripts with their original indices
    const scriptsWithIndices = scripts.map((script: any, originalIndex: number) => ({
      script,
      originalIndex
    }));

    if (selectedCharacters.length === 0) {
      return scriptsWithIndices;
    }

    return scriptsWithIndices.filter(({ script }: { script: any }) => {
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

        {/* Script Options Configuration */}
        <ScriptOptionsConfig
          overrides={scriptOverrides}
          onChange={setScriptOverrides}
          onClear={() => setScriptOverrides({})}
        />

        {/* Character Filter */}
        <div className="flex w-full flex-col gap-2">
          <label className="text-sm font-medium">
            {t("Filter by Character")}
          </label>
          <MultiCharacterSelect
            selectedCharacters={selectedCharacters}
            setSelectedCharacters={handleSelectedCharactersChange}
            availableCharacters={availableCharacters}
            charactersWithData={charactersWithData}
          />
        </div>

        {/* Selected Character Override Cards */}
        {selectedCharacters.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            <label className="text-sm font-medium">
              {t("Character Overrides")}
            </label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {selectedCharacters.map((charId) => (
                <SelectedCharacterCard
                  key={charId}
                  characterId={charId}
                  override={characterOverrides[charId] || { enabled: true }}
                  onChange={(override) => handleCharacterOverrideChange(charId, override)}
                  onRemove={() => handleRemoveCharacter(charId)}
                  uploadedWeapons={uploadedWeapons}
                  uploadedArtifacts={artifacts}
                />
              ))}
            </div>
          </div>
        )}

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
                onClick={handleCancel}
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
              rowComponent={({ index, style, scriptsWithIndices, selected, onRunHandler, onCopyHandler, onViewHandler, isReadyProp, states, overrides }) => {
                const { script, originalIndex } = scriptsWithIndices[index];
                return (
                  <div style={{ ...style, padding: "8px 0" }}>
                    <ScriptCard
                      script={script}
                      index={originalIndex}
                      selectedCharacters={selected}
                      onRun={() => onRunHandler(originalIndex, script)}
                      onCopy={() => onCopyHandler(script)}
                      onView={() => onViewHandler(originalIndex, script)}
                      isWasmReady={isReadyProp}
                      scriptState={states[originalIndex]}
                      characterOverrides={overrides}
                    />
                  </div>
                );
              }}
              rowCount={filteredScripts.length}
              rowHeight={250}
              rowProps={{
                scriptsWithIndices: filteredScripts,
                selected: selectedCharacters,
                onRunHandler: handleRunScript,
                onCopyHandler: handleCopyScript,
                onViewHandler: handleViewScript,
                isReadyProp: isReady,
                states: scriptStates,
                overrides: characterOverrides,
              }}
            />
          </div>
        )}
      </div>

      {/* Script View Modal */}
      {viewScriptModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewScriptModal({ isOpen: false, scriptText: '', scriptIndex: -1 })}>
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-base-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-base-300 p-4">
              <h3 className="text-lg font-bold">
                {t("Script")} #{viewScriptModal.scriptIndex + 1}
              </h3>
              <button
                onClick={() => setViewScriptModal({ isOpen: false, scriptText: '', scriptIndex: -1 })}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[calc(90vh-8rem)] overflow-auto p-4">
              <pre className="text-sm whitespace-pre-wrap font-mono bg-base-300 p-4 rounded-lg">
                {viewScriptModal.scriptText || t('No script text available')}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-base-300 p-4">
              <button
                onClick={() => setViewScriptModal({ isOpen: false, scriptText: '', scriptIndex: -1 })}
                className="btn btn-sm"
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
