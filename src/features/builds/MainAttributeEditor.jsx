import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Plus, X } from "phosphor-react";
import classNames from "classnames";
import { mainAttributeOptions } from "../../utils/attribute";
import { useMemo, useState } from "react";
import { useEffect } from "react";
import {
  getRarity,
  getBestScore,
} from "../../utils/fitsAndRarity";
import {
  getAttributeWeights,
} from "../../utils/weights"
import { AttributePosition, AttributeType } from "../../genshin/attribute";

const MainAttributeEditor = ({ position, attrs, setFunc, subAttributes }) => {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const configs = useSelector(state => state.configs)
  const rarity = useMemo(
    () => getRarity(position, attrs, subAttributes),
    [attrs, subAttributes]
  );
  const bestScore = useMemo(
    () =>
      getBestScore(
        getAttributeWeights(position, attrs, configs),
        getAttributeWeights(AttributePosition.SUB, subAttributes, configs)
      ),
    [attrs, subAttributes]
  );

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
  return (
    <>
      <h1 className="flex flex-row items-center">
        {t(`${AttributePosition[position].toLowerCase()}`, { ns: "artifacts" })}
        {setFunc && (
          <Plus
            className="cursor-pointer"
            size={12}
            onClick={() => setIsAdding(true)}
          />
        )}
      </h1>
      {((setFunc && attrs.length > 0) || subAttributes.length > 0) && (
        <label className="flex flex-col label">
          <span key="bestScore" className="label-text-alt">
            {t("Best Score")}: {bestScore.toFixed(2)}
          </span>
          <span key="difficulty" className="label-text-alt">
            {t("Difficulty")}: {rarity.toFixed(2)}
          </span>
        </label>
      )}

      <div className="flex flex-col items-center">
        {attrs.map((attr, idx) => (
          <span
            className={classNames("badge", "text-xs", "badge-primary")}
            key={attr}
          >
            {t(`${AttributeType[attr].toLowerCase()}`, { ns: "artifacts" })}
            {setFunc && (
            <X
              className="cursor-pointer"
              onClick={() => handleAttrRemove(idx)}
            />)}
          </span>
        ))}
        {isAdding && (
          <select
            className="text-xs select select-ghost select-md"
            value={""}
            onChange={handleAttrAdd}
          >
            <option disabled key={""} value={""}>
              {t("Pick one")}
            </option>
            {mainAttributeOptions[position]
              .filter((option) => !attrs.includes(option))
              .map((option) => (
                <option key={option} value={option}>
            {t(`${AttributeType[option].toLowerCase()}`, { ns: "artifacts" })}
                </option>
              ))}
          </select>
        )}
      </div>
    </>
  );
};

export default MainAttributeEditor;
