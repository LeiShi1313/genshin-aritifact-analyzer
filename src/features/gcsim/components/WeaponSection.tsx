import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { Weapon } from "../../../genshin/weapon";
import { WeaponOverride } from "../types";
import { getWeaponIconUrl } from "../utils";
import { enumToIdx } from "../../../utils/enum";
import { inferWeaponMaxLevel } from "../../../utils/gcsim";
import SelectionModal from "./SelectionModal";
import weaponData from "../../../data/weapons.json";
import { isGCSimWeaponSupported } from "../../../utils/gcsimCapabilities";

interface UploadedWeaponInfo {
  weapon: Weapon;
  level: number;
  maxLevel: number;
  refinement: number;
  location: number;
}

interface WeaponSectionProps {
  weapon?: WeaponOverride;
  weaponType: string;
  enabled: boolean;
  uploadedWeapons: UploadedWeaponInfo[];
  onChange: (weapon: WeaponOverride | undefined) => void;
}

const WeaponSection = memo(({
  weapon,
  weaponType,
  enabled,
  uploadedWeapons,
  onChange,
}: WeaponSectionProps) => {
  const { t, i18n } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  // Get available weapons for this character's weapon type
  const availableWeapons = useMemo(() => {
    return [...enumToIdx(Weapon)]
      .filter((id) => {
        if (!isGCSimWeaponSupported(id)) return false;
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

  // Compute inferred maxLevel info based on current weapon level
  const weaponLevelInfo = useMemo(() => {
    if (weapon?.level === undefined) {
      return { maxLevel: undefined, isAmbiguous: false, options: [] as number[] };
    }
    return inferWeaponMaxLevel(weapon.level);
  }, [weapon?.level]);

  const handleSelectWeapon = (id: number) => {
    const uploadedWeapon = uploadedWeapons.find(w => w.weapon === id);
    onChange({
      weapon: id,
      level: uploadedWeapon?.level ?? 90,
      maxLevel: uploadedWeapon?.maxLevel ?? 90,
      refinement: uploadedWeapon?.refinement ?? 1,
    });
    setShowModal(false);
  };

  const updateWeapon = (updates: Partial<WeaponOverride>) => {
    if (!weapon) return;
    onChange({ ...weapon, ...updates });
  };

  // Handle weapon level change - auto-set maxLevel if not ambiguous
  const handleWeaponLevelChange = (newLevel: number | undefined) => {
    if (newLevel === undefined) {
      updateWeapon({ level: undefined, maxLevel: undefined });
      return;
    }

    const info = inferWeaponMaxLevel(newLevel);
    if (info.isAmbiguous) {
      const currentMaxValid = weapon?.maxLevel && info.options.includes(weapon.maxLevel);
      updateWeapon({
        level: newLevel,
        maxLevel: currentMaxValid ? weapon.maxLevel : info.maxLevel,
      });
    } else {
      updateWeapon({ level: newLevel, maxLevel: info.maxLevel });
    }
  };

  const effectiveWeaponMaxLevel = weapon?.maxLevel ?? weaponLevelInfo.maxLevel;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <span className="text-xs opacity-70">{t("Weapon")}:</span>
        <button
          className={classNames(
            "btn btn-sm flex-1 justify-start gap-2 text-left normal-case",
            weapon?.weapon ? "btn-ghost" : "btn-outline"
          )}
          onClick={() => setShowModal(true)}
          disabled={!enabled}
        >
          {weapon?.weapon ? (
            <>
              <img
                className="h-6 w-6"
                src={getWeaponIconUrl(weapon.weapon)}
                alt=""
              />
              <span className="truncate text-xs">
                {t(Weapon[weapon.weapon].toLowerCase(), { ns: "weapons" })}
              </span>
            </>
          ) : (
            <span className="text-xs opacity-70">{t("Select Weapon")}</span>
          )}
        </button>
        {weapon?.weapon && (
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => onChange(undefined)}
            disabled={!enabled}
            aria-label={t("Clear Weapon")}
          >
            x
          </button>
        )}
      </div>

      {/* Weapon Level, Max Level & Refinement */}
      {weapon?.weapon && (
        <div className="mt-2 flex items-center gap-2 pl-9">
          <input
            type="number"
            className="input input-xs w-10"
            min={1}
            max={90}
            placeholder="-"
            value={weapon.level ?? ""}
            onChange={(e) =>
              handleWeaponLevelChange(e.target.value ? Number(e.target.value) : undefined)
            }
            disabled={!enabled}
          />
          <span className="text-xs opacity-70">/</span>
          {weaponLevelInfo.isAmbiguous ? (
            <select
              className="select select-xs w-14"
              value={weapon.maxLevel ?? weaponLevelInfo.maxLevel ?? ""}
              onChange={(e) =>
                updateWeapon({
                  maxLevel: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              disabled={!enabled}
            >
              {weaponLevelInfo.options.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs font-medium w-8 text-center">
              {effectiveWeaponMaxLevel ?? "-"}
            </span>
          )}
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-70">R:</span>
            <select
              className="select select-xs w-12"
              aria-label={t("Refinement")}
              value={weapon.refinement ?? ""}
              onChange={(e) =>
                updateWeapon({
                  refinement: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              disabled={!enabled}
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

      {/* Weapon Selection Modal */}
      {showModal && (
        <SelectionModal
          title={t("Select Weapon")}
          description={t("Only items supported by this GCSim version are shown")}
          onClose={() => setShowModal(false)}
        >
          {availableWeapons.length === 0 && (
            <li className="p-3 text-center text-sm opacity-70">
              {t("No supported items available")}
            </li>
          )}
          {availableWeapons.map((id) => (
            <li key={id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg p-1 text-left"
                onClick={() => handleSelectWeapon(id)}
              >
                <img className="h-8 w-8" src={getWeaponIconUrl(id)} alt="" />
                <span className="text-sm">
                  {t(Weapon[id].toLowerCase(), { ns: "weapons" })}
                </span>
              </button>
            </li>
          ))}
        </SelectionModal>
      )}
    </div>
  );
});

WeaponSection.displayName = 'WeaponSection';

export default WeaponSection;
