import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp, ArrowDown, X } from "phosphor-react";

import SetSelect from "../sets/SetSelect";
import AttributePositionSelect from "./AttributePositionSelect";
import MultiRange from "../inputs/MultiRange";
import MultiSelect from "../inputs/MultiSelect";
import { enumToIdx } from "../../utils/enum";
import { Character } from "../../genshin/character";

const ArtifactsFilter = ({
  fitness,
  setFitness,
  rarity,
  setRarity,
  sortKey,
  setSortKey,
  set,
  setSet,
  pos,
  setPos,
  minLevel,
  setMinLevel,
  maxLevel,
  setMaxLevel,
}) => {
  const { t } = useTranslation();
  const [values, setValues] = useState([]);

  const handleSortChange = useCallback(
    (newSortKey) => {
      if (newSortKey.split("-")[0] === sortKey.split("-")[0]) {
        setSortKey(
          newSortKey.split("-")[0] +
          "-" +
          (sortKey.split("-")[1] === "asc" ? "desc" : "asc")
        );
      } else {
        setSortKey(newSortKey);
      }
    },
    [sortKey]
  );
  const levelOnChange = useCallback(({min, max}) => {
    setMinLevel(min);
    setMaxLevel(max);
  }, []);

  return (
    <>
      <div className="flex w-full flex-col items-center justify-center space-y-2 md:flex-row md:space-y-0 md:space-x-12">
        <div className="flex w-4/5 flex-row items-center justify-center space-x-2 md:w-1/5">
          <span className="whitespace-nowrap font-bold">{t("Fitness")}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={fitness}
            className="range range-primary"
            onChange={(e) => setFitness(e.target.value)}
          />
          <span>{(fitness * 100).toFixed(0)}%</span>
        </div>
        <div className="flex w-4/5 flex-row items-center justify-center space-x-2 md:w-1/5">
          <span className="whitespace-nowrap font-bold">{t("Rarity")}</span>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={rarity}
            className="range range-secondary"
            onChange={(e) => setRarity(e.target.value)}
          />
          <span>{Number(rarity).toFixed(1)}</span>
        </div>
      </div>
      <div className="my-4 flex w-full flex-col items-center justify-center text-lg text-primary-focus md:flex-row md:space-x-4">
        <div className="flex flex-row items-center space-x-4">
          <span className="flex flex-row items-center">
            {t("Fitness")}
            {sortKey === "fitness-asc" && (
              <ArrowUp
                weight={sortKey === "fitness-asc" ? "bold" : "thin"}
                onClick={() => handleSortChange("fitness-asc")}
              />
            )}
            {(sortKey === "fitness-desc" || sortKey.startsWith("rarity")) && (
              <ArrowDown
                weight={sortKey === "fitness-desc" ? "bold" : "thin"}
                onClick={() => handleSortChange("fitness-desc")}
              />
            )}
          </span>
          <span className="flex flex-row items-center">
            {t("Rarity")}
            {sortKey === "rarity-asc" && (
              <ArrowUp
                weight={sortKey === "rarity-asc" ? "bold" : "thin"}
                onClick={() => handleSortChange("rarity-asc")}
              />
            )}
            {(sortKey === "rarity-desc" || sortKey.startsWith("fitness")) && (
              <ArrowDown
                weight={sortKey === "rarity-desc" ? "bold" : "thin"}
                onClick={() => handleSortChange("rarity-desc")}
              />
            )}
          </span>
        </div>
        <div className="flex flex-col items-center space-x-2 md:flex-row">
          <div className="flex flex-row items-center space-x-2">
            <SetSelect set={set} setSet={setSet} />
            <X className="cursor-pointer" onClick={() => setSet(0)} />
          </div>
          <div className="flex flex-row items-center space-x-2">
            <AttributePositionSelect pos={pos} setPos={setPos} />
            <X className="cursor-pointer" onClick={() => setPos(0)} />
          </div>
        </div>
      </div>
      <div className="flex w-full flex-row items-center justify-center text-primary-focus space-x-2">
        <span>{t("level", { ns: "artifacts"})}</span>
        <span className="text-lg">{minLevel}</span>
        <MultiRange
          min={0}
          max={20}
          onChange={levelOnChange}
        />
        <span>{maxLevel}</span>
      </div>
    </>
  );
};

export default ArtifactsFilter;
