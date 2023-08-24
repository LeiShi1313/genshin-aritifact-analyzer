import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Question } from "phosphor-react";
import { AttributePosition } from "../../genshin/attribute";
import DigitInput from "./DigitInput";
import {
  updateStandardRarity,
  resetStandardRarity,
  updateNonFiveStarSubstractor,
  updateNonSuitSubstractors,
  resetNonSuitSubstractors,
} from "../../store/reducers/configs";
import ArtifactPositionIcon from "../../assets/svgs/ArtifactPositionIcon";

const Others = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    standardRarity,
    scoreOverhead,
    nonFiveStarSubstractor,
    nonSuitSubstractors,
  } = useSelector((state) => state.configs);
  return (
    <div className="flex flex-col items-start justify-center space-y-2">
      <div className="flex flex-row items-center justify-center">
        <div className="flex flex-row items-center justify-start w-40">
          <span>{t("Standard Rarity")}</span>
          <div
            className="tooltip mx-1"
            data-tip={t(
              "Standard Rarity is the rarity that you want to get at least"
            )}
          >
            <Question size={16} weight="fill" />
          </div>
        </div>
        <DigitInput
          value={standardRarity}
          setValue={(val) => dispatch(updateStandardRarity(val))}
          step={0.1}
        />
      </div>
      <div className="flex flex-row items-center justify-center">
        <div className="flex flex-row items-center justify-start w-40">
        <span>{t("Non-5-star Substractor")}</span>
        </div>
        <DigitInput
          value={nonFiveStarSubstractor}
          setValue={(val) => dispatch(updateNonFiveStarSubstractor(val))}
          step={0.1}
        />
      </div>
      <div className="flex flex-row items-start justify-center">
        <div className="flex flex-row items-center justify-start w-40">
        <span>{t("Non-suit Substractor")}</span>
        </div>
        <div className="flex flex-col items-stretch justify-center">
          {Object.keys(nonSuitSubstractors).map((pos) => (
            <div className="flex flex-row items-center justify-between gap-2" key={pos} >
              <span className="flex flex-row gap-2">
                <div className="w-5 md:w-6">{ArtifactPositionIcon[pos]}</div>
                {t(AttributePosition[pos].toLowerCase(), { ns: "artifacts" })}
              </span>
              <DigitInput
                value={nonSuitSubstractors[pos]}
                setValue={(val) =>
                  dispatch(
                    updateNonSuitSubstractors({ position: pos, value: val })
                  )
                }
                step={0.1}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Others;
