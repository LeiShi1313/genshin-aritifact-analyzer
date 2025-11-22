import { useState, useEffect } from "react";
import classNames from "classnames";
import { Plus, X } from "phosphor-react";
import { useTranslation } from "react-i18next";
import { Weapon } from "../../genshin/weapon";
import WeaponSelect from "../weapons/WeaponSelect";

const WeaponEditor = ({ weapons, setWeapons, filterFn = null }) => {
  const { t, i18n } = useTranslation();
  const [selectedWeapon, setSelectedWeapon] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (weapons.length === 0) setIsAdding(true);
    else setIsAdding(false);
  }, [weapons]);
  useEffect(() => {
    if (filterFn) {
      setWeapons((arr) => arr.filter(filterFn));
    }
  }, [filterFn]);

  useEffect(() => {
    if (selectedWeapon !== 0) {
      setWeapons((arr) => [...arr, selectedWeapon]);
      setSelectedWeapon(0);
      setIsAdding(false);
    }
  }, [selectedWeapon]);

  const handleWeaponRemove = (idx) => {
    setWeapons((arr) => arr.filter((_, i) => i !== idx));
  };
  return (
    <>
      <label className="label flex flex-row justify-between">
        <span className="label-text">{t("Weapons")}</span>
        <label className="cursor-pointer">
          <Plus
            className="swap-on"
            size={20}
            onClick={() => setIsAdding(true)}
          />
        </label>
      </label>
      {weapons.length > 0 && (
        <div className="flex h-12 flex-row flex-wrap items-center justify-start px-1 py-1">
          {weapons.map((weapon, idx) => (
            <span
              key={weapon}
              className={classNames(
                "badge",
                "text-xs",
                idx === 0
                  ? "badge-primary"
                  : idx === 1
                  ? "badge-secondary"
                  : idx === 2
                  ? "badge-accent"
                  : "badge-error"
              )}
            >
              {t(`${Weapon[weapon].toLowerCase()}`, { ns: "weapons" })}
              <X
                className="cursor-pointer"
                onClick={() => handleWeaponRemove(idx)}
              />
            </span>
          ))}
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
