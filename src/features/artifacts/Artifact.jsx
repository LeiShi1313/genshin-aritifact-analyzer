import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactLoading from "react-loading";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import { defaultFitness, defaultRarity } from "../../config";
import ArtifactFitnessCard from "./ArtifactFitnessCard";
import { getAllFitsAndAllRarity } from "../../utils/fitsAndRarity";
import { getConfigHash } from "../../utils/hash";
import { decodeArtifact } from "../../utils/artifact";
import BackToHome from "../navigation/BackToHome";

const Artifact = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [fitness, setFitness] = useState(defaultFitness);

  const artifact = useMemo(
    () => decodeArtifact(searchParams.get("artifact")),
    [searchParams]
  );

  if (!artifact.set) {
    return <BackToHome title={t("No artifact found")} />;
  }

  const [allFits, setAllFits] = useState({});
  const [allRarity, setAllRarity] = useState({});
  const [configHash, setConfigHash] = useState(null);
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

  const isLoading = useMemo(
    () =>
      Object.keys(allFits).length === 0 ||
      Object.keys(allRarity).length === 0 ||
      configHash !== getConfigHash(customConfigs),
    [allFits, allRarity, configHash, customConfigs]
  );

  const calculator = useMemo(
    () =>
      new Worker(new URL("../../workers/calculator.ts", import.meta.url), {
        type: "module",
      }),
    []
  );

  useEffect(() => {
    if (window.Worker) {
      calculator.postMessage({
        artifacts: [artifact],
        builds: enabledBuilds,
        config: customConfigs,
      });
      calculator.onmessage = (e) => {
        if (isNaN(Number(e.data))) {
          console.log(e.data);
          setAllFits(e.data.allFits);
          setAllRarity(e.data.allRarity);
          setConfigHash(e.data.configHash);
        }
      };
    } else {
      setTimeout(() => {
        const result = getAllFitsAndAllRarity(
          [artifact],
          enabledBuilds,
          undefined,
          customConfigs
        );
        setAllFits(result.allFits);
        setAllRarity(result.allRarity);
        setConfigHash(result.configHash);
      }, 0);
    }
  }, [enabledBuilds, artifact]);

  return (
    <div className="sapce-y-4 flex h-full w-full flex-col items-center justify-center">
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
      </div>
      <div className="flex h-full w-full grow flex-col items-center justify-center">
        {isLoading ? (
          <ReactLoading
            type="bars"
            className="fill-primary"
            style={{ height: 48, width: 48 }}
          />
        ) : (
          <ArtifactFitnessCard
            artifact={artifact}
            builds={enabledBuilds}
            fits={allFits[0]}
            rarity={allRarity[0]}
            minFitness={fitness}
            minRarity={0}
          />
        )}
        <div className="h-2 w-full"></div>
      </div>
    </div>
  );
};

export default Artifact;
