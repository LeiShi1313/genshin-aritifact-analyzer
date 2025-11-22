import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { Weapon } from "../../../genshin/weapon";
import { WeaponOverride, MAX_LEVEL_OPTIONS } from "../types";
import { getWeaponIconUrl } from "../utils";
import { enumToIdx } from "../../../utils/enum";
import SelectionModal from "./SelectionModal";
import weaponData from "../../../data/weapons.json";

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
          >
            x
          </button>
        )}
      </div>

      {/* Weapon details */}
      {weapon?.weapon && (
        <div className="mt-1 flex flex-wrap items-center gap-2 pl-14">
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-70">Lv:</span>
            <input
              type="number"
              className="input input-bordered input-xs w-14"
              min={1}
              max={90}
              placeholder="-"
              value={weapon.level ?? ""}
              onChange={(e) =>
                updateWeapon({
                  level: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              disabled={!enabled}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-70">{t("Max")}:</span>
            <select
              className="select select-bordered select-xs w-16"
              value={weapon.maxLevel ?? ""}
              onChange={(e) =>
                updateWeapon({
                  maxLevel: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              disabled={!enabled}
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
          onClose={() => setShowModal(false)}
        >
          {availableWeapons.map((id) => (
            <li key={id}>
              <a
                className="flex items-center gap-2 rounded-lg p-1"
                onClick={() => handleSelectWeapon(id)}
              >
                <img className="h-8 w-8" src={getWeaponIconUrl(id)} />
                <span className="text-sm">
                  {t(Weapon[id].toLowerCase(), { ns: "weapons" })}
                </span>
              </a>
            </li>
          ))}
        </SelectionModal>
      )}
    </div>
  );
});

WeaponSection.displayName = 'WeaponSection';

export default WeaponSection;
