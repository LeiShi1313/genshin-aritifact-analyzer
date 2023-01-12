import { t } from "i18next";
import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { encodeBuild } from "../../utils/build";
import CharacterAvatar from "../characters/CharacterAvatar";
import ArtifactCard from "./ArtifactCard";

const rarityToColor = (r) => {
  let rarity = Number(r);
  if (rarity >= 9.0) return "text-red-800 font-bold";
  else if (rarity >= 8.0) return "text-red-600";
  else if (rarity >= 7.0) return "text-orange-600";
  else if (rarity >= 6.0) return "text-yellow-600";
  else if (rarity >= 5.0) return "text-yellow-600";
  else if (rarity >= 4.0) return "text-yellow-600";
  else if (rarity >= 3.0) return "text-yellow-600";
  else if (rarity >= 2.0) return "text-yellow-600";
  else if (rarity >= 1.0) return "text-yellow-600";
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

  const handleClick = (hash) =>
    presets[hash]
      ? navigate(`/build?build=${encodeBuild(presets[hash])}`)
      : navigate(`/build?id=${hash}&build=${encodeBuild(builds[hash])}`);

  return (
    <div className="flex w-80 flex-col items-center space-y-2 rounded-2xl bg-base-200 px-2 py-2 shadow-2xl lg:w-auto lg:flex-row">
      <div className="flex flex-col items-center sm:flex-row">
        <ArtifactCard artifact={artifact} fitAttributes={fitAttributes} />
        <div className="flex flex-col space-y-2 py-2 px-2">
          <div className={classNames(rarityToColor(rarity))}>
            {rarity && (
              <span>
                {t("Rarity")}: {rarity.toFixed(2)}
              </span>
            )}
          </div>
          <div className={classNames(rarityToColor(bestScore * 10))}>
            {Object.values(fits).length > 0 && (
              <span>
                {t("Fitness")}: {(100 * bestScore).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-row">
        <div className="grid grid-cols-4 gap-x-1 gap-y-1 md:grid-cols-6 lg:grid-cols-8">
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
                <CharacterAvatar
                  character={builds[key].character}
                  withRing={fits[key] >= bestScore}
                />
              </div>
            ))}
          {filteredFits.length > 8 && !showAll && (
            <div
              className="tooltip"
              data-tip={`${filteredFits.length - 8} more`}
            >
              <span
                className="cursor-pointer text-2xl font-bold"
                onClick={() => setShowAll(true)}
              >
                ...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtifactFitnessCard;
