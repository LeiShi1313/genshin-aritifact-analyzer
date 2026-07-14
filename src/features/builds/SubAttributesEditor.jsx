import { Plus, X } from "phosphor-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { subAttributeOptions } from "../../utils/attribute";
import { AttributeType } from "../../genshin/attribute";

const SubAttributesEditor = ({ subAttributes, setSubAttributes }) => {
  const { t, i18n } = useTranslation();

  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (subAttributes.length === 0) setIsAdding(true);
    else setIsAdding(false);
  }, [subAttributes]);

  const handleAttrAdd = (e) => {
    setSubAttributes((arr) => [
      ...arr,
      { type: Number(e.target.value), value: 1 },
    ]);
    setIsAdding(false);
  };
  const handleAttrRemove = (idx) => {
    setSubAttributes((arr) => arr.filter((_, i) => i !== idx));
  };
  const handleValueChange = (idx) => (event) => {
    const value = Number(event.target.value);
    setSubAttributes((arr) =>
      arr.map((attribute, index) =>
        index === idx ? { ...attribute, value } : attribute
      )
    );
  };
  const formatImportance = (value) =>
    new Intl.NumberFormat(i18n.resolvedLanguage ?? i18n.language, {
      maximumFractionDigits: 1,
    }).format(value);

  return (
    <>
      <div className="label flex flex-row justify-between">
        <span className="label-text">{t("Sub Stats")}</span>
        <span className="label-text-alt flex items-center gap-2">
          {t("Relative importance")}
          <button
            type="button"
            className="btn btn-ghost btn-circle btn-xs"
            aria-label={t("Add substat")}
            onClick={() => setIsAdding(true)}
          >
            <Plus size={20} />
          </button>
        </span>
      </div>
      <p className="px-4 pb-1 text-xs opacity-75">
        {t("Relative importance description")}
      </p>
      <div className="flex flex-col justify-start px-2">
        {subAttributes.map((attr, idx) => {
          const statName = t(`${AttributeType[attr.type].toLowerCase()}`, {
            ns: "artifacts",
          });
          const formattedValue = formatImportance(attr.value);
          const inputId = `sub-attribute-importance-${attr.type}`;

          return (
            <div key={attr.type}>
              <div className="label">
                <label className="label-text-alt" htmlFor={inputId}>
                  {statName}
                </label>
                <span className="label-text-alt flex items-center gap-1">
                  {formattedValue}
                  <button
                    type="button"
                    className="btn btn-ghost btn-circle btn-xs"
                    aria-label={t("Remove substat", { stat: statName })}
                    onClick={() => handleAttrRemove(idx)}
                  >
                    <X size={16} />
                  </button>
                </span>
              </div>
              <input
                id={inputId}
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={attr.value}
                onChange={handleValueChange(idx)}
                className="range range-xs"
                aria-valuetext={t("Relative importance value", {
                  stat: statName,
                  value: formattedValue,
                })}
              />
            </div>
          );
        })}
        {isAdding && (
          <select
            className="select-ghost"
            value={""}
            aria-label={t("Add substat")}
            onChange={handleAttrAdd}
          >
            <option disabled key={""} value={""}>
              {t("Pick one")}
            </option>
            {subAttributeOptions
              .filter(
                (attr) =>
                  !subAttributes.map((attr) => Number(attr.type)).includes(attr)
              )
              .map((attr) => (
                <option key={attr} value={attr}>
                  {t(`${AttributeType[attr].toLowerCase()}`, {
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
export default SubAttributesEditor;
