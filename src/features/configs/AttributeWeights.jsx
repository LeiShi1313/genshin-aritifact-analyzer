import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { AttributeType, AttributePosition } from "../../genshin/attribute";
import { enumToIdx } from "../../utils/enum";
import { updateAttributeWeights, resetAttributeWeights } from "../../store/reducers/configs";
import { mainAttributeOptions, subAttributeOptions } from "../../utils/attribute";
import DigitInput from "./DigitInput";
import IconReset from "../../assets/svgs/IconReset";
import ArtifactPositionIcon from "../../assets/svgs/ArtifactPositionIcon";
import AttributeIcon from "../../assets/svgs/AttributeIcon";
import IconSubStats from "../../assets/svgs/IconSubStats";

const AttributeWeights = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { attributeWeights } = useSelector((state) => state.configs);

  return (
    <div className="grid-rows-9 grid grid-cols-[auto_1fr_1fr_1fr_1fr] gap-1 w-full">
      <button className="btn btn-secondary btn-sm btn-outline gap-1 rounded-full text-sm md:text-base px-2 md:px-3" onClick={() => dispatch(resetAttributeWeights())}><IconReset />{t('Reset')}</button>
      <span className="flex flex-col justify-center items-center gap-1 text-sm md:text-base">
        <div className="w-5 md:w-6">{ArtifactPositionIcon[AttributePosition.SANDS]}</div>
        {t("sands", { ns: "artifacts" })}
      </span>
      <span className="flex flex-col justify-center items-center gap-1 text-sm md:text-base">
        <div className="w-5 md:w-6">{ArtifactPositionIcon[AttributePosition.GOBLET]}</div>
        {t("goblet", { ns: "artifacts" })}
      </span>
      <span className="flex flex-col justify-center items-center gap-1 text-sm md:text-base">
        <div className="w-5 md:w-6">{ArtifactPositionIcon[AttributePosition.CIRCLET]}</div>
        {t("circlet", { ns: "artifacts" })}
      </span>
      <span className="flex flex-col justify-center items-center gap-1 text-sm md:text-base">
        <IconSubStats className="w-5 md:w-6"/>
        {t("sub", { ns: "artifacts" })}
      </span>
      {/* Ordered by character stats */}
      {[...enumToIdx(AttributeType).slice(0,11),
        AttributeType.PYRO_DAMAGE_BONUS,
        AttributeType.HYDRO_DAMAGE_BONUS,
        AttributeType.DENDRO_DAMAGE_BONUS,
        AttributeType.ELECTRO_DAMAGE_BONUS,
        AttributeType.ANEMO_DAMAGE_BONUS,
        AttributeType.CRYO_DAMAGE_BONUS,
        AttributeType.GEO_DAMAGE_BONUS,
        AttributeType.PHYSICAL_DAMAGE_BONUS,
      ].map((type) =>
        [
          0,
          AttributePosition.SANDS - 1,
          AttributePosition.GOBLET - 1,
          AttributePosition.CIRCLET - 1,
          AttributePosition.SUB - 1,
        ].map((pos) =>
          pos === 0 ? (
            <span
              key={type * pos}
              className="flex flex-row items-center justify-start gap-2 text-xs"
            >
              <div className="w-4 md:w-5 shrink-0">{AttributeIcon(type, true)}</div>
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
