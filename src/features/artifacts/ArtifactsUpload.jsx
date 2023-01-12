import { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowUp, ArrowDown, X } from "phosphor-react";
import ReactLoading from "react-loading";

import ArtifactFitnessCard from "./ArtifactFitnessCard";
import SetSelect from "../sets/SetSelect";
import AttributePositionSelect from "./AttributePositionSelect";
import { defaultFitness, defaultRarity } from "../../utils/config";
import {
  calculateFitsAndRarity,
  updateFitsAndRarity,
} from "../../store/reducers/artifacts";
import { getArtifactsResultHash } from "../../utils/hash";

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
  const { builds, config } = useSelector((state) => state.build);
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

  const resultHash = useMemo(() => getArtifactsResultHash(enabledBuilds));
  const { allFits, allRarity } = useSelector(
    (state) =>
      (state.artifacts.fitsAndRarity[artifactsId] || {})[resultHash] ?? {
        allFits: {},
        allRarity: {},
      }
  );
  const isLoading = useMemo(
    () =>
      Object.keys(allFits).length === 0 || Object.keys(allRarity).length === 0,
    [allFits, allRarity]
  );
  const [progress, setProgress] = useState(0);
  const calculator = useMemo(
    () =>
      new Worker(new URL("../../workers/calculator.ts", import.meta.url), {
        type: "module",
      }),
    []
  );

  const [fitness, setFitness] = useState(
    searchParams.get("fitness")
      ? Number(searchParams.get("fitness"))
      : defaultFitness
  );
  const [rarity, setRarity] = useState(
    searchParams.get("rarity")
      ? Number(searchParams.get("rarity"))
      : defaultRarity
  );
  const [set, setSet] = useState(
    searchParams.get("set") ? Number(searchParams.get("set")) : 0
  );
  const [pos, setPos] = useState(
    searchParams.get("pos") ? Number(searchParams.get("pos")) : 0
  );
  const [page, setPage] = useState(
    searchParams.get("page") ? Number(searchParams.get("page")) : 0
  );
  const [offset, setOffset] = useState(
    searchParams.get("offset") ? Number(searchParams.get("offset")) : 20
  );
  const [sortKey, setSortKey] = useState(
    searchParams.get("pos") ?? "rarity-desc"
  );

  const compareFn = useCallback(
    (a, b) => {
      if (
        !!!allFits[a] ||
        !!!allFits[b] ||
        !!!allRarity[a] ||
        !!!allRarity[b]
      ) {
        return 0;
      }
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
    },
    [sortKey, allFits, allRarity]
  );
  const filterFn = useCallback(
    (idx) => {
      let ret =
        allFits[idx] &&
        allRarity[idx] &&
        (Math.max(...Object.values(allFits[idx])) >= Number(fitness) ||
          allRarity[idx] >= rarity);
      if (set > 0) {
        ret = ret && artifacts[idx].set === set;
      }
      if (pos > 0) {
        ret = ret && artifacts[idx].position === pos;
      }
      return ret;
    },
    [fitness, rarity, allFits, allRarity, set, pos]
  );
  const filteredArtifacts = useMemo(
    () =>
      artifacts && artifacts.length > 0
        ? [...artifacts.map((_, index) => index)]
            .sort(compareFn)
            .filter(filterFn)
        : [],
    [artifacts, compareFn, filterFn, page, offset]
  );

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

  const updateParam = useCallback(
    (param, value, replace = true) => {
      let updatedSearchParams = new URLSearchParams(searchParams.toString());
      updatedSearchParams.set(param, value);
      setSearchParams(updatedSearchParams.toString(), { replace: replace });
    },
    [searchParams]
  );
  useEffect(() => {
    updateParam("fitness", fitness);
  }, [fitness]);
  useEffect(() => {
    updateParam("rarity", rarity);
  }, [rarity]);
  useEffect(() => {
    updateParam("set", set);
  }, [set]);
  useEffect(() => {
    updateParam("position", pos);
  }, [pos]);
  useEffect(() => {
    updateParam("sort", sortKey);
  }, [sortKey]);
  useEffect(() => {
    updateParam("page", page, false);
  }, [page]);
  useEffect(() => {
    updateParam("offset", offset, false);
  }, [offset]);
  useEffect(() => {
    if (
      artifacts === undefined ||
      artifacts.length === 0 ||
      enabledBuilds.length === 0
    ) {
      return;
    }
    if (window.Worker) {
      calculator.postMessage({ artifacts, builds: enabledBuilds });
      calculator.onmessage = (e) => {
        if (!isNaN(Number(e.data))) {
          setProgress(e.data);
        } else {
          const { allFits, allRarity } = e.data;
          dispatch(
            updateFitsAndRarity({
              hash: artifactsId,
              enabledBuilds,
              allFits,
              allRarity,
            })
          );
        }
      };
    } else {
      setTimeout(() => {
        dispatch(
          calculateFitsAndRarity({
            hash: artifactsId,
            artifacts,
            enabledBuilds,
          })
        );
      }, 0);
    }
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
      {isLoading ? (
        <div className="mt-10 flex flex-col items-center space-y-5">
          <div className="flex flex-row items-center">
            <ReactLoading
              type="bars"
              className="fill-primary"
              style={{ height: 32, width: 32 }}
            />
            <span className="text-xl">{t("Calculating")}</span>
            <ReactLoading
              type="bars"
              className="fill-primary"
              style={{ height: 32, width: 32 }}
            />
          </div>
          <progress
            className="progress progress-primary w-56"
            value={progress}
            max="1"
          ></progress>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {filteredArtifacts.length > offset && (
            <div className="btn-group self-end justify-self-end">
              <button
                onClick={() => page > 0 && setPage(page - 1)}
                className={`btn btn-ghost ${
                  page === 0 && "cursor-not-allowed"
                }`}
              >
                «
              </button>
              <select
                className="btn select btn-ghost select-ghost max-w-xs "
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
              >
                {[
                  ...Array(Math.ceil(filteredArtifacts.length / offset)).keys(),
                ].map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}{" "}
              </select>
              <button
                onClick={() =>
                  page < Math.floor(filteredArtifacts.length / offset) &&
                  setPage(page + 1)
                }
                className={`btn btn-ghost ${
                  page === Math.floor(filteredArtifacts.length / offset) &&
                  "cursor-not-allowed"
                }`}
              >
                »
              </button>
            </div>
          )}
          {filteredArtifacts
            .slice(page * offset, (page + 1) * offset)
            .map((index) => (
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
            ))}
        </div>
      )}
    </div>
  );
};

export default ArtifactsUpload;
