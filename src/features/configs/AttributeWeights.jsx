import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Question } from "phosphor-react";
import { subAttrIdx } from "../../utils/config";
import { AttributeType, AttributePosition } from "../../genshin/attribute";
import { enumToIdx } from "../../utils/enum";
import { updateAttributeWeights, resetAttributeWeights } from "../../store/reducers/configs";
import { mainAttributeOptions, subAttributeOptions } from "../../utils/attribute";
import DigitInput from "./DigitInput";

const AttributeWeights = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { attributeWeights } = useSelector((state) => state.configs);

  return (
    <div className="grid-rows-9 grid grid-cols-5 gap-1">
      <span className="btn btn-primary btn-sm btn-outline" onClick={() => dispatch(resetAttributeWeights())}>{t('Reset')}</span>
      <span className="flex flex-row justify-center items-center">
        {t("sands", { ns: "artifacts" })}
      </span>
      <span className="flex flex-row justify-center items-center">
        {t("goblet", { ns: "artifacts" })}
      </span>
      <span className="flex flex-row justify-center items-center">
        {t("circlet", { ns: "artifacts" })}
      </span>
      <span className="flex flex-row justify-center items-center">
        {t("sub", { ns: "artifacts" })}
      </span>
      {enumToIdx(AttributeType).map((type) =>
        [
          0,
          AttributePosition.SANDS - 1,
          AttributePosition.GOBLET - 1,
          AttributePosition.CIRCLET - 1,
          subAttrIdx,
        ].map((pos) =>
          pos === 0 ? (
            <span
              key={type * pos}
              className="flex flex-row items-center justify-center text-xs"
            >
              {t(AttributeType[type].toLowerCase(), { ns: "artifacts" })}
            </span>
          ) : (
            <span
              key={type * pos}
              className="flex flex-row items-center justify-center"
            >
              <DigitInput
                value={attributeWeights[type - 1][pos]}
                setValue={(value) =>
                  dispatch(updateAttributeWeights({ x: type - 1, y: pos, value }))
                }
                step={0.1}
                canEdit={pos+1 in mainAttributeOptions ? mainAttributeOptions[pos+1].includes(type) : subAttributeOptions.includes(type)}
              />
            </span>
          )
        )
      )}
    </div>
  );
};

export default AttributeWeights;
