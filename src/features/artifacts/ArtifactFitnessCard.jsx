import { t } from "i18next";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { encodeBuild } from "../../utils/build";
import ArtifactCard from "./ArtifactCard";
import CharacterCard from "../characters/CharacterCard";

const valueToColor = (v) => {
  let value = Number(v);
  if (value >= 9.0) return "#b91c1c";
  else if (value >= 8.0) return "#db2626";
  else if (value >= 7.0) return "#e8580f";
  else if (value >= 6.0) return "#d5770b";
  else if (value >= 5.0) return "#c18b11";
  else if (value >= 4.0) return "#65a20d";
  else if (value >= 3.0) return "#16a34a";
  else if (value >= 2.0) return "#059569";
  else if (value >= 1.0) return "#0891b2";
};

const ArtifactFitnessCard = ({
  artifact,
  builds,
  fits,
  rarity,
  minFitness,
  minRarity,
}) => {
  const navigate = useNavigate();
  const presets = useSelector((state) => state.presets.builds);
  const bestScore = useMemo(() => Math.max(...Object.values(fits)), [fits]);
  const filteredFits = useMemo(
    () =>
      [...Object.keys(fits)]
        .sort((a, b) => fits[b] - fits[a])
        .filter((key) => fits[key] >= Number(minFitness)),
    [fits, minFitness]
  );
  const [showAll, setShowAll] = useState(false);
  const [hoveredBuild, setHoveredBuild] = useState(null);
  const emptyAttributes = [];
  const fitAttributes = useMemo(
    () =>
      hoveredBuild && builds[hoveredBuild]
        ? builds[hoveredBuild].subAttributes.map((attr) => attr.type)
        : emptyAttributes,
    [hoveredBuild]
  );

  const characterCardWidth = 16;

  const handleClick = (hash) =>
    presets[hash]
      ? navigate(`/build?build=${encodeBuild(presets[hash])}`)
      : navigate(`/build?id=${hash}&build=${encodeBuild(builds[hash])}`);

  return (
    <div className="mt-5 flex w-auto flex-col items-stretch gap-2 rounded-xl bg-base-200 p-3 lg:w-auto lg:flex-row lg:items-start">
      {/* Artifact info card */}
      <ArtifactCard artifact={artifact} fitAttributes={fitAttributes} />

      {/* Artifact value section */}
      <div className="flex w-full flex-col items-stretch gap-2 self-stretch lg:flex-row">
        {/* Rarity & Fitness value */}
        <div className="flex w-full flex-row gap-2 lg:h-32 lg:w-auto lg:flex-col">
          {Object.values(fits).length > 0 && (
            <div
              className="flex grow flex-col justify-between rounded bg-primary/5 px-3 py-1.5 font-bold lg:min-w-[5.5rem]"
              style={{
                color: valueToColor(bestScore * 10),
              }}
            >
              <span className="text-xs">{t("Fitness")}</span>
              <span className="text-right text-lg">
                {(100 * bestScore).toFixed(0)}%
              </span>
            </div>
          )}
          {rarity && (
            <div
              className="flex grow flex-col justify-between rounded bg-primary/5 px-3 py-1.5 font-bold lg:min-w-[5.5rem]"
              style={{
                color: valueToColor(rarity),
              }}
            >
              <span className="text-xs">{t("Rarity")}</span>
              <span className="text-right text-lg">{rarity.toFixed(2)}</span>
            </div>
          )}
        </div>
        {/* Fit builds section */}
        <div className="flex flex-col gap-2">
          {/* Fit builds title & show all button */}
          <div
            className={
              "flex h-8 items-center justify-between rounded bg-primary/5 px-3 py-1.5 text-xs transition-colors " +
              (filteredFits.length > 8 && "cursor-pointer hover:bg-primary/20")
            }
            onClick={() => {
              if (filteredFits.length > 8) setShowAll((prev) => !prev);
            }}
          >
            <p>{t("Found fit builds", { num: filteredFits.length })}</p>
            {filteredFits.length > 8 && (
              <p className="select-none text-secondary">
                {showAll ? t("Show less") : t("Show all")}
                <svg
                  className={
                    "ml-2 inline-block h-3 w-3 fill-current " +
                    (showAll && "rotate-180")
                  }
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 2048 2048"
                >
                  <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                </svg>
              </p>
            )}
          </div>
          {/* Fit build cards list */}
          {filteredFits.length > 0 && (
            <div className="flex w-full flex-row flex-wrap items-stretch gap-2">
              {filteredFits
                .slice(0, showAll ? filteredFits.length : 8)
                .map((key, idx) => (
                  <div
                    key={idx}
                    className="tooltip cursor-pointer"
                    data-tip={
                      (builds[key].name ? builds[key].name : "") +
                      `${t("Fitness")}: ${(100 * fits[key]).toFixed(0)}%`
                    }
                    onClick={() => handleClick(key)}
                    onMouseEnter={() => setHoveredBuild(key)}
                    onMouseLeave={() => setHoveredBuild(null)}
                  >
                    {/* <CharacterAvatar
                    character={builds[key].character}
                    withRing={fits[key] >= bestScore}
                  /> */}
                    <CharacterCard
                      character={builds[key].character}
                      text={(100 * fits[key]).toFixed(0) + "%"}
                      textColor={valueToColor(fits[key] * 10)}
                      width={characterCardWidth}
                      isBestFit={fits[key] >= bestScore}
                    />
                  </div>
                ))}
              {/* {filteredFits.length > 8 && !showAll && (
              <div
                className="tooltip flex h-24 grow cursor-pointer items-center justify-center rounded bg-base-100"
                data-tip={`${filteredFits.length - 8} more`}
                onClick={() => setShowAll(true)}
                style={{ maxWidth: characterCardWidth / 4 + "rem" }}
              >
                <span className="text-2xl font-bold">...</span>
              </div>
            )} */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtifactFitnessCard;
