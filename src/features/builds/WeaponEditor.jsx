import { useState, useEffect } from "react";
import classNames from "classnames";
import { Plus, X } from "phosphor-react";
import { useTranslation } from "react-i18next";
import { Weapon } from "../../genshin/weapon";
import WeaponSelect from "../weapons/WeaponSelect";

const WeaponEditor = ({ weapons, setWeapons, filterFn = null }) => {
  const { t } = useTranslation();
  const [selectedWeapon, setSelectedWeapon] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (weapons.length === 0) setIsAdding(true);
    else setIsAdding(false);
  }, [weapons]);
  useEffect(() => {
    if (filterFn) {
      setWeapons((arr) => {
        const filtered = arr.filter(filterFn);
        return filtered.length === arr.length ? arr : filtered;
      });
    }
  }, [filterFn, setWeapons]);

  useEffect(() => {
    if (selectedWeapon !== 0) {
      setWeapons((arr) => [...arr, selectedWeapon]);
      setSelectedWeapon(0);
      setIsAdding(false);
    }
  }, [selectedWeapon, setWeapons]);

  const handleWeaponRemove = (weapon) => {
    setWeapons((arr) => arr.filter((value) => value !== weapon));
  };
  return (
    <>
      <div className="label flex flex-row justify-between">
        <span className="text-sm">{t("Weapons")}</span>
        <button
          type="button"
          className="btn btn-ghost btn-circle btn-xs"
          aria-label={t("Add")}
          onClick={() => setIsAdding(true)}
        >
          <Plus aria-hidden="true" size={20} />
        </button>
      </div>
      {weapons.length > 0 && (
        <div className="min-h-12 flex flex-row flex-wrap items-center justify-start gap-1 px-1 py-1">
          {weapons
            .filter((weapon) => Weapon[weapon])
            .map((weapon, idx) => {
              const weaponName = t(Weapon[weapon].toLowerCase(), {
                ns: "weapons",
              });

              return (
                <span
                  key={weapon}
                  className={classNames(
                    "badge",
                    "text-xs",
                    "h-auto",
                    "min-h-6",
                    "max-w-full",
                    "py-1",
                    idx === 0
                      ? "badge-primary"
                      : idx === 1
                      ? "badge-secondary"
                      : idx === 2
                      ? "badge-accent"
                      : "badge-error"
                  )}
                >
                  {weaponName}
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center justify-center"
                    aria-label={t("Delete") + " " + weaponName}
                    onClick={() => handleWeaponRemove(weapon)}
                  >
                    <X aria-hidden="true" className="cursor-pointer" />
                  </button>
                </span>
              );
            })}
        </div>
      )}
      {isAdding && (
        <WeaponSelect
          weapon={selectedWeapon}
          setWeapon={setSelectedWeapon}
          awaken={true}
          filterFn={
            filterFn
              ? (key) => !weapons.includes(key) && filterFn(key)
              : (key) => !weapons.includes(key)
          }
        />
      )}
    </>
  );
};

export default WeaponEditor;
