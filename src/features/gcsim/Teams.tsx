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
import { gcsimScriptToScript } from "../../utils/gcsim";
import { GCSimScript, GCSimScriptCharacterStat, GCSimScriptSetInfo } from "../../genshin/gcsim";
import { AttributePosition, attributePositionToJSON } from "../../genshin/attribute";

interface ScriptState {
  isRunning: boolean;
  result: SimResults | null;
  error: string | null;
  progress: {
    current: number;
    total: number;
  };
}

/**
 * Convert artifact position to label string for GCSimScriptCharacterStat
 */
const getPositionLabel = (position: AttributePosition): string => {
  const positionName = attributePositionToJSON(position);
  return positionName.toLowerCase();
};

/**
 * Convert artifacts to GCSimScriptCharacterStat array
 * Each artifact contributes: 1 main stat + N sub stats (all with same label)
 */
const artifactsToStats = (artifacts: any[]): GCSimScriptCharacterStat[] => {
  const stats: GCSimScriptCharacterStat[] = [];

  artifacts.forEach(artifact => {
    const label = getPositionLabel(artifact.position);

    // Add main attribute
    if (artifact.mainAttribute) {
      stats.push({
        type: artifact.mainAttribute.type,
        value: artifact.mainAttribute.value,
        label: label
      });
    }

    // Add sub attributes
    if (artifact.subAttributes) {
      artifact.subAttributes.forEach((subAttr: any) => {
        stats.push({
          type: subAttr.type,
          value: subAttr.value,
          label: label
        });
      });
    }
  });

  return stats;
};

/**
 * Aggregate artifact sets and return GCSimScriptSetInfo array
 * Only includes sets with 2+ pieces
 */
const aggregateArtifactSets = (artifacts: any[]): GCSimScriptSetInfo[] => {
  const setCounts: { [key: number]: number } = {};

  // Count artifacts per set
  artifacts.forEach(artifact => {
    if (artifact.set) {
      setCounts[artifact.set] = (setCounts[artifact.set] || 0) + 1;
    }
  });

  // Create set infos for sets with 2+ pieces
  const setInfos: GCSimScriptSetInfo[] = [];
  Object.entries(setCounts).forEach(([setId, count]) => {
    if (count >= 2) {
      setInfos.push({
        set: parseInt(setId),
        count: count >= 4 ? 4 : 2, // Cap at 4 pieces for set bonuses
        params: []
      });
    }
  });

  return setInfos;
};

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
  const [scriptOverrides, setScriptOverrides] = useState<ScriptOverrides>({});
  const [characterOverrides, setCharacterOverrides] = useState<CharacterOverrides>({});

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

  // When a character is selected, initialize their override state
  const handleSelectedCharactersChange = useCallback((newSelected: number[]) => {
    setSelectedCharacters(newSelected);
    // Initialize overrides for newly added characters
    setCharacterOverrides(prev => {
      const updated = { ...prev };
      newSelected.forEach(charId => {
        if (!updated[charId]) {
          updated[charId] = { enabled: true };
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
  }, []);

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
      // Merge script with overrides
      const scriptWithOverrides = GCSimScript.fromJSON(GCSimScript.toJSON(script));

      // Apply option overrides if present
      if (scriptOverrides.options && Object.keys(scriptOverrides.options).length > 0) {
        if (!scriptWithOverrides.options) {
          scriptWithOverrides.options = {};
        }
        Object.assign(scriptWithOverrides.options, scriptOverrides.options);
      }

      // Apply energy settings overrides if present
      if (scriptOverrides.energySettings && Object.keys(scriptOverrides.energySettings).length > 0) {
        if (!scriptWithOverrides.energySettings) {
          scriptWithOverrides.energySettings = {};
        }
        Object.assign(scriptWithOverrides.energySettings, scriptOverrides.energySettings);
      }

      // Apply target overrides if present
      if (scriptOverrides.target && Object.keys(scriptOverrides.target).length > 0) {
        if (!scriptWithOverrides.targets || scriptWithOverrides.targets.length === 0) {
          scriptWithOverrides.targets = [{}];
        }
        // Apply overrides to the first target
        Object.assign(scriptWithOverrides.targets[0], scriptOverrides.target);
      }

      // Apply character overrides and artifact stats/sets for each character
      if (scriptWithOverrides.characterInfos) {
        scriptWithOverrides.characterInfos.forEach(charInfo => {
          const charId = charInfo.character;
          const override = characterOverrides[charId];

          // Apply character overrides if enabled
          if (override?.enabled) {
            // Apply level override
            if (override.level !== undefined) {
              charInfo.level = override.level;
            }

            // Apply maxLevel override
            if (override.maxLevel !== undefined) {
              charInfo.maxLevel = override.maxLevel;
            }

            // Apply constellation override
            if (override.constellation !== undefined) {
              charInfo.constellation = override.constellation;
            }

            // Apply talents override
            if (override.talents) {
              charInfo.talents = [...override.talents];
            }

            // Apply weapon override
            if (override.weapon?.weapon) {
              charInfo.weaponInfo = {
                weapon: override.weapon.weapon,
                level: override.weapon.level ?? charInfo.weaponInfo?.level ?? 90,
                maxLevel: override.weapon.maxLevel ?? charInfo.weaponInfo?.maxLevel ?? 90,
                refinement: override.weapon.refinement ?? charInfo.weaponInfo?.refinement ?? 1,
                params: [],
              };
            }

            // Apply set overrides
            if (override.sets && override.sets.length > 0) {
              charInfo.setInfos = override.sets.map(setOverride => ({
                set: setOverride.set,
                count: setOverride.count,
                params: [],
              }));
            }

            console.log(`Applied overrides to character ${charId}:`, {
              level: charInfo.level,
              maxLevel: charInfo.maxLevel,
              constellation: charInfo.constellation,
              talents: charInfo.talents,
              weapon: charInfo.weaponInfo,
              sets: charInfo.setInfos,
            });
          }

          // Apply artifact stats and sets (only if no set override from character overrides)
          const characterArtifacts = characterToArtifacts[charId];
          if (characterArtifacts && characterArtifacts.length > 0) {
            // Replace character stats with artifact stats
            charInfo.stats = artifactsToStats(characterArtifacts);

            // Only replace set infos if not already overridden
            if (!override?.enabled || !override.sets || override.sets.length === 0) {
              charInfo.setInfos = aggregateArtifactSets(characterArtifacts);
            }

            console.log(`Applied ${characterArtifacts.length} artifacts to character ${charId}:`, {
              stats: charInfo.stats.length,
              sets: charInfo.setInfos
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
              rowComponent={({ index, style, scriptsWithIndices, selected, onRunHandler, isReadyProp, states, overrides }) => {
                const { script, originalIndex } = scriptsWithIndices[index];
                return (
                  <div style={{ ...style, padding: "8px 0" }}>
                    <ScriptCard
                      script={script}
                      index={originalIndex}
                      selectedCharacters={selected}
                      onRun={() => onRunHandler(originalIndex, script)}
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
                isReadyProp: isReady,
                states: scriptStates,
                overrides: characterOverrides,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;
