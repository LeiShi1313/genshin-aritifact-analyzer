import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactLoading from "react-loading";
import { useDispatch, useSelector } from "react-redux";
import {
  useLocation, useNavigate, useParams, useSearchParams
} from "react-router-dom";

import { defaultFitness, defaultRarity } from "../../config";
import useQueryParams from "../../hooks/useQueryParams";
import {
  calculateFitsAndRarity,
  updateFitsAndRarity
} from "../../store/reducers/artifacts";
import { getArtifactsResultHash, getConfigHash } from "../../utils/hash";
import Paginator from "../Paginator";
import ArtifactFitnessCard from "./ArtifactFitnessCard";
import ArtifactsFilter from "./ArtifactsFilter";
import BackToHome from "../navigation/BackToHome";


const Calculating = ({ t, progress, hasConfigChange }) => {
  return (
    <div className="mt-10 flex flex-col items-center space-y-5">
      <div className="flex flex-row items-center">
        <ReactLoading
          type="bars"
          className="fill-primary"
          style={{ height: 32, width: 32 }}
        />
        {hasConfigChange ? (
          <span className="text-xl">
            {t("Detected config changes recalculating")}
          </span>
        ) : (
          <span className="text-xl">{t("Calculating")}</span>
        )}
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
  );
};

const ArtifactsUpload = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { artifactsId } = useParams();
  const artifacts = useSelector(
    (state) => (state.uploads.artifacts[artifactsId] ?? {}).items ?? []
  );
  const format = useSelector(
    (state) => (state.uploads.artifacts[artifactsId] ?? {}).format
  );
  const { builds, config } = useSelector((state) => state.build);
  const customConfigs = useSelector((state) => state.configs);
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
  const { allFits, allRarity, configHash } = useSelector(
    (state) =>
      ((state.artifacts.fitsAndRarity || {})[artifactsId] || {})[
        resultHash
      ] ?? {
        allFits: {},
        allRarity: {},
        configHash: "",
      }
  );
  const isLoading = useMemo(
    () =>
      Object.keys(allFits).length === 0 ||
      Object.keys(allRarity).length === 0 ||
      configHash !== getConfigHash(customConfigs),
    [allFits, allRarity, configHash, customConfigs]
  );
  const hasConfigChange = useMemo(
    () =>
      (Object.keys(allFits).length > 0 || Object.keys(allRarity).length > 0) &&
      configHash !== getConfigHash(customConfigs),
    [configHash, customConfigs]
  );
  const [progress, setProgress] = useState(0);
  const calculator = useMemo(
    () =>
      new Worker(new URL("../../workers/calculator.ts", import.meta.url), {
        type: "module",
      }),
    []
  );

  const [
    fitness,
    rarity,
    set,
    pos,
    minLevel,
    maxLevel,
    sortKey,
    setFitness,
    setRarity,
    setSet,
    setPos,
    setMinLevel,
    setMaxLevel,
    setSortKey,
  ] = useQueryParams([
    {
      name: "fitness",
      defaultValue: defaultFitness,
      isNumeric: true,
      replace: false,
    },
    {
      name: "rarity",
      defaultValue: defaultRarity,
      isNumeric: true,
      replace: false,
    },
    { name: "set", defaultValue: 0, isNumeric: true, replace: false },
    { name: "position", defaultValue: 0, isNumeric: true, replace: false },
    { name: "minLevel", defaultValue: 0, isNumeric: true, replace: false },
    { name: "maxLevel", defaultValue: 20, isNumeric: true, replace: false },
    { name: "sort", defaultValue: "rarity-desc", replace: false },
  ]);
  const [page, setPage] = useState(0);
  const [offset, setOffset] = useState(20);

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
      ret = ret && artifacts[idx].level >= minLevel && artifacts[idx].level <= maxLevel;
      return ret;
    },
    [fitness, rarity, allFits, allRarity, set, pos, minLevel, maxLevel]
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

  const handleDownloadYasLock = useCallback(() => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        JSON.stringify(
          filteredArtifacts.filter((idx) => !artifacts[idx].locked)
        ),
      ],
      { type: "text/json" }
    );
    element.href = URL.createObjectURL(file);
    element.download = "lock.json";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }, [filteredArtifacts]);

  useEffect(() => {
    if (
      artifacts === undefined ||
      artifacts.length === 0 ||
      Object.keys(enabledBuilds).length === 0 || 
      configHash === getConfigHash(customConfigs)
    ) {
      return;
    }
    if (window.Worker) {
      calculator.postMessage({
        artifacts,
        builds: enabledBuilds,
        config: customConfigs,
      });
      calculator.onmessage = (e) => {
        if (!isNaN(Number(e.data))) {
          setProgress(e.data);
        } else {
          const { allFits, allRarity, configHash } = e.data;
          dispatch(
            updateFitsAndRarity({
              hash: artifactsId,
              enabledBuilds,
              allFits,
              allRarity,
              configHash,
            })
          );
        }
      };
    } else if (window.setInterval) {
      setTimeout(() => {
        dispatch(
          calculateFitsAndRarity({
            hash: artifactsId,
            artifacts,
            enabledBuilds,
          })
        );
      }, 0);
    } else {
      dispatch(
        calculateFitsAndRarity({
          hash: artifactsId,
          artifacts,
          enabledBuilds,
        })
      );
    }
  }, [enabledBuilds, artifacts]);

  if (artifacts === undefined) {
    return (
      <BackToHome title={t("No uploaded artifacts founds")} />
    );
  } else if (Object.keys(enabledBuilds).length === 0) {
    return <BackToHome title={t("No enabled builds")} />;
  }
  return (
    <div className="flex w-full max-w-screen-lg flex-col items-center justify-center">
      <ArtifactsFilter
        fitness={fitness}
        setFitness={(f) => {
          setPage(0);
          setFitness(f);
        }}
        rarity={rarity}
        setRarity={(r) => {
          setPage(0);
          setRarity(r);
        }}
        sortKey={sortKey}
        setSortKey={(s) => {
          setPage(0);
          setSortKey(s);
        }}
        set={set}
        setSet={(s) => {
          setPage(0);
          setSet(s);
        }}
        pos={pos}
        setPos={(p) => {
          setPage(0);
          setPos(p);
        }}
        minLevel={minLevel}
        setMinLevel={(l) => {
          setPage(0);
          setMinLevel(l)
        }}
        maxLevel={maxLevel}
        setMaxLevel={(l) => {
          setPage(0);
          setMaxLevel(l)
        }}
      />
      {isLoading ? (
        <Calculating
          t={t}
          progress={progress}
          hasConfigChange={hasConfigChange}
        />
      ) : (
        <div className="flex flex-col items-stretch space-y-4 w-full px-4 lg:px-0">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center px-2">
              {format === "GOOD" && filteredArtifacts.length > 0 && (
                <button
                  className="btn btn-primary"
                  onClick={handleDownloadYasLock}
                >
                  {t("Generate")} lock.json
                </button>
              )}
            </div>
            {filteredArtifacts.length > offset && (
              <Paginator
                page={page}
                setPage={setPage}
                offset={offset}
                setOffset={setOffset}
                totalPages={filteredArtifacts.length}
              />
            )}
          </div>
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
          {filteredArtifacts.length > offset && (
            <Paginator
              page={page}
              setPage={setPage}
              offset={offset}
              setOffset={setOffset}
              totalPages={filteredArtifacts.length}
              scrollToId="main-content"
            />
          )}
          <div className="h-2 w-full"></div>
        </div>
      )}
    </div>
  );
};

export default ArtifactsUpload;
