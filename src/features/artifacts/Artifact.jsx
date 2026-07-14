import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ReactLoading from "react-loading";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import { decodeArtifact } from "../../utils/artifact";
import BackToHome from "../navigation/BackToHome";
import ArtifactScoreCard from "./ArtifactScoreCard";
import { PUBLIC_SCORE_DEFAULTS } from "./scorePresentation";
import { selectArtifactScoreSummary } from "./scoringViewModel";
import { useArtifactScoringSession } from "./useArtifactScoringSession";

const Artifact = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { builds, config } = useSelector((state) => state.build);
  const presetBuilds = useSelector((state) => state.presets.builds);
  const fourLineStartProbability = useSelector(
    (state) => state.configs.fourLineStartProbability ?? 0.2
  );

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
  const { state: scoring } = useArtifactScoringSession({
    datasetId: `artifact-detail:${encodedArtifact}`,
    artifacts,
    builds: buildEntries,
    sourceProfile,
  });
  const setEligibilityView = useMemo(
    () =>
      scoring.setEligibility.status === "ready" && scoring.setEligibility.policy
        ? { status: "ready", policy: scoring.setEligibility.policy }
        : scoring.setEligibility.status === "error" ||
          scoring.setEligibility.status === "unavailable"
        ? { status: "unavailable" }
        : { status: "pending" },
    [scoring.setEligibility.status, scoring.setEligibility.policy]
  );
  const summary = useMemo(
    () =>
      scoring.summary.status === "ready" && scoring.summary.batch
        ? selectArtifactScoreSummary(scoring.summary.batch, 0, {
            position: artifact?.position ?? 0,
            setEligibility: setEligibilityView,
          })
        : undefined,
    [
      scoring.summary.status,
      scoring.summary.batch,
      artifact?.position,
      setEligibilityView,
    ]
  );
  if (!artifact?.set) {
    return <BackToHome title={t("No artifact found")} />;
  }
  if (buildEntries.length === 0) {
    return <BackToHome title={t("No enabled builds")} />;
  }

  return (
    <div className="flex h-full w-full flex-col items-center gap-4 px-4">
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
            aria-label={t("Calculating artifact scores")}
          />
        ) : (
          <ArtifactScoreCard
            artifact={artifact}
            builds={enabledBuilds}
            summary={summary}
            minPotential={PUBLIC_SCORE_DEFAULTS.minPotential}
            minScore={PUBLIC_SCORE_DEFAULTS.minScore}
          />
        )}
      </div>
    </div>
  );
};

export default Artifact;
