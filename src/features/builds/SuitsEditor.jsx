import { useState, useEffect } from "react";
import classNames from "classnames";
import { Plus, X, Check, Question } from "phosphor-react";
import { useTranslation } from "react-i18next";
import { Set } from "../../genshin/set";
import { get2pcSets } from "../../utils/build";
import SetSelect from "../sets/SetSelect";

const SuitsEditor = ({ suits, setSuits }) => {
  const { t } = useTranslation();
  const [setCombos, setSetCombos] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (suits.length === 0) setIsAdding(true);
    else setIsAdding(false);
  }, [suits]);

  const handleSetAdd = (value) => {
    const set = Number(value);
    if (!set || !Set[set]) return;
    setSetCombos((arr) => [...arr, { set, count: 4 }]);
  };
  const handleChecked = () => {
    if (setCombos.length === 0) return;
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
      <div className="label flex flex-row justify-between">
        <span className="text-sm">{t("Sets")}</span>
        <button
          type="button"
          className="btn btn-ghost btn-circle btn-xs"
          aria-label={t("Add")}
          onClick={() => setIsAdding(true)}
        >
          <Plus aria-hidden="true" size={20} />
        </button>
      </div>
      {(suits.length > 0 || (isAdding && setCombos.length > 0)) && (
        <div className="min-h-12 flex flex-row flex-wrap items-center justify-start gap-1 px-1 py-1">
          {suits.map((suit, idx) => {
            const comboKey =
              suit.setCombos.map((setCombo) => setCombo.set).join("-") ||
              `suit-${idx}`;
            const suitName = suit.setCombos
              .map((setCombo) => setCombo.set)
              .filter((set) => Set[set])
              .map((set) => t(Set[set].toLowerCase(), { ns: "sets" }))
              .join(" + ");

            return (
              <span
                key={comboKey}
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
                <span className="overflow-hidden text-ellipsis">
                  {suitName}
                </span>
                {suit.setCombos.length > 1 && (
                  <div className="dropdown-hover dropdown dropdown-left">
                    <button type="button" aria-label={t("this set includes")}>
                      <Question aria-hidden="true" />
                    </button>
                    <div
                      className="dropdown-content menu rounded-box flex w-48 flex-col space-y-1 bg-base-100 p-2 shadow"
                    >
                      <span className="text-sm text-primary">
                        {t("this set includes")}
                      </span>
                      {get2pcSets(suit.setCombos)
                        .filter((s) => Set[s])
                        .map((s) => (
                          <span key={s} className="badge badge-accent">
                            {t(Set[s].toLowerCase(), { ns: "sets" })}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center justify-center"
                  aria-label={t("Delete") + " " + suitName}
                  onClick={() => handleSuitRemove(idx)}
                >
                  <X aria-hidden="true" className="cursor-pointer" />
                </button>
              </span>
            );
          })}
          {isAdding && setCombos.length > 0 && (
            <span
              className={classNames("badge", "text-xs", "badge-info", "h-auto")}
            >
              {setCombos
                .filter((combo) => Set[combo.set])
                .map((combo) => t(Set[combo.set].toLowerCase(), { ns: "sets" }))
                .join("+")}
              +...
            </span>
          )}
        </div>
      )}
      {isAdding && (
        <div className="flex w-full flex-row items-center">
          <div className="w-4/5">
            <SetSelect
              set={0}
              setSet={handleSetAdd}
              hideAllOption
              filterFn={(key) => {
                // TODO: find a better way to validate
                const validForCombos =
                  setCombos.length < 2 ||
                  (setCombos.length >= 2 && Set[key].startsWith("PRAYER"));
                const notAlreadySelected = !setCombos
                  .map((combo) => combo.set)
                  .includes(key);
                return validForCombos && notAlreadySelected;
              }}
            />
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-circle btn-xs"
            aria-label={t("Confirm")}
            disabled={setCombos.length === 0}
            onClick={handleChecked}
          >
            <Check aria-hidden="true" weight="bold" />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-circle btn-xs"
            aria-label={t("Cancel")}
            onClick={handleCancel}
          >
            <X aria-hidden="true" weight="bold" />
          </button>
        </div>
      )}
    </>
  );
};

export default SuitsEditor;
