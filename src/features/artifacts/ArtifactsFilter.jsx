import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp, ArrowDown, X } from "phosphor-react";

import SetSelect from "../sets/SetSelect";
import AttributePositionSelect from "./AttributePositionSelect";
import MultiRange from "../inputs/MultiRange";
import MultiSelect from "../inputs/MultiSelect";
import { enumToIdx } from "../../utils/enum";
import { Character } from "../../genshin/character";
import IconReset from "../../assets/svgs/IconReset";

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
  isDownloadBtnActive,
  handleDownloadYasLock,
}) => {
  const { t } = useTranslation();

  const levelOnChange = useCallback(({ min, max }) => {
    setMinLevel(min);
    setMaxLevel(max);
  }, []);

  return (
    <div className="grid w-full grid-cols-1 gap-4 gap-x-8 rounded-xl bg-secondary/[.15] p-4 md:grid-cols-2">
      {/* Fitness */}
      <div className="flex w-full flex-row items-center justify-center space-x-2 font-bold">
        <span className="whitespace-nowrap">{t("Fitness")}</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={fitness}
          className="range range-primary"
          onChange={(e) => setFitness(e.target.value)}
        />
        <button
          className="btn btn-primary btn-circle btn-xs text-base"
          onClick={() =>
            setFitness((prev) => Math.max(Number(prev) - 0.01, 0).toFixed(2))
          }
        >
          -
        </button>
        <span className="w-12 shrink-0">
          <span className="text-lg">≥</span>
          {(fitness * 100).toFixed(0)}%
        </span>
        <button
          className="btn btn-primary btn-circle btn-xs text-base"
          onClick={() =>
            setFitness((prev) => Math.min(Number(prev) + 0.01, 1).toFixed(2))
          }
        >
          +
        </button>
      </div>
      {/* Rarity */}
      <div className="flex w-full flex-row items-center justify-center space-x-2 font-bold">
        <span className="whitespace-nowrap">{t("Rarity")}</span>
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={rarity}
          className="range range-secondary"
          onChange={(e) => setRarity(e.target.value)}
        />
        <button
          className="btn btn-secondary btn-circle btn-xs text-base"
          onClick={() =>
            setRarity((prev) => Math.max(Number(prev) - 0.1, 0).toFixed(1))
          }
        >
          -
        </button>
        <span className="w-12 shrink-0">
          <span className="text-lg">≥</span>
          {Number(rarity).toFixed(1)}
        </span>
        <button
          className="btn btn-secondary btn-circle btn-xs text-base"
          onClick={() =>
            setRarity((prev) => Math.min(Number(prev) + 0.1, 10).toFixed(1))
          }
        >
          +
        </button>
      </div>
      {/* Set */}
      <div className="flex flex-row items-center gap-2">
        <span className="whitespace-nowrap font-bold capitalize">
          {t("set")}
        </span>
        <SetSelect set={set} setSet={setSet} />
        <button
          className="btn btn-primary btn-circle"
          onClick={() => setSet(0)}
          disabled={set === 0}
        >
          <IconReset />
        </button>
      </div>
      {/* Position */}
      <div className="flex flex-row items-center gap-2">
        <span className="whitespace-nowrap font-bold capitalize">
          {t("position", { ns: "artifacts" })}
        </span>
        <AttributePositionSelect pos={pos} setPos={setPos} />
      </div>
      {/* Level Range */}
      <div className="flex w-full flex-row items-center justify-center space-x-2">
        <span className="whitespace-nowrap font-bold capitalize">
          {t("level", { ns: "artifacts" })}
        </span>
        <span className="w-[2ch]">{minLevel}</span>
        <MultiRange min={0} max={20} onChange={levelOnChange} />
        <span className="w-[2ch]">{maxLevel}</span>
      </div>
      {/* Download Button */}
      <button
        className="btn btn-accent rounded-full text-accent-content shadow-md"
        onClick={handleDownloadYasLock}
        disabled={!isDownloadBtnActive}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24px"
          fill="currentColor"
          className="mr-2"
        >
          <path d="M2 12H4V17H20V12H22V17C22 18.11 21.11 19 20 19H4C2.9 19 2 18.11 2 17V12M12 15L17.55 9.54L16.13 8.13L13 11.25V2H11V11.25L7.88 8.13L6.46 9.55L12 15Z" />
        </svg>
        {t("Generate")} lock.json
      </button>
    </div>
  );
};

export default ArtifactsFilter;
