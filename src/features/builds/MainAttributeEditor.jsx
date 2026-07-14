import { useTranslation } from "react-i18next";
import { Plus, X } from "phosphor-react";
import classNames from "classnames";
import { mainAttributeOptions } from "../../utils/attribute";
import { useEffect, useState } from "react";
import { AttributePosition, AttributeType } from "../../genshin/attribute";

const MainAttributeEditor = ({ position, attrs, setFunc }) => {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (attrs.length === 0 && setFunc) setIsAdding(true);
    else setIsAdding(false);
  }, [attrs]);

  const handleAttrAdd = (e) => {
    setFunc((arr) => [...arr, Number(e.target.value)]);
    setIsAdding(false);
  };
  const handleAttrRemove = (idx) => {
    setFunc((arr) => arr.filter((_, i) => i !== idx));
  };
  const positionName = t(AttributePosition[position].toLowerCase(), {
    ns: "artifacts",
  });

  return (
    <>
      <h1 className="flex flex-wrap items-center justify-center gap-1">
        {positionName}
        {setFunc && (
          <button
            type="button"
            className="btn btn-ghost btn-circle btn-xs min-h-8 min-w-8 focus-visible:outline-primary focus-visible:outline focus-visible:outline-2"
            aria-label={t("Add main stat")}
            onClick={() => setIsAdding(true)}
          >
            <Plus aria-hidden="true" size={12} />
          </button>
        )}
      </h1>
      <div className="flex w-full min-w-0 flex-col items-center gap-1 px-1">
        {attrs.map((attr, idx) => {
          const statName = t(`${AttributeType[attr].toLowerCase()}`, {
            ns: "artifacts",
          });

          return (
            <span
              className={classNames(
                "badge badge-primary min-h-6 h-auto max-w-full whitespace-normal py-1 text-center text-xs"
              )}
              key={attr}
            >
              {statName}
              {setFunc && (
                <button
                  type="button"
                  className="min-h-6 min-w-6 focus-visible:outline-primary-content ml-1 inline-flex shrink-0 items-center justify-center rounded focus-visible:outline focus-visible:outline-2"
                  aria-label={t("Remove main stat", { stat: statName })}
                  onClick={() => handleAttrRemove(idx)}
                >
                  <X aria-hidden="true" size={14} />
                </button>
              )}
            </span>
          );
        })}
        {isAdding && (
          <select
            className="select-ghost select-md w-full max-w-full text-xs"
            value={""}
            aria-label={t("Add main stat")}
            onChange={handleAttrAdd}
          >
            <option disabled key={""} value={""}>
              {t("Pick one")}
            </option>
            {mainAttributeOptions[position]
              .filter((option) => !attrs.includes(option))
              .map((option) => (
                <option key={option} value={option}>
                  {t(`${AttributeType[option].toLowerCase()}`, {
                    ns: "artifacts",
                  })}
                </option>
              ))}
          </select>
        )}
      </div>
    </>
  );
};

export default MainAttributeEditor;
