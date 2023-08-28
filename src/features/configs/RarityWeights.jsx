import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Question } from "phosphor-react";
import { subAttrIdx } from "../../config";
import { AttributeType, AttributePosition } from "../../genshin/attribute";
import { enumToIdx } from "../../utils/enum";
import {
  updateRarityWeights,
  resetRarityWeights,
} from "../../store/reducers/configs";
import {
  mainAttributeOptions,
  subAttributeOptions,
} from "../../utils/attribute";
import DigitInput from "./DigitInput";
import { useEffect, useMemo, useState } from "react";
import IconReset from "../../assets/svgs/IconReset";
import ArtifactPositionIcon from "../../assets/svgs/ArtifactPositionIcon";
import IconSubStats from "../../assets/svgs/IconSubStats";
import AttributeIcon from "../../assets/svgs/AttributeIcon";

const RarityWeights = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { rarityWeights } = useSelector((state) => state.configs);
  const [rarity, setRarity] = useState(0);

  const rarityWorker = useMemo(
    () =>
      new Worker(new URL("../../workers/rarityWorker.ts", import.meta.url), {
        type: "module",
      }),
    []
  );

  useEffect(() => {
    if (window.Worker) {
      rarityWorker.postMessage({
        position: AttributePosition.GOBLET,
        mainAttributes: [AttributeType.ELEMENTAL_MASTERY],
        subAttributes: [
          {type:AttributeType.CRIT_DAMAGE, value:1},
          {type:AttributeType.CRIT_RATE, value:1},
          {type:AttributeType.ATK_PERCENT, value:1},
          {type:AttributeType.ENERGY_RECHARGE, value:1},
        ],
        config: {
          rarityWeights: rarityWeights,
        }
      })
      rarityWorker.onmessage = (e) => {
        setRarity(e.data);
      };
    }
  }, [rarityWeights, rarityWorker]);

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <span className="font-bold">{t("Lower weight means higher rarity")}</span>
      <span>
      {t("Rarity")}: {rarity.toFixed(2)}
      </span>
      <div className="grid-rows-9 grid grid-cols-[auto_1fr_1fr_1fr_1fr] gap-1 w-full">
        <button
          className="btn btn-secondary btn-sm btn-outline gap-1 rounded-full text-sm md:text-base px-2 md:px-3"
          onClick={() => dispatch(resetRarityWeights())}
        >
          <IconReset />
          {t("Reset")}
        </button>
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
            subAttrIdx,
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
                  value={rarityWeights[type - 1][pos]}
                  setValue={(value) =>
                    dispatch(
                      updateRarityWeights({ x: type - 1, y: pos, value })
                    )
                  }
                  canEdit={
                    pos + 1 in mainAttributeOptions
                      ? mainAttributeOptions[pos + 1].includes(type)
                      : subAttributeOptions.includes(type)
                  }
                />
              </span>
            )
          )
        )}
      </div>
    </div>
  );
};

export default RarityWeights;
