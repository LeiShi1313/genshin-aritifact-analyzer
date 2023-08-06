import { Plus, X } from "phosphor-react";
import { useEffect } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  subAttributeOptions,
} from "../../utils/attribute";
import {
  AttributeType,
  Attribute,
} from "../../genshin/attribute";

const SubAttributesEditor = ({ subAttributes, setSubAttributes }) => {
  const { t } = useTranslation();

  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (subAttributes.length === 0) setIsAdding(true);
    else setIsAdding(false);
  }, [subAttributes]);

  const handleAttrAdd = (e) => {
    setSubAttributes((arr) => [...arr, { type: Number(e.target.value), value: 1 }]);
    setIsAdding(false);
  };
  const handleAttrRemove = (idx) => {
    setSubAttributes((arr) => arr.filter((_, i) => i !== idx));
  };
  const handleValueChange = (idx) => (e) => {
    subAttributes[idx].value = Number(e.target.value);
    setSubAttributes((arr) => [
      ...arr.slice(0, idx),
      arr[idx],
      ...arr.slice(idx + 1),
    ]);
  };

  return (
    <>
      <label className="flex flex-row justify-between label">
        <span className="label-text">{t("Sub Stats")}</span>
        <label className="cursor-pointer">
          <Plus size={20} onClick={() => setIsAdding(true)} />
        </label>
      </label>
      <div className="flex flex-col justify-start px-2">
        {subAttributes.map((attr, idx) => (
          <div key={attr.type}>
            <label className="label">
              <span className="flex flex-row items-center label-text-alt">
                {t(`${AttributeType[attr.type].toLowerCase()}`, { ns: "artifacts" })}
                <X
                  className="cursor-pointer"
                  onClick={() => handleAttrRemove(idx)}
                />
              </span>
              <span className="label-text-alt">{attr.value.toString() === '1' ? '1' : attr.value.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={attr.value}
              onChange={handleValueChange(idx)}
              className="range range-xs"
            />
          </div>
        ))}
        {isAdding && (
          <select
            className="select select-ghost"
            value={""}
            onChange={handleAttrAdd}
          >
            <option disabled key={""} value={""}>
              {t("Pick one")}
            </option>
            {subAttributeOptions
              .filter(
                (attr) => !subAttributes.map((attr) => Number(attr.type)).includes(attr)
              )
              .map((attr) => (
                <option key={attr} value={attr}>
                {t(`${AttributeType[attr].toLowerCase()}`, { ns: "artifacts" })}
                </option>
              ))}
          </select>
        )}
      </div>
    </>
  );
};
export default SubAttributesEditor;
