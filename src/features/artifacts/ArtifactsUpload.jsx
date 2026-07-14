import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactLoading from "react-loading";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import Paginator from "../Paginator";
import BackToHome from "../navigation/BackToHome";
import ArtifactScoreCard from "./ArtifactScoreCard";
import ArtifactSortSelect from "./ArtifactSortSelect";
import ArtifactsFilter from "./ArtifactsFilter";
import { useArtifactScoringQuery } from "./useArtifactScoringQuery";
import { useArtifactScoringSession } from "./useArtifactScoringSession";
import {
  compareArtifactScores,
  isArtifactExportReady,
  scoreSelectionDecision,
  selectArtifactScoreSummary,
} from "./scoringViewModel";

const progressValue = (phase) =>
  phase.progress.total > 0
    ? phase.progress.completed / phase.progress.total
    : undefined;

const Calculating = ({ label, phase }) => (
  <div
    className="mt-10 flex flex-col items-center gap-4"
    role="status"
    aria-live="polite"
  >
    <div className="flex items-center gap-3">
      <ReactLoading
        type="bars"
        className="fill-primary"
        style={{ height: 32, width: 32 }}
      />
      <span className="text-lg">{label}</span>
    </div>
    <progress
      className="progress progress-primary w-64"
      value={progressValue(phase)}
      max="1"
      aria-label={label}
    />
  </div>
);

const downloadJson = (value) => {
  const element = document.createElement("a");
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value)], { type: "application/json" })
  );
  element.href = url;
  element.download = "lock.json";
  document.body.appendChild(element);
  element.click();
  element.remove();
  URL.revokeObjectURL(url);
};

const ArtifactsUpload = () => {
  const { t } = useTranslation();
  const { artifactsId } = useParams();
  const upload = useSelector((state) => state.uploads.artifacts[artifactsId]);
  const artifacts = upload?.items ?? [];
  const format = upload?.format;
  const { builds, config } = useSelector((state) => state.build);
  const presetBuilds = useSelector((state) => state.presets.builds);
  const fourLineStartProbability = useSelector(
    (state) => state.configs.fourLineStartProbability ?? 0.2
  );
  const [query, updateQuery] = useArtifactScoringQuery();
  const [page, setPage] = useState(0);
  const [offset, setOffset] = useState(20);

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
  const sourceProfile = useMemo(
    () => ({ kind: "normal-five-star", fourLineStartProbability }),
    [fourLineStartProbability]
  );
  const { state: scoring } = useArtifactScoringSession({
    datasetId: artifactsId ?? "unknown-artifact-dataset",
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

  useEffect(() => {
    setPage(0);
  }, [
    query.minPotential,
    query.minScore,
    query.sort,
    query.set,
    query.position,
    query.minLevel,
    query.maxLevel,
    query.showSelected,
  ]);

  const summaries = useMemo(() => {
    if (scoring.summary.status !== "ready" || !scoring.summary.batch) return [];
    return Array.from({ length: artifacts.length }, (_, artifactIndex) =>
      selectArtifactScoreSummary(scoring.summary.batch, artifactIndex, {
        position: artifacts[artifactIndex].position,
        setEligibility: setEligibilityView,
      })
    );
  }, [
    scoring.summary.status,
    scoring.summary.batch,
    artifacts,
    setEligibilityView,
  ]);

  const physicalFilter = useCallback(
    (summary) => {
      const artifact = artifacts[summary.artifactIndex];
      return (
        (!query.set || artifact.set === query.set) &&
        (!query.position || artifact.position === query.position) &&
        artifact.level >= query.minLevel &&
        artifact.level <= query.maxLevel
      );
    },
    [artifacts, query.set, query.position, query.minLevel, query.maxLevel]
  );

  const downloadEvaluationStatus =
    scoring.summary.status === "error"
      ? "unavailable"
      : scoring.summary.status !== "ready"
      ? "pending-summary"
      : scoring.setEligibility.status === "error" ||
        scoring.setEligibility.status === "unavailable"
      ? "unavailable"
      : scoring.setEligibility.status !== "ready"
      ? "pending-set-eligibility"
      : !summaries.some((summary) => summary.status === "ok")
      ? "unavailable"
      : "ready";
  const exportReady = isArtifactExportReady(format, downloadEvaluationStatus);
  const setEligibilityIsPending =
    scoring.summary.status === "ready" &&
    (scoring.setEligibility.status === "idle" ||
      scoring.setEligibility.status === "pending");

  const selectionDecision = useCallback(
    (summary) =>
      scoreSelectionDecision(
        summary,
        artifacts[summary.artifactIndex].level,
        query
      ),
    [artifacts, query]
  );

  const displayingSummaries = useMemo(() => {
    const filtered = summaries.filter(physicalFilter).filter((summary) => {
      const selected = selectionDecision(summary) === "selected";
      return query.showSelected ? selected : !selected;
    });
    return filtered.sort((left, right) =>
      compareArtifactScores(
        left,
        right,
        artifacts[left.artifactIndex].level,
        artifacts[right.artifactIndex].level,
        query.sort,
        query
      )
    );
  }, [
    summaries,
    physicalFilter,
    selectionDecision,
    query.showSelected,
    query.sort,
    artifacts,
  ]);

  const currentPage = useMemo(
    () => displayingSummaries.slice(page * offset, (page + 1) * offset),
    [displayingSummaries, page, offset]
  );
  useEffect(() => {
    const lastPage = Math.max(
      0,
      Math.ceil(displayingSummaries.length / offset) - 1
    );
    setPage((current) => Math.min(current, lastPage));
  }, [displayingSummaries.length, offset]);
  const selectedArtifactIndices = useMemo(
    () =>
      summaries
        .filter(physicalFilter)
        .filter((summary) => selectionDecision(summary) === "selected")
        .map((summary) => summary.artifactIndex),
    [summaries, physicalFilter, selectionDecision]
  );
  const selectedIndexSet = useMemo(
    () => new Set(selectedArtifactIndices),
    [selectedArtifactIndices]
  );
  const scoredArtifactIndices = useMemo(
    () =>
      summaries
        .filter(physicalFilter)
        .filter((summary) => summary.status === "ok")
        .map((summary) => summary.artifactIndex),
    [summaries, physicalFilter]
  );
  const unscoredArtifactCount = useMemo(
    () =>
      summaries
        .filter(physicalFilter)
        .filter((summary) => summary.status !== "ok").length,
    [summaries, physicalFilter]
  );

  const handleDownloadYasLock = useCallback(() => {
    if (!exportReady) return;
    downloadJson(
      selectedArtifactIndices.filter((index) => !artifacts[index].locked)
    );
  }, [artifacts, exportReady, selectedArtifactIndices]);
  const handleDownloadV2YasLock = useCallback(() => {
    if (!exportReady) return;
    downloadJson({
      version: 2,
      flip_indices: [],
      lock_indices: scoredArtifactIndices.filter((index) =>
        selectedIndexSet.has(index)
      ),
      unlock_indices: scoredArtifactIndices.filter(
        (index) => !selectedIndexSet.has(index)
      ),
      validation: scoredArtifactIndices.map((index) => ({
        index,
        locked: artifacts[index].locked,
      })),
    });
  }, [artifacts, exportReady, scoredArtifactIndices, selectedIndexSet]);

  if (!upload || artifacts.length === 0) {
    return <BackToHome title={t("No uploaded artifacts founds")} />;
  }
  if (buildEntries.length === 0) {
    return <BackToHome title={t("No enabled builds")} />;
  }

  const setQueryAndReset = (patch) => {
    setPage(0);
    updateQuery(patch);
  };
  return (
    <div className="flex w-full max-w-screen-lg flex-col items-center gap-4 px-4 lg:px-0">
      <ArtifactsFilter
        minPotential={query.minPotential}
        setMinPotential={(minPotential) => setQueryAndReset({ minPotential })}
        minScore={query.minScore}
        setMinScore={(minScore) => setQueryAndReset({ minScore })}
        set={query.set}
        setSet={(set) => setQueryAndReset({ set: Number(set) })}
        pos={query.position}
        setPos={(position) => setQueryAndReset({ position: Number(position) })}
        minLevel={query.minLevel}
        maxLevel={query.maxLevel}
        setLevelRange={setQueryAndReset}
        isDownloadBtnActive={format === "GOOD"}
        downloadEvaluationStatus={downloadEvaluationStatus}
        handleDownloadYasLock={handleDownloadYasLock}
        handleDownloadV2YasLock={handleDownloadV2YasLock}
      />

      {scoring.summary.status === "pending" ||
      scoring.summary.status === "idle" ? (
        <Calculating
          label={t("Calculating artifact scores")}
          phase={scoring.summary}
        />
      ) : scoring.summary.status === "error" ? (
        <div className="alert alert-error" role="alert">
          {t("Artifact scoring failed")}
        </div>
      ) : setEligibilityIsPending ? (
        <Calculating
          label={t("Calculating set recommendations")}
          phase={scoring.setEligibility}
        />
      ) : (
        <div className="flex w-full flex-col items-stretch gap-3">
          {query.showSelected && unscoredArtifactCount > 0 && (
            <div
              className="bg-base-200 text-base-content flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"
              role="status"
            >
              <span>
                {t("Unscored artifacts are shown under Other artifacts")} (
                {unscoredArtifactCount})
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => setQueryAndReset({ showSelected: false })}
              >
                {t("Other artifacts")}
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <ArtifactSortSelect
              sortKey={query.sort}
              setSortKey={(sort) => setQueryAndReset({ sort })}
              showSelected={query.showSelected}
              setShowSelected={(showSelected) =>
                setQueryAndReset({ showSelected })
              }
            />
            <div className="text-sm opacity-70">
              {t("Showing artifact count", {
                shown: displayingSummaries.length,
                total: artifacts.length,
              })}
            </div>
            {displayingSummaries.length > offset && (
              <Paginator
                page={page}
                setPage={setPage}
                offset={offset}
                setOffset={setOffset}
                totalPages={displayingSummaries.length}
              />
            )}
          </div>

          {currentPage.map((summary) => (
            <ArtifactScoreCard
              key={summary.artifactIndex}
              artifact={artifacts[summary.artifactIndex]}
              builds={enabledBuilds}
              summary={summary}
              minPotential={query.minPotential}
              minScore={query.minScore}
            />
          ))}

          {displayingSummaries.length === 0 && (
            <div className="alert" role="status">
              {t("No artifacts match the score filters")}
            </div>
          )}

          {displayingSummaries.length > offset && (
            <div className="flex justify-end">
              <Paginator
                page={page}
                setPage={setPage}
                offset={offset}
                setOffset={setOffset}
                totalPages={displayingSummaries.length}
                scrollToId="main-content"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtifactsUpload;
