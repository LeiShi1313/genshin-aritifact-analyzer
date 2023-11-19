import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactLoading from "react-loading";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { defaultFitness, defaultRarity } from "../../config";
import useQueryParams from "../../hooks/useQueryParams";
import {
  calculateFitsAndRarity,
  updateFitsAndRarity,
} from "../../store/reducers/artifacts";
import { getArtifactsResultHash, getConfigHash } from "../../utils/hash";
import Paginator from "../Paginator";
import ArtifactFitnessCard from "./ArtifactFitnessCard";
import ArtifactsFilter from "./ArtifactsFilter";
import BackToHome from "../navigation/BackToHome";
import ArtifactSortSelect from "./ArtifactSortSelect";

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
    showSelected,
    sortKey,
    setFitness,
    setRarity,
    setSet,
    setPos,
    setMinLevel,
    setMaxLevel,
    setShowSelected,
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
    { name: "showSelected", defaultValue: true, isBoolean: true, replace: false },
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
      let filter = true;
      if (set > 0) {
        filter = filter && artifacts[idx].set === set;
      }
      if (pos > 0) {
        filter = filter && artifacts[idx].position === pos;
      }
      return (
        filter &&
        artifacts[idx].level >= minLevel &&
        artifacts[idx].level <= maxLevel
      );
    },
    [artifacts, set, pos, minLevel, maxLevel]
  );
  const selectFn = useCallback(
    (idx) => {
      let selected =
        allFits[idx] &&
        allRarity[idx] &&
        (Math.max(...Object.values(allFits[idx])) >= Number(fitness) ||
          allRarity[idx] >= rarity);
      return showSelected ? selected : !selected;
    },
    [allFits, allRarity, fitness, rarity, showSelected]
  );

  const displayingArtifacts = useMemo(
    () =>
      artifacts && artifacts.length > 0
        ? [...artifacts.map((_, index) => index)]
            .sort(compareFn)
            .filter(filterFn)
            .filter(selectFn)
        : [],
    [artifacts, compareFn, filterFn, selectFn, page, offset]
  );

  const handleDownloadYasLock = useCallback(() => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        JSON.stringify(
          [...artifacts.map((_, index) => index)]
            .filter(filterFn)
            .filter((i) => (showSelected ? selectFn(i) : !selectFn(i)))
            .filter((idx) => !artifacts[idx].locked)
        ),
      ],
      { type: "text/json" }
    );
    element.href = URL.createObjectURL(file);
    element.download = "lock.json";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }, [artifacts, compareFn, filterFn, selectFn, showSelected]);
  const handleDownloadV2YasLock = useCallback(() => {
    const element = document.createElement("a");
    const filteredArtifacts = [...artifacts.map((_, index) => index)].filter(
      filterFn
    );
    const file = new Blob(
      [
        JSON.stringify({
          version: 2,
          flip_indices: [],
          lock_indices: [...filteredArtifacts].filter((a) =>
            showSelected ? selectFn(a) : !selectFn(a)
          ),
          unlock_indices: [...filteredArtifacts].filter((a) =>
            showSelected ? !selectFn(a) : selectFn(a)
          ),
          validation: [...filteredArtifacts].map((idx) => ({
            index: idx,
            locked: artifacts[idx].locked,
          })),
        }),
      ],
      { type: "text/json" }
    );
    element.href = URL.createObjectURL(file);
    element.download = "lock.json";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }, [artifacts, compareFn, filterFn, selectFn, showSelected]);

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
    return <BackToHome title={t("No uploaded artifacts founds")} />;
  } else if (Object.keys(enabledBuilds).length === 0) {
    return <BackToHome title={t("No enabled builds")} />;
  }
  return (
    <div className="flex w-full max-w-screen-lg flex-col items-center justify-center gap-4 px-4 lg:px-0">
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
          setMinLevel(l);
        }}
        maxLevel={maxLevel}
        setMaxLevel={(l) => {
          setPage(0);
          setMaxLevel(l);
        }}
        isDownloadBtnActive={format === "GOOD"}
        handleDownloadYasLock={handleDownloadYasLock}
        handleDownloadV2YasLock={handleDownloadV2YasLock}
      />
      {isLoading ? (
        <Calculating
          t={t}
          progress={progress}
          hasConfigChange={hasConfigChange}
        />
      ) : (
        <div className="flex w-full flex-col items-stretch space-y-4">
          <div className="flex flex-row items-center justify-between">
            {/* Sort by */}
            <div className="flex flex-col items-start gap-1">
              <div className="ml-1 text-xs opacity-70">{t("Sort by")}</div>
              <ArtifactSortSelect
                sortKey={sortKey}
                setSortKey={(s) => {
                  setPage(0);
                  setSortKey(s);
                }}
                showSelected={showSelected}
                setShowSelected={(s) => {
                  setPage(0);
                  setShowSelected(s);
                }}
              />
            </div>
            {/* Showing value range & Paginator */}
            {displayingArtifacts.length > offset && (
              <div className="flex flex-col items-end gap-1">
                <div className="mr-1 text-xs opacity-70">
                  {sortKey.startsWith("rarity")
                    ? t("Showing rarity range") +
                      ": " +
                      allRarity[displayingArtifacts[page * offset]].toFixed(2) +
                      " ~ " +
                      allRarity[
                        displayingArtifacts[
                          Math.min(
                            (page + 1) * offset - 1,
                            displayingArtifacts.length - 1
                          )
                        ]
                      ].toFixed(2)
                    : t("Showing fitness range") +
                      ": " +
                      (
                        Math.max(
                          ...Object.values(
                            allFits[displayingArtifacts[page * offset]]
                          )
                        ) * 100
                      ).toFixed(0) +
                      "% ~ " +
                      (
                        Math.max(
                          ...Object.values(
                            allFits[
                              displayingArtifacts[
                                Math.min(
                                  (page + 1) * offset - 1,
                                  displayingArtifacts.length - 1
                                )
                              ]
                            ]
                          )
                        ) * 100
                      ).toFixed(0) +
                      "%"}
                </div>
                <Paginator
                  page={page}
                  setPage={setPage}
                  offset={offset}
                  setOffset={setOffset}
                  totalPages={displayingArtifacts.length}
                />
              </div>
            )}
          </div>

          {displayingArtifacts
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
                showUnfit={!showSelected}
              />
            ))}

          <div className="flex flex-row items-center justify-between">
            <div className="grow" />
            {displayingArtifacts.length > offset && (
              <Paginator
                page={page}
                setPage={setPage}
                offset={offset}
                setOffset={setOffset}
                totalPages={displayingArtifacts.length}
                scrollToId="main-content"
              />
            )}
          </div>
          <div className="h-2 w-full"></div>
        </div>
      )}
    </div>
  );
};

export default ArtifactsUpload;
