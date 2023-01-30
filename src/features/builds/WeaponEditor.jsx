import { useState, useEffect } from "react";
import classNames from "classnames";
import { Plus, X } from "phosphor-react";
import { useTranslation } from "react-i18next";
import { Weapon } from "../../genshin/weapon";
import { enumToIdx } from "../../utils/enum";

const WeaponEditor = ({ weapons, setWeapons, filterFn = null }) => {
  const { t, i18n } = useTranslation();
  const weapon = 0;
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

  const handleWeaponAdd = (e) => {
    setWeapons((arr) => [...arr, Number(e.target.value)]);
    setIsAdding(false);
  };
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
        <select
          className="select select-ghost"
          value={weapon}
          onChange={handleWeaponAdd}
        >
          <option disabled key={0} value={0}>
            {t("Pick one")}
          </option>
          {[...enumToIdx(Weapon)]
            .sort((a, b) =>
              t(`${Weapon[a].toLowerCase()}`, { ns: "weapons" }).localeCompare(
                t(`${Weapon[b].toLowerCase()}`, { ns: "weapons" }),
                i18n.language
              )
            )
            .filter((key) => !weapons.includes(key))
            .filter((key) => (filterFn !== null ? filterFn(key) : true))
            .map((key) => (
              <option key={key} value={key}>
                {t(`${Weapon[key].toLowerCase()}`, { ns: "weapons" })}
              </option>
            ))}
        </select>
      )}
    </>
  );
};

export default WeaponEditor;
