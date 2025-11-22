import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { Character } from "../../genshin/character";
import { Weapon } from "../../genshin/weapon";
import { Set } from "../../genshin/set";
import { AttributePosition } from "../../genshin/attribute";
import { characterMetadata } from "../../utils/character";
import { starRarityToBgColor } from "../../utils/starRarityToBgColor";
import { enumToIdx } from "../../utils/enum";
import { inferMaxLevel } from "../../utils/gcsim";
import { CharacterOverride, SetOverride } from "./types";
import characterData from "../../data/characters.json";
import weaponData from "../../data/weapons.json";

interface SelectedCharacterCardProps {
  characterId: number;
  override: CharacterOverride;
  onChange: (override: CharacterOverride) => void;
  onRemove: () => void;
}

const SelectedCharacterCard = ({
  characterId,
  override,
  onChange,
  onRemove,
}: SelectedCharacterCardProps) => {
  const { t, i18n } = useTranslation();
  const [showWeaponModal, setShowWeaponModal] = useState(false);
  const [showSetModal, setShowSetModal] = useState<number | null>(null); // null = not showing, 0 = first set, 1 = second set

  const charKey = Character[characterId]?.toLowerCase() || "";
  const charStar = Number(characterMetadata[Character[characterId]]?.rarity || 4);
  const weaponType = (characterData as Record<string, { weapontype?: string }>)[charKey]?.weapontype || "";

  const imgUrl = useMemo(
    () =>
      new URL(
        `../../assets/characters/${charKey}_icon.png`,
        import.meta.url
      ).href,
    [charKey]
  );

  const getWeaponIconUrl = (id: number) => {
    const weaponKey = Weapon[id]?.toLowerCase();
    if (!weaponKey) return "";
    return new URL(
      `../../assets/weapons/${weaponKey}_awaken.png`,
      import.meta.url
    ).href;
  };

  const getSetIconUrl = (id: number) => {
    const setKey = Set[id]?.toLowerCase();
    if (!setKey) return "";
    const posId = AttributePosition[setKey.startsWith("prayers_") ? 5 : 1].toLowerCase();
    return new URL(
      `../../assets/artifacts/${setKey}_${posId}.png`,
      import.meta.url
    ).href;
  };

  // Get available weapons for this character's weapon type
  const availableWeapons = useMemo(() => {
    return [...enumToIdx(Weapon)]
      .filter((id) => {
        const weaponKey = Weapon[id]?.toLowerCase();
        const meta = (weaponData as Record<string, { weapontype?: string }>)[weaponKey];
        return meta && meta.weapontype === weaponType;
      })
      .sort((a, b) =>
        t(Weapon[a].toLowerCase(), { ns: "weapons" }).localeCompare(
          t(Weapon[b].toLowerCase(), { ns: "weapons" }),
          i18n.language
        )
      );
  }, [weaponType, t, i18n.language]);

  // Get all available sets
  const availableSets = useMemo(() => {
    return [...enumToIdx(Set)].sort((a, b) =>
      t(Set[a].toLowerCase(), { ns: "sets" }).localeCompare(
        t(Set[b].toLowerCase(), { ns: "sets" }),
        i18n.language
      )
    );
  }, [t, i18n.language]);

  const updateOverride = (updates: Partial<CharacterOverride>) => {
    onChange({ ...override, ...updates });
  };

  // Compute inferred maxLevel info based on current level
  const levelInfo = useMemo(() => {
    if (override.level === undefined) {
      return { maxLevel: undefined, isAmbiguous: false, options: [] as number[] };
    }
    return inferMaxLevel(override.level);
  }, [override.level]);

  // Handle level change - auto-set maxLevel if not ambiguous
  const handleLevelChange = (newLevel: number | undefined) => {
    if (newLevel === undefined) {
      updateOverride({ level: undefined, maxLevel: undefined });
      return;
    }

    const info = inferMaxLevel(newLevel);
    if (info.isAmbiguous) {
      // Keep existing maxLevel if it's valid for this level, otherwise use lower bound
      const currentMaxValid = override.maxLevel && info.options.includes(override.maxLevel);
      updateOverride({
        level: newLevel,
        maxLevel: currentMaxValid ? override.maxLevel : info.maxLevel,
      });
    } else {
      // Auto-set maxLevel
      updateOverride({ level: newLevel, maxLevel: info.maxLevel });
    }
  };

  // Get effective maxLevel (either explicitly set or inferred)
  const effectiveMaxLevel = override.maxLevel ?? levelInfo.maxLevel;

  const handleSetChange = (setIndex: number, setId: number | null) => {
    const currentSets = override.sets || [];
    const newSets: SetOverride[] = [...currentSets];

    if (setId === null) {
      // Remove this set
      newSets.splice(setIndex, 1);
    } else if (setIndex < newSets.length) {
      // Update existing set
      newSets[setIndex] = { ...newSets[setIndex], set: setId };
    } else {
      // Add new set - determine count based on existing sets
      const otherSetCount = newSets.reduce((sum, s) => sum + s.count, 0);
      const newCount = otherSetCount === 0 ? 4 : 2;
      newSets.push({ set: setId, count: newCount as 2 | 4 });
    }

    updateOverride({ sets: newSets.length > 0 ? newSets : undefined });
    setShowSetModal(null);
  };

  const handleSetCountChange = (setIndex: number, count: 2 | 4) => {
    const currentSets = override.sets || [];
    if (setIndex >= currentSets.length) return;

    const newSets = [...currentSets];
    newSets[setIndex] = { ...newSets[setIndex], count };

    // If we have 2 sets, ensure total is valid (each should be 2)
    if (newSets.length === 2) {
      newSets[0] = { ...newSets[0], count: 2 };
      newSets[1] = { ...newSets[1], count: 2 };
    }

    updateOverride({ sets: newSets });
  };

  const handleTalentChange = (index: number, value: number) => {
    const talents = override.talents || [1, 1, 1];
    const newTalents: [number, number, number] = [...talents];
    newTalents[index] = value;
    updateOverride({ talents: newTalents });
  };

  const clearTalents = () => {
    updateOverride({ talents: undefined });
  };

  return (
    <div className="rounded-lg bg-base-200 p-3 shadow-md">
      {/* Header with character info and enable toggle */}
      <div className="flex items-start gap-3">
        {/* Character Image */}
        <div
          className="relative shrink-0 overflow-hidden rounded-lg"
          style={{ backgroundColor: starRarityToBgColor(charStar) }}
        >
          <img src={imgUrl} className="h-20 w-20" />
          <button
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-xs font-bold text-error-content hover:bg-error/80"
            onClick={onRemove}
          >
            x
          </button>
        </div>

        {/* Character name and enable toggle */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">
              {t(charKey, { ns: "characters" })}
            </span>
            <label className="label cursor-pointer gap-2">
              <span className="label-text text-xs">{t("Override")}</span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={override.enabled}
                onChange={(e) => updateOverride({ enabled: e.target.checked })}
              />
            </label>
          </div>

          {/* Level & Max Level */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-70">{t("Level")}:</span>
              <input
                type="number"
                className="input input-bordered input-xs w-14"
                min={1}
                max={100}
                placeholder="-"
                value={override.level ?? ""}
                onChange={(e) =>
                  handleLevelChange(e.target.value ? Number(e.target.value) : undefined)
                }
                disabled={!override.enabled}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-70">/</span>
              {levelInfo.isAmbiguous ? (
                // Show dropdown at ascension boundaries
                <select
                  className="select select-bordered select-xs w-16"
                  value={override.maxLevel ?? levelInfo.maxLevel ?? ""}
                  onChange={(e) =>
                    updateOverride({
                      maxLevel: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  disabled={!override.enabled}
                >
                  {levelInfo.options.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              ) : (
                // Show static text when maxLevel is unambiguous
                <span className="text-xs font-medium w-8 text-center">
                  {effectiveMaxLevel ?? "-"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-70">C:</span>
              <select
                className="select select-bordered select-xs w-14"
                value={override.constellation ?? ""}
                onChange={(e) =>
                  updateOverride({
                    constellation: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                disabled={!override.enabled}
              >
                <option value="">-</option>
                {[0, 1, 2, 3, 4, 5, 6].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Talents */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs opacity-70">{t("Talents")}:</span>
        {[0, 1, 2].map((idx) => (
          <input
            key={idx}
            type="number"
            className="input input-bordered input-xs w-12"
            min={1}
            max={10}
            placeholder="-"
            value={override.talents?.[idx] ?? ""}
            onChange={(e) =>
              handleTalentChange(
                idx,
                e.target.value ? Number(e.target.value) : 1
              )
            }
            disabled={!override.enabled}
          />
        ))}
        {override.talents && (
          <button
            className="btn btn-ghost btn-xs"
            onClick={clearTalents}
            disabled={!override.enabled}
          >
            {t("Clear")}
          </button>
        )}
      </div>

      {/* Weapon */}
      <div className="mt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70">{t("Weapon")}:</span>
          <button
            className={classNames(
              "btn btn-sm flex-1 justify-start gap-2 text-left normal-case",
              override.weapon?.weapon ? "btn-ghost" : "btn-outline"
            )}
            onClick={() => setShowWeaponModal(true)}
            disabled={!override.enabled}
          >
            {override.weapon?.weapon ? (
              <>
                <img
                  className="h-6 w-6"
                  src={getWeaponIconUrl(override.weapon.weapon)}
                />
                <span className="truncate text-xs">
                  {t(Weapon[override.weapon.weapon].toLowerCase(), { ns: "weapons" })}
                </span>
              </>
            ) : (
              <span className="text-xs opacity-70">{t("Select Weapon")}</span>
            )}
          </button>
          {override.weapon?.weapon && (
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => updateOverride({ weapon: undefined })}
              disabled={!override.enabled}
            >
              x
            </button>
          )}
        </div>

        {/* Weapon details */}
        {override.weapon?.weapon && (
          <div className="mt-1 flex flex-wrap items-center gap-2 pl-14">
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-70">Lv:</span>
              <input
                type="number"
                className="input input-bordered input-xs w-14"
                min={1}
                max={90}
                placeholder="-"
                value={override.weapon.level ?? ""}
                onChange={(e) =>
                  updateOverride({
                    weapon: {
                      ...override.weapon!,
                      level: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
                disabled={!override.enabled}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-70">{t("Max")}:</span>
              <select
                className="select select-bordered select-xs w-16"
                value={override.weapon.maxLevel ?? ""}
                onChange={(e) =>
                  updateOverride({
                    weapon: {
                      ...override.weapon!,
                      maxLevel: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
                disabled={!override.enabled}
              >
                <option value="">-</option>
                {MAX_LEVEL_OPTIONS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-70">R:</span>
              <select
                className="select select-bordered select-xs w-14"
                value={override.weapon.refinement ?? ""}
                onChange={(e) =>
                  updateOverride({
                    weapon: {
                      ...override.weapon!,
                      refinement: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
                disabled={!override.enabled}
              >
                <option value="">-</option>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Sets */}
      <div className="mt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70">{t("Sets")}:</span>
        </div>
        <div className="mt-1 flex flex-col gap-1">
          {/* Render existing sets */}
          {override.sets?.map((setOverride, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <button
                className="btn btn-ghost btn-sm flex-1 justify-start gap-2 text-left normal-case"
                onClick={() => setShowSetModal(idx)}
                disabled={!override.enabled}
              >
                <img
                  className="h-6 w-6"
                  src={getSetIconUrl(setOverride.set)}
                />
                <span className="truncate text-xs">
                  {t(Set[setOverride.set].toLowerCase(), { ns: "sets" })}
                </span>
              </button>
              <select
                className="select select-bordered select-xs w-14"
                value={setOverride.count}
                onChange={(e) => handleSetCountChange(idx, Number(e.target.value) as 2 | 4)}
                disabled={!override.enabled || (override.sets?.length || 0) > 1}
              >
                <option value={2}>2pc</option>
                <option value={4}>4pc</option>
              </select>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => handleSetChange(idx, null)}
                disabled={!override.enabled}
              >
                x
              </button>
            </div>
          ))}

          {/* Add set button - show when: no sets, or 1 set with 2pc */}
          {(!override.sets || override.sets.length === 0 ||
            (override.sets.length === 1 && override.sets[0].count === 2)) && (
            <button
              className="btn btn-outline btn-sm justify-start gap-2 text-left normal-case"
              onClick={() => setShowSetModal(override.sets?.length || 0)}
              disabled={!override.enabled}
            >
              <span className="text-lg">+</span>
              <span className="text-xs opacity-70">{t("Add Set")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Weapon Selection Modal */}
      {showWeaponModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-neutral/50"
            onClick={() => setShowWeaponModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-8">
            <div className="card max-h-[calc(100vh-4rem)] w-80 overflow-hidden bg-neutral text-neutral-content shadow-xl">
              <div className="flex h-12 items-center justify-between border-b border-neutral-content/10 px-4">
                <span>{t("Select Weapon")}</span>
                <button
                  className="btn btn-circle btn-ghost btn-sm"
                  onClick={() => setShowWeaponModal(false)}
                >
                  x
                </button>
              </div>
              <ul className="menu max-h-96 flex-nowrap overflow-auto p-2">
                {availableWeapons.map((id) => (
                  <li key={id}>
                    <a
                      className="flex items-center gap-2 rounded-lg p-1"
                      onClick={() => {
                        updateOverride({
                          weapon: { weapon: id },
                        });
                        setShowWeaponModal(false);
                      }}
                    >
                      <img className="h-8 w-8" src={getWeaponIconUrl(id)} />
                      <span className="text-sm">
                        {t(Weapon[id].toLowerCase(), { ns: "weapons" })}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Set Selection Modal */}
      {showSetModal !== null && (
        <>
          <div
            className="fixed inset-0 z-50 bg-neutral/50"
            onClick={() => setShowSetModal(null)}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-8">
            <div className="card max-h-[calc(100vh-4rem)] w-80 overflow-hidden bg-neutral text-neutral-content shadow-xl">
              <div className="flex h-12 items-center justify-between border-b border-neutral-content/10 px-4">
                <span>{t("Select Set")}</span>
                <button
                  className="btn btn-circle btn-ghost btn-sm"
                  onClick={() => setShowSetModal(null)}
                >
                  x
                </button>
              </div>
              <ul className="menu max-h-96 flex-nowrap overflow-auto p-2">
                {availableSets.map((id) => (
                  <li key={id}>
                    <a
                      className="flex items-center gap-2 rounded-lg p-1"
                      onClick={() => handleSetChange(showSetModal, id)}
                    >
                      <img className="h-8 w-8" src={getSetIconUrl(id)} />
                      <span className="text-sm">
                        {t(Set[id].toLowerCase(), { ns: "sets" })}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SelectedCharacterCard;
