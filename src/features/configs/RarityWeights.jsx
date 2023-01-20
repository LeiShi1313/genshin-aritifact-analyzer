import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Question } from "phosphor-react";
import { subAttrIdx } from "../../utils/config";
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
import { getRarity } from "../../utils/weights";
import { useEffect, useMemo, useState } from "react";

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
      <div className="grid-rows-9 grid grid-cols-5 gap-1">
        <span
          className="btn btn-outline btn-primary btn-sm"
          onClick={() => dispatch(resetRarityWeights())}
        >
          {t("Reset")}
        </span>
        <span className="flex flex-row items-center justify-center">
          {t("sands", { ns: "artifacts" })}
        </span>
        <span className="flex flex-row items-center justify-center">
          {t("goblet", { ns: "artifacts" })}
        </span>
        <span className="flex flex-row items-center justify-center">
          {t("circlet", { ns: "artifacts" })}
        </span>
        <span className="flex flex-row items-center justify-center">
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
