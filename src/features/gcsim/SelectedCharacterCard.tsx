import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Character } from "../../genshin/character";
import { Weapon } from "../../genshin/weapon";
import { Artifact } from "../../genshin/artifact";
import { characterMetadata } from "../../utils/character";
import { starRarityToBgColor } from "../../utils/starRarityToBgColor";
import { inferMaxLevel } from "../../utils/gcsim";
import { CharacterOverride } from "./types";
import { getCharacterIconUrl } from "./utils";
import { WeaponSection, SetSection, ArtifactSlots } from "./components";
import characterData from "../../data/characters.json";

interface UploadedWeaponInfo {
  weapon: Weapon;
  level: number;
  maxLevel: number;
  refinement: number;
  location: number;
}

interface SelectedCharacterCardProps {
  characterId: number;
  override: CharacterOverride;
  onChange: (override: CharacterOverride) => void;
  onRemove: () => void;
  uploadedWeapons?: UploadedWeaponInfo[];
  uploadedArtifacts?: Artifact[];
}

const SelectedCharacterCard = ({
  characterId,
  override,
  onChange,
  onRemove,
  uploadedWeapons = [],
  uploadedArtifacts = [],
}: SelectedCharacterCardProps) => {
  const { t } = useTranslation();

  const charKey = Character[characterId]?.toLowerCase() || "";
  const charStar = Number(characterMetadata[Character[characterId]]?.rarity || 4);
  const weaponType = (characterData as Record<string, { weapontype?: string }>)[charKey]?.weapontype || "";

  const imgUrl = useMemo(() => getCharacterIconUrl(charKey), [charKey]);

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
      const currentMaxValid = override.maxLevel && info.options.includes(override.maxLevel);
      updateOverride({
        level: newLevel,
        maxLevel: currentMaxValid ? override.maxLevel : info.maxLevel,
      });
    } else {
      updateOverride({ level: newLevel, maxLevel: info.maxLevel });
    }
  };

  const effectiveMaxLevel = override.maxLevel ?? levelInfo.maxLevel;

  const handleTalentChange = (index: number, value: number) => {
    const talents = override.talents || [1, 1, 1];
    const newTalents: [number, number, number] = [...talents];
    newTalents[index] = value;
    updateOverride({ talents: newTalents });
  };

  return (
    <div className="rounded-lg bg-base-200 p-3 border-base-300 border-1 shadow-xl">
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

          {/* Constellation */}
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-70">C:</span>
            <select
              className="select select-xs w-14"
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

      {/* Level & Max Level */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs opacity-70">{t("Level")}:</span>
        <input
          type="number"
          className="input input-xs w-10"
          min={1}
          max={100}
          placeholder="-"
          value={override.level ?? ""}
          onChange={(e) =>
            handleLevelChange(e.target.value ? Number(e.target.value) : undefined)
          }
          disabled={!override.enabled}
        />
        <span className="text-xs opacity-70">/</span>
        {levelInfo.isAmbiguous ? (
          <select
            className="select select-xs w-16"
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
          <span className="text-xs font-medium w-8 text-center">
            {effectiveMaxLevel ?? "-"}
          </span>
        )}
      </div>

      {/* Talents */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs opacity-70 text-nowrap">{t("Talents")}:</span>
        {[0, 1, 2].map((idx) => (
          <input
            key={idx}
            type="number"
            className="input input-xs w-10"
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
            onClick={() => updateOverride({ talents: undefined })}
            disabled={!override.enabled}
          >
            x
          </button>
        )}
      </div>

      {/* Weapon */}
      <WeaponSection
        weapon={override.weapon}
        weaponType={weaponType}
        enabled={override.enabled}
        uploadedWeapons={uploadedWeapons}
        onChange={(weapon) => updateOverride({ weapon })}
      />

      {/* Sets */}
      <SetSection
        sets={override.sets}
        enabled={override.enabled}
        onChange={(sets) => updateOverride({ sets })}
      />

      {/* Artifacts */}
      <ArtifactSlots
        artifacts={override.artifacts}
        uploadedArtifacts={uploadedArtifacts}
        characterId={characterId}
        enabled={override.enabled}
        onChange={(artifacts) => updateOverride({ artifacts })}
      />
    </div>
  );
};

export default SelectedCharacterCard;
