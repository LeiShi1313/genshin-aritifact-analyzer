import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { pairKey } from "../../workers/artifactScoringProtocol";

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
  const lastProspectRequest = useRef("");
  const lastPotentialRequest = useRef("");

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
  const {
    state: scoring,
    requestProspect,
    requestPotential,
  } = useArtifactScoringSession({
    datasetId: artifactsId ?? "unknown-artifact-dataset",
    artifacts,
    builds: buildEntries,
    sourceProfile,
  });

  useEffect(() => {
    setPage(0);
  }, [
    query.match,
    query.prospectEnabled,
    query.prospect,
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
      selectArtifactScoreSummary(scoring.summary.batch, artifactIndex)
    );
  }, [scoring.summary.status, scoring.summary.batch, artifacts.length]);

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

  const toProspectState = useCallback(
    (summary) => {
      if (summary.status !== "ok") return { status: "unavailable" };
      const delta =
        scoring.prospect.results[
          pairKey({
            artifactIndex: summary.artifactIndex,
            buildIndex: summary.bestExpected.buildIndex,
          })
        ];
      if (delta?.status === "ok") {
        return { status: "ready", percentile: delta.result.percentile };
      }
      if (delta) return { status: "unavailable" };
      return scoring.prospect.status === "pending"
        ? { status: "pending" }
        : { status: "idle" };
    },
    [scoring.prospect.results, scoring.prospect.status]
  );

  const fullProspectRequired =
    query.prospectEnabled || query.sort.startsWith("prospect-");
  const allProspectTargets = useMemo(
    () =>
      summaries.flatMap((summary) =>
        summary.status === "ok"
          ? [
              {
                artifactIndex: summary.artifactIndex,
                buildIndex: summary.bestExpected.buildIndex,
              },
            ]
          : []
      ),
    [summaries]
  );
  const fullProspectReady =
    !fullProspectRequired ||
    allProspectTargets.length === 0 ||
    (allProspectTargets.every(
      (target) => scoring.prospect.results[pairKey(target)] !== undefined
    ) &&
      scoring.prospect.status === "ready");
  const prospectSelectionUnavailable =
    fullProspectRequired &&
    (scoring.prospect.status === "error" ||
      scoring.prospect.status === "unavailable");
  const prospectSelectionPending =
    scoring.summary.status === "ready" &&
    fullProspectRequired &&
    !fullProspectReady &&
    !prospectSelectionUnavailable;
  const downloadEvaluationStatus =
    scoring.summary.status === "error" || prospectSelectionUnavailable
      ? "unavailable"
      : scoring.summary.status !== "ready"
      ? "pending-summary"
      : !summaries.some((summary) => summary.status === "ok")
      ? "unavailable"
      : prospectSelectionPending
      ? "pending-prospect"
      : "ready";
  const exportReady = isArtifactExportReady(format, downloadEvaluationStatus);

  const selectionDecision = useCallback(
    (summary) =>
      scoreSelectionDecision(
        summary,
        fullProspectReady ? query : { ...query, prospectEnabled: false },
        toProspectState(summary)
      ),
    [query, fullProspectReady, toProspectState]
  );

  const displayingSummaries = useMemo(() => {
    const filtered = summaries.filter(physicalFilter).filter((summary) => {
      const selected = selectionDecision(summary) === "selected";
      return query.showSelected ? selected : !selected;
    });
    const effectiveSort =
      query.sort.startsWith("prospect-") && !fullProspectReady
        ? "expectedFinalMatch-desc"
        : query.sort;
    return filtered.sort((left, right) =>
      compareArtifactScores(
        left,
        right,
        toProspectState(left),
        toProspectState(right),
        effectiveSort
      )
    );
  }, [
    summaries,
    physicalFilter,
    selectionDecision,
    query.showSelected,
    query.sort,
    fullProspectReady,
    toProspectState,
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
  const visibleTargets = useMemo(
    () =>
      currentPage.flatMap((summary) =>
        summary.status === "ok"
          ? [
              {
                artifactIndex: summary.artifactIndex,
                buildIndex: summary.bestExpected.buildIndex,
              },
            ]
          : []
      ),
    [currentPage]
  );
  const requestedProspectTargets = fullProspectRequired
    ? allProspectTargets
    : visibleTargets;

  useEffect(() => {
    if (scoring.summary.status !== "ready") return;
    if (
      scoring.prospect.status === "error" ||
      scoring.prospect.status === "unavailable"
    ) {
      return;
    }
    const signature = `${
      scoring.summary.summaryKey
    }:${fourLineStartProbability}:${requestedProspectTargets
      .map(pairKey)
      .join(",")}`;
    if (
      scoring.prospect.status === "pending" &&
      lastProspectRequest.current === signature
    ) {
      return;
    }
    const missing = requestedProspectTargets.filter(
      (target) => scoring.prospect.results[pairKey(target)] === undefined
    );
    if (missing.length === 0) return;
    if (lastProspectRequest.current === signature) return;
    lastProspectRequest.current = signature;
    requestProspect(missing);
  }, [
    scoring.summary.status,
    scoring.summary.summaryKey,
    scoring.prospect.results,
    scoring.prospect.status,
    requestedProspectTargets,
    fourLineStartProbability,
    requestProspect,
  ]);

  useEffect(() => {
    if (scoring.summary.status !== "ready") return;
    if (
      scoring.potential.status === "error" ||
      scoring.potential.status === "unavailable"
    ) {
      return;
    }
    const signature = `${
      scoring.summary.summaryKey
    }:${fourLineStartProbability}:${visibleTargets.map(pairKey).join(",")}`;
    if (
      scoring.potential.status === "pending" &&
      lastPotentialRequest.current === signature
    ) {
      return;
    }
    const missing = visibleTargets.filter((target) => {
      const result = scoring.potential.results[pairKey(target)];
      return (
        result === undefined ||
        (result.status === "ok" &&
          result.finishChance.kind !== "conservative-top-ten")
      );
    });
    if (missing.length === 0) return;
    if (lastPotentialRequest.current === signature) return;
    lastPotentialRequest.current = signature;
    requestPotential(missing);
  }, [
    scoring.summary.status,
    scoring.summary.summaryKey,
    scoring.potential.results,
    scoring.potential.status,
    visibleTargets,
    fourLineStartProbability,
    requestPotential,
  ]);

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
        match={query.match}
        setMatch={(match) => setQueryAndReset({ match })}
        prospectEnabled={query.prospectEnabled}
        setProspectEnabled={(prospectEnabled) =>
          setQueryAndReset({ prospectEnabled })
        }
        prospect={query.prospect}
        setProspect={(prospect) => setQueryAndReset({ prospect })}
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
          label={t("Calculating Build Match")}
          phase={scoring.summary}
        />
      ) : scoring.summary.status === "error" ? (
        <div className="alert alert-error" role="alert">
          {t("Artifact scoring failed")}
        </div>
      ) : (
        <div className="flex w-full flex-col items-stretch gap-3">
          {prospectSelectionPending && (
            <div className="alert alert-info" aria-live="polite">
              <span>{t("Calculating Prospect Rarity for all artifacts")}</span>
              <progress
                className="progress progress-secondary w-40"
                value={progressValue(scoring.prospect)}
                max="1"
                aria-label={t("Calculating Prospect Rarity for all artifacts")}
              />
            </div>
          )}
          {prospectSelectionUnavailable && (
            <div className="alert alert-warning" role="alert">
              <span>
                {t(
                  "Prospect Rarity unavailable; score filtering and lock export are disabled"
                )}
              </span>
            </div>
          )}
          {query.showSelected && unscoredArtifactCount > 0 && (
            <div className="alert alert-warning" role="status">
              <span>
                {t("Unscored artifacts are shown under Unselected")} (
                {unscoredArtifactCount})
              </span>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setQueryAndReset({ showSelected: false })}
              >
                {t("artifacts:show_unselected")}
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="mb-1 text-xs opacity-70">{t("Sort by")}</div>
              <ArtifactSortSelect
                sortKey={query.sort}
                setSortKey={(sort) => setQueryAndReset({ sort })}
                showSelected={query.showSelected}
                setShowSelected={(showSelected) =>
                  setQueryAndReset({ showSelected })
                }
              />
            </div>
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

          {currentPage.map((summary) => {
            const target =
              summary.status === "ok"
                ? {
                    artifactIndex: summary.artifactIndex,
                    buildIndex: summary.bestExpected.buildIndex,
                  }
                : undefined;
            const prospectDelta = target
              ? scoring.prospect.results[pairKey(target)] ?? {
                  status:
                    scoring.prospect.status === "pending"
                      ? "pending"
                      : "unavailable",
                }
              : { status: "unavailable" };
            const potentialDelta = target
              ? scoring.potential.results[pairKey(target)] ?? {
                  status:
                    scoring.potential.status === "pending"
                      ? "pending"
                      : "unavailable",
                }
              : { status: "unavailable" };
            return (
              <ArtifactScoreCard
                key={summary.artifactIndex}
                artifact={artifacts[summary.artifactIndex]}
                builds={enabledBuilds}
                summary={summary}
                prospect={prospectDelta}
                potential={potentialDelta}
                minMatch={query.match}
                showUnselected={!query.showSelected}
              />
            );
          })}

          {displayingSummaries.length === 0 && !prospectSelectionPending && (
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
