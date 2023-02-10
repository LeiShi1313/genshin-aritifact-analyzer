import { useState, useEffect } from "react";
import classNames from "classnames";
import { Plus, X, Check, Question } from "phosphor-react";
import { useTranslation } from "react-i18next";
import { Set } from "../../genshin/set";
import { get2pcSets } from "../../utils/build";
import { enumToIdx } from "../../utils/enum";

const SuitsEditor = ({ suits, setSuits }) => {
  const { t, i18n } = useTranslation();
  const [setCombos, setSetCombos] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (suits.length === 0) setIsAdding(true);
    else setIsAdding(false);
  }, [suits]);

  // const handleSetAdd = (e) => {
  //   setSuits((arr) => [...arr, Number(e.target.value)]);
  //   setIsAdding(false);
  // };
  const handleSetAdd = (e) => {
    setSetCombos((arr) => [...arr, { set: Number(e.target.value), count: 4 }]);
  };
  const handleChecked = () => {
    setIsAdding(false);
    setSuits((arr) => [...arr, { setCombos: setCombos }]);
    setSetCombos([]);
  };
  const handleCancel = () => {
    setIsAdding(false);
    setSetCombos([]);
  };
  const handleSuitRemove = (idx) => {
    setSuits((arr) => arr.filter((_, i) => i !== idx));
  };
  return (
    <>
      <label className="label flex flex-row justify-between">
        <span className="label-text">{t("Sets")}</span>
        <label className="cursor-pointer">
          <Plus
            className="swap-on"
            size={20}
            onClick={() => setIsAdding(true)}
          />
        </label>
      </label>
      {(suits.length > 0 || (isAdding && setCombos.length > 0)) && (
        <div className="min-h-12 flex flex-row flex-wrap items-center justify-start px-1 py-1">
          {suits.map((suit, idx) => (
            <span
              key={idx}
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
              {suit.setCombos
                .map((setCombo) =>
                  t(`${Set[setCombo.set].toLowerCase()}`, { ns: "sets" })
                )
                .join(" + ")}
              {suit.setCombos.length > 1 && (
                <div className="dropdown-hover dropdown">
                  <label tabIndex={0}>
                    <Question />
                  </label>
                  <div
                    tabIndex={0}
                    className="dropdown-content menu rounded-box flex w-48 flex-col space-y-1 bg-base-100 p-2 shadow"
                  >
                    <span className="text-sm text-primary">{t('this set includes')}</span>
                    {get2pcSets(suit.setCombos).map((s) => (
                      <span className="badge badge-accent">
                        {t(`${Set[s].toLowerCase()}`, { ns: "sets" })}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <X
                className="cursor-pointer"
                onClick={() => handleSuitRemove(idx)}
              />
            </span>
          ))}
          {isAdding && setCombos.length > 0 && (
            <span
              key={-1}
              className={classNames("badge", "text-xs", "badge-info", "h-auto")}
            >
              {setCombos
                .map((suit) =>
                  t(`${Set[suit.set].toLowerCase()}`, { ns: "sets" })
                )
                .join("+")}
              +...
            </span>
          )}
        </div>
      )}
      {isAdding && (
        <div className="flex w-full flex-row items-center">
          <select
            className="select select-ghost w-4/5"
            value={0}
            onChange={handleSetAdd}
          >
            <option disabled key={0} value={0}>
              {t("Pick one")}
            </option>
            {[...enumToIdx(Set)]
              .sort((a, b) =>
                t(`${Set[a].toLowerCase()}`, { ns: "sets" }).localeCompare(
                  t(`${Set[b].toLowerCase()}`, { ns: "sets" }),
                  i18n.language
                )
              )
              // TODO: find a better way to validate
              .filter(
                (key) =>
                  setCombos.length < 2 ||
                  (setCombos.length >= 2 && Set[key].startsWith("PRAYER"))
              )
              .filter(
                (key) => !setCombos.map((combo) => combo.set).includes(key)
              )
              .map((key) => (
                <option key={key} value={key}>
                  {t(`${Set[key].toLowerCase()}`, { ns: "sets" })}
                </option>
              ))}
          </select>
          <Check
            className="cursor-pointer"
            onClick={() => handleChecked()}
            weight="bold"
          />
          <X
            className="cursor-pointer"
            onClick={() => handleCancel()}
            weight="bold"
          />
        </div>
      )}
    </>
  );
};

export default SuitsEditor;
