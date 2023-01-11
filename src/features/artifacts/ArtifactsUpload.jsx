import { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowUp, ArrowDown, X } from "phosphor-react";
import ReactLoading from "react-loading";

import { getBuildSets } from "../../utils/build";
import ArtifactFitnessCard from "./ArtifactFitnessCard";
import SetSelect from "../sets/SetSelect";
import AttributePositionSelect from "./AttributePositionSelect";
import { defaultFitness, defaultRarity } from "../../utils/config";
import { getFitness, getRarity } from "../../utils/weights";
import { AttributePosition } from "../../genshin/attribute";
import {
  getMainAttributeWeights,
  getSubAttributeWeights,
} from "../../utils/weights";
import { enumToIdx } from "../../utils/enum";

const BackToHome = ({ t, title, navigate }) => {
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{t(title)}!</h2>
        <div className="card-actions justify-end">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/", { replace: true })}
          >
            {t("Back to home")}
          </button>
        </div>
      </div>
    </div>
  );
};

const ArtifactsUpload = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { artifactsId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const artifacts = useSelector(
    (state) => state.uploads.artifacts[artifactsId]
  );
  const builds = useSelector((state) => state.build.builds);
  const config = useSelector((state) => state.build.config);
  const presetBuilds = useSelector((state) => state.presets.builds);
  const enabledBuilds = useMemo(() => {
    const enabledBuilds = {};
    for (const key of Object.keys(builds)) {
      if (config[key] && config[key].enabled) {
        enabledBuilds[key] = builds[key];
      }
    }
    for (const key of Object.keys(presetBuilds)) {
      if (config[key] && config[key].enabled) {
        enabledBuilds[key] = presetBuilds[key];
      }
    }
    return enabledBuilds;
  }, [builds, presetBuilds, config]);

  const [fitness, setFitness] = useState(
    searchParams.get("fitness") ?? defaultFitness
  );
  const [rarity, setRarity] = useState(
    searchParams.get("rarity") ?? defaultRarity
  );
  const [isLoading, setIsLoading] = useState(false);
  const [allFits, setAllFits] = useState({});
  const [allRarity, setAllRarity] = useState({});
  const [set, setSet] = useState(0);
  const [pos, setPos] = useState(0);
  const [sortKey, setSortKey] = useState("rarity-desc");

  const show = (idx) =>
    allFits[idx] !== undefined &&
    allRarity[idx] !== undefined &&
    (Math.max(...Object.values(allFits[idx])) >= Number(fitness) ||
      allRarity[idx] >= rarity);

  const compareFn = useCallback((a, b) => {
    if (sortKey === "rarity-desc") {
      return allRarity[b] - allRarity[a];
    } else if (sortKey === "rarity-asc") {
      return allRarity[a] - allRarity[b];
    } else if (sortKey === "fitness-desc") {
      return (
        Math.max(...Object.values(allFits[b])) -
        Math.max(...Object.values(allFits[a]))
      );
    } else if (sortKey === "fitness-asc") {
      return (
        Math.max(...Object.values(allFits[a])) -
        Math.max(...Object.values(allFits[b]))
      );
    }
  }, [sortKey]);
  const filterFn = useCallback((idx) => {
    let ret = true;
    if (set > 0) {
      ret = ret && artifacts[idx].set === set;
    }
    if (pos > 0) {
      ret = ret && artifacts[idx].position === pos;
    }
    return ret;
  }, [set, pos])

  useEffect(() => {
    let updatedSearchParams = new URLSearchParams(searchParams.toString());
    updatedSearchParams.set("fitness", fitness);
    setSearchParams(updatedSearchParams.toString(), { replace: true });
  }, [fitness]);
  useEffect(() => {
    let updatedSearchParams = new URLSearchParams(searchParams.toString());
    updatedSearchParams.set("rarity", rarity);
    setSearchParams(updatedSearchParams.toString(), { replace: true });
  }, [rarity]);
  useEffect(() => {
    if (Object.keys(allFits).length > 0 && Object.keys(allRarity).length > 0)
      return;
    setIsLoading(true);
    setTimeout(() => {
      if (Object.keys(enabledBuilds).length === 0 || artifacts.length === 0)
        return;
      const weights = {};
      for (const hash of Object.keys(enabledBuilds)) {
        const weight = {};
        for (const idx of enumToIdx(AttributePosition)) {
          const build = enabledBuilds[hash];
          weight[idx] = getMainAttributeWeights(
            idx,
            build[`${AttributePosition[idx].toLowerCase()}Attributes`],
            build.subAttributes
          ).toArray();
          weight["sub"] = getSubAttributeWeights(build.subAttributes).toArray();
        }
        weights[hash] = weight;
      }

      artifacts.forEach((artifact, index) => {
        const rarity = getRarity(
          artifact.position,
          [artifact.mainAttribute.type],
          artifact.subAttributes.map((attr) => ({ type: attr.type, value: 1 }))
        );
        const fits = getFitness(
          artifact,
          Object.keys(enabledBuilds)
            .filter((key) => weights[key] !== undefined)
            .map((key) => ({
              hash: key,
              sets: getBuildSets(enabledBuilds[key]),
              ...weights[key],
            }))
        );
        setAllFits((allFits) => ({ ...allFits, [index]: fits }));
        setAllRarity((allRarity) => ({ ...allRarity, [index]: rarity }));
      });
      setIsLoading(false);
    }, 0);
  }, [enabledBuilds, artifacts]);

  if (artifacts === undefined) {
    return (
      <BackToHome
        t={t}
        title="No uploaded artifacts founds"
        navigate={navigate}
      />
    );
  } else if (Object.keys(enabledBuilds).length === 0) {
    return <BackToHome t={t} title="No enabled builds" navigate={navigate} />;
  }
  return (
    <div className="flex w-full flex-col items-center justify-center">
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
            <ArrowUp
              weight={sortKey === "fitness-asc" ? "bold" : "thin"}
              onClick={() => setSortKey("fitness-asc")}
            />
            <ArrowDown
              weight={sortKey === "fitness-desc" ? "bold" : "thin"}
              onClick={() => setSortKey("fitness-desc")}
            />
          </span>
          <span className="flex flex-row items-center">
            {t("Rarity")}
            <ArrowUp
              weight={sortKey === "rarity-asc" ? "bold" : "thin"}
              onClick={() => setSortKey("rarity-asc")}
            />
            <ArrowDown
              weight={sortKey === "rarity-desc" ? "bold" : "thin"}
              onClick={() => setSortKey("rarity-desc")}
            />
          </span>
        </div>
        <div className="flex flex-col md:flex-row items-center space-x-2">
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
      {isLoading ||
      Object.keys(allFits).length === 0 ||
      Object.keys(allRarity).length === 0 ? (
        <div className="flex flex-row items-center mt-10">
          <ReactLoading type="bars" className="fill-primary" style={{ height: 32, width: 32 }} />
          <span className="text-xl">{t('Calculating')}</span>
          <ReactLoading type="bars" className="fill-primary" style={{ height: 32, width: 32 }} />
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          {[...artifacts.map((_, index) => index)]
            .sort(compareFn)
            .filter(filterFn)
            .map(
              (index) =>
                show(index) && (
                  <ArtifactFitnessCard
                    key={index}
                    index={index}
                    artifact={artifacts[index]}
                    builds={enabledBuilds}
                    fits={allFits[index]}
                    rarity={allRarity[index]}
                    minFitness={fitness}
                    minRarity={rarity}
                  />
                )
            )}
        </div>
      )}
    </div>
  );
};

export default ArtifactsUpload;
