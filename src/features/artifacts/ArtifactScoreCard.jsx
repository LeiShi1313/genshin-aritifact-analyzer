import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";
import { Star, WarningCircle } from "phosphor-react";

import {
  encodeBuild,
  getBuildSets,
  getBuildShortName,
} from "../../utils/build";
import ArtifactCard from "./ArtifactCard";
import CharacterCard from "../characters/CharacterCard";
import {
  getArtifactScoreAction,
  getArtifactScoreBand,
  toPublicArtifactScore,
} from "./scorePresentation";
import { presentArtifactScore } from "./scoringViewModel";

const SCORE_TONE_CLASSES = {
  neutral: "border-l-8 border-base-300 bg-base-100 text-base-content",
  info: "border-l-8 border-info bg-base-100 text-base-content",
  success: "border-l-8 border-success bg-base-100 text-base-content",
  accent: "border-l-8 border-accent bg-base-100 text-base-content",
};

const ACTION_LABELS = {
  "main-stat-mismatch": "Main stat mismatch",
  "low-potential": "Low potential",
  "try-upgrading": "Try upgrading",
  "worth-upgrading": "Worth upgrading",
  "high-priority": "High priority",
  "below-recommendation": "Below recommendation",
  good: "Good",
  "worth-keeping": "Worth keeping",
  exceptional: "Exceptional",
  perfect: "Perfect",
};

const ScoreHero = ({ presentation, level, buildName, onBuildClick }) => {
  const { t } = useTranslation();
  const { primary, secondary } = presentation;
  const band = getArtifactScoreBand(primary.score);
  const action = getArtifactScoreAction({
    level,
    score: primary.score,
    isPreferredMain: primary.isPreferredMain,
  });
  const label = primary.kind === "potential" ? t("Potential") : t("Score");
  const actionLabel = t(ACTION_LABELS[action.id]);

  return (
    <section
      className={classNames(
        "min-w-0 rounded-xl p-4",
        SCORE_TONE_CLASSES[band.tone],
        band.emphasis === "strong" && "shadow-sm",
        band.emphasis === "maximum" &&
          "ring-accent ring-offset-base-200 ring-2 ring-offset-2"
      )}
      data-score-band={band.id}
      aria-label={t("Artifact score summary", {
        label,
        score: primary.score,
        action: actionLabel,
        build: buildName,
      })}
    >
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="shrink-0">
          <div className="text-xs font-bold uppercase tracking-wider opacity-80">
            {label}
          </div>
          <div className="text-5xl font-black tabular-nums leading-none sm:text-6xl">
            {primary.score}
          </div>
        </div>

        <div className="flex min-w-0 flex-col items-end gap-1 text-right">
          <div
            className={classNames(
              "flex max-w-full items-center justify-end gap-1 text-sm font-bold leading-tight",
              action.id === "main-stat-mismatch" &&
                "badge badge-error text-error-content h-auto whitespace-normal py-1"
            )}
          >
            {action.id === "main-stat-mismatch" && (
              <WarningCircle
                aria-hidden="true"
                className="shrink-0"
                size={16}
              />
            )}
            {band.emphasis === "maximum" && (
              <Star
                aria-hidden="true"
                className="shrink-0"
                size={18}
                weight="fill"
              />
            )}
            <span>{actionLabel}</span>
          </div>
          {secondary && (
            <div className="text-xs font-medium opacity-80">
              {t("Current score")} {secondary.score}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className="focus-visible:outline-base-content decoration-current/50 mt-3 max-w-full truncate text-left text-sm font-semibold underline underline-offset-2 hover:decoration-current focus-visible:outline focus-visible:outline-2"
        onClick={onBuildClick}
      >
        {t("Best matching build", { build: buildName })}
      </button>
    </section>
  );
};

const ArtifactScoreCard = ({
  artifact,
  builds,
  summary,
  minPotential,
  minScore,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const presets = useSelector((state) => state.presets.builds);
  const [showAll, setShowAll] = useState(false);
  const [hoveredBuild, setHoveredBuild] = useState(null);

  const handleBuildClick = (id) => {
    const build = builds[id];
    navigate(
      presets[id]
        ? `/build?build=${encodeBuild(presets[id])}`
        : `/build?id=${id}&build=${encodeBuild(build)}`
    );
  };

  if (summary.status !== "ok") {
    return (
      <article className="bg-base-200 flex w-full flex-col gap-3 rounded-xl p-3 lg:flex-row">
        <ArtifactCard artifact={artifact} />
        <div className="alert alert-warning min-w-0 grow" role="status">
          <span>
            {summary.status === "unsupported"
              ? t("Exact scoring supports five-star artifacts only")
              : summary.status === "invalid"
              ? t(
                  "This artifact cannot be scored because its imported stats are invalid"
                )
              : t("No valid enabled builds can score this artifact")}
          </span>
        </div>
      </article>
    );
  }

  const presentation = presentArtifactScore(summary, artifact.level);
  if (!presentation) return null;

  const finished = artifact.level >= 20;
  const minimum = finished ? minScore : minPotential;
  const publicScoreForBuild = (score) =>
    toPublicArtifactScore(finished ? score.match : score.expectedFinalMatch) ??
    0;
  const matchingBuilds = [...summary.perBuild]
    .filter(
      (score) => score.isPreferredMain && publicScoreForBuild(score) >= minimum
    )
    .sort((left, right) => {
      const scoreDelta = publicScoreForBuild(right) - publicScoreForBuild(left);
      return scoreDelta || left.buildIndex - right.buildIndex;
    });
  const displayedBuilds = matchingBuilds.slice(0, showAll ? undefined : 8);
  const activeBuildId = hoveredBuild ?? presentation.primary.buildId;
  const activeBuild = builds[activeBuildId];
  const fitAttributes =
    activeBuild?.subAttributes.map((attribute) => attribute.type) ?? [];
  const suitIsFit = activeBuild
    ? getBuildSets(activeBuild).some((set) => set === artifact.set)
    : false;
  const bestBuild = builds[presentation.primary.buildId];
  const bestBuildName = getBuildShortName(bestBuild, t);

  return (
    <article className="bg-base-200 flex w-full min-w-0 flex-col items-stretch gap-3 rounded-xl p-3 lg:flex-row lg:items-start">
      <ArtifactCard
        artifact={artifact}
        fitAttributes={fitAttributes}
        suitIsFit={suitIsFit}
      />

      <div className="min-w-0 grow space-y-2">
        <ScoreHero
          presentation={presentation}
          level={artifact.level}
          buildName={bestBuildName}
          onBuildClick={() => handleBuildClick(presentation.primary.buildId)}
        />

        {matchingBuilds.length > 1 && (
          <details className="collapse-arrow collapse bg-base-100 rounded-lg">
            <summary className="collapse-title min-h-0 py-2 text-sm font-semibold">
              {t("Matching builds", { count: matchingBuilds.length })}
            </summary>
            <div className="collapse-content">
              <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                {displayedBuilds.map((score) => {
                  const publicScore = publicScoreForBuild(score);
                  const buildName = getBuildShortName(builds[score.buildId], t);
                  return (
                    <button
                      type="button"
                      key={score.buildId}
                      className={classNames(
                        "focus-visible:outline-primary shrink-0 rounded focus-visible:outline focus-visible:outline-2",
                        score.buildId === presentation.primary.buildId &&
                          "ring-primary ring-2"
                      )}
                      aria-label={t("Matching build score", {
                        build: buildName,
                        label: finished ? t("Score") : t("Potential"),
                        score: publicScore,
                      })}
                      onClick={() => handleBuildClick(score.buildId)}
                      onFocus={() => setHoveredBuild(score.buildId)}
                      onBlur={() => setHoveredBuild(null)}
                      onMouseEnter={() => setHoveredBuild(score.buildId)}
                      onMouseLeave={() => setHoveredBuild(null)}
                    >
                      <CharacterCard
                        character={builds[score.buildId].character}
                        text={String(publicScore)}
                        width={14}
                        isBestFit={
                          score.buildId === presentation.primary.buildId
                        }
                      />
                    </button>
                  );
                })}
              </div>
              {matchingBuilds.length > 8 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs mt-2"
                  aria-expanded={showAll}
                  onClick={() => setShowAll((value) => !value)}
                >
                  {showAll ? t("Show less") : t("Show all")}
                </button>
              )}
            </div>
          </details>
        )}
      </div>
    </article>
  );
};

export default ArtifactScoreCard;
