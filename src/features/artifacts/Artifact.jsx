import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactLoading from "react-loading";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import { decodeArtifact } from "../../utils/artifact";
import { pairKey } from "../../workers/artifactScoringProtocol";
import BackToHome from "../navigation/BackToHome";
import ArtifactScoreCard from "./ArtifactScoreCard";
import { selectArtifactScoreSummary } from "./scoringViewModel";
import { useArtifactScoringSession } from "./useArtifactScoringSession";

const Artifact = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [match, setMatch] = useState(0.55);
  const { builds, config } = useSelector((state) => state.build);
  const presetBuilds = useSelector((state) => state.presets.builds);
  const fourLineStartProbability = useSelector(
    (state) => state.configs.fourLineStartProbability ?? 0.2
  );
  const lastLazyRequest = useRef("");

  const encodedArtifact = searchParams.get("artifact") ?? "";
  const artifact = useMemo(() => {
    try {
      return encodedArtifact ? decodeArtifact(encodedArtifact) : undefined;
    } catch {
      return undefined;
    }
  }, [encodedArtifact]);
  const enabledBuilds = useMemo(() => {
    const result = {};
    Object.entries(builds).forEach(([id, build]) => {
      if (config[id]?.enabled) result[id] = build;
    });
    Object.entries(presetBuilds).forEach(([id, build]) => {
      if (config[id]?.enabled) result[id] = build;
    });
    return result;
  }, [builds, presetBuilds, config]);
  const buildEntries = useMemo(
    () => Object.entries(enabledBuilds).map(([id, build]) => ({ id, build })),
    [enabledBuilds]
  );
  const artifacts = useMemo(() => (artifact ? [artifact] : []), [artifact]);
  const sourceProfile = useMemo(
    () => ({ kind: "normal-five-star", fourLineStartProbability }),
    [fourLineStartProbability]
  );
  const {
    state: scoring,
    requestProspect,
    requestPotential,
  } = useArtifactScoringSession({
    datasetId: `artifact-detail:${encodedArtifact}`,
    artifacts,
    builds: buildEntries,
    sourceProfile,
  });
  const summary = useMemo(
    () =>
      scoring.summary.status === "ready" && scoring.summary.batch
        ? selectArtifactScoreSummary(scoring.summary.batch, 0)
        : undefined,
    [scoring.summary.status, scoring.summary.batch]
  );
  const target =
    summary?.status === "ok"
      ? { artifactIndex: 0, buildIndex: summary.bestExpected.buildIndex }
      : undefined;

  useEffect(() => {
    if (!target || scoring.summary.status !== "ready") return;
    const signature = `${scoring.summary.summaryKey}:${pairKey(
      target
    )}:${fourLineStartProbability}`;
    if (lastLazyRequest.current === signature) return;
    lastLazyRequest.current = signature;
    requestProspect([target]);
    requestPotential([target]);
  }, [
    target?.artifactIndex,
    target?.buildIndex,
    scoring.summary.status,
    scoring.summary.summaryKey,
    fourLineStartProbability,
    requestProspect,
    requestPotential,
  ]);

  if (!artifact?.set) {
    return <BackToHome title={t("No artifact found")} />;
  }
  if (buildEntries.length === 0) {
    return <BackToHome title={t("No enabled builds")} />;
  }

  const prospect = target
    ? scoring.prospect.results[pairKey(target)] ?? {
        status:
          scoring.prospect.status === "pending" ? "pending" : "unavailable",
      }
    : { status: "unavailable" };
  const potential = target
    ? scoring.potential.results[pairKey(target)] ?? {
        status:
          scoring.potential.status === "pending" ? "pending" : "unavailable",
      }
    : { status: "unavailable" };

  return (
    <div className="flex h-full w-full flex-col items-center gap-4 px-4">
      <div className="flex w-full max-w-md items-center gap-3">
        <label
          className="whitespace-nowrap font-bold"
          htmlFor="detail-match-threshold"
        >
          {t("Build Match")}
        </label>
        <input
          id="detail-match-threshold"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={match}
          className="range range-primary"
          aria-valuetext={`${Math.round(match * 100)}%`}
          onChange={(event) => setMatch(Number(event.target.value))}
        />
        <span className="w-12 text-right">{Math.round(match * 100)}%</span>
      </div>
      <div className="flex w-full max-w-screen-lg grow flex-col items-center justify-center">
        {scoring.summary.status === "error" ? (
          <div className="alert alert-error" role="alert">
            {t("Artifact scoring failed")}
          </div>
        ) : !summary ? (
          <ReactLoading
            type="bars"
            className="fill-primary"
            style={{ height: 48, width: 48 }}
            aria-label={t("Calculating Build Match")}
          />
        ) : (
          <ArtifactScoreCard
            artifact={artifact}
            builds={enabledBuilds}
            summary={summary}
            prospect={prospect}
            potential={potential}
            minMatch={match}
          />
        )}
      </div>
    </div>
  );
};

export default Artifact;
