import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";

import {
  encodeBuild,
  getBuildSets,
  getBuildShortName,
} from "../../utils/build";
import ArtifactCard from "./ArtifactCard";
import CharacterCard from "../characters/CharacterCard";

const TONE_CLASSES = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent",
};

const Metric = ({ label, value, buildName, tone = "primary", badge }) => (
  <div className={`rounded-lg px-3 py-2 ${TONE_CLASSES[tone]}`}>
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-semibold">{label}</span>
      {badge}
    </div>
    <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
    {buildName && (
      <div className="truncate text-xs opacity-80">{buildName}</div>
    )}
  </div>
);

const ArtifactScoreCard = ({
  artifact,
  builds,
  summary,
  prospect,
  potential,
  minMatch,
  showUnselected = false,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const presets = useSelector((state) => state.presets.builds);
  const [showAll, setShowAll] = useState(false);
  const [hoveredBuild, setHoveredBuild] = useState(null);
  const percent = useMemo(
    () =>
      new Intl.NumberFormat(i18n.resolvedLanguage || i18n.language, {
        style: "percent",
        maximumFractionDigits: 1,
      }),
    [i18n.language, i18n.resolvedLanguage]
  );

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
      <article className="bg-base-200 mt-4 flex w-full flex-col gap-3 rounded-xl p-3 lg:flex-row">
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

  const bestCurrentBuild = builds[summary.bestCurrent.buildId];
  const bestExpectedBuild = builds[summary.bestExpected.buildId];
  const sortedBuilds = [...summary.perBuild].sort((a, b) => b.match - a.match);
  const matchedBuilds = sortedBuilds.filter(
    (score) => score.match >= Number(minMatch)
  );
  const candidateBuilds =
    matchedBuilds.length > 0
      ? matchedBuilds
      : showUnselected
      ? sortedBuilds
      : [];
  const displayedBuilds = candidateBuilds.slice(0, showAll ? undefined : 8);
  const hovered = hoveredBuild ? builds[hoveredBuild] : undefined;
  const fitAttributes =
    hovered?.subAttributes.map((attribute) => attribute.type) ?? [];
  const suitIsFit = hovered
    ? getBuildSets(hovered).some((set) => set === artifact.set)
    : false;
  const prospectReady = prospect?.status === "ok";
  const potentialReady = potential?.status === "ok";
  const topTenFinish =
    potentialReady && potential.finishChance.kind === "conservative-top-ten"
      ? potential.finishChance.result
      : undefined;
  const absoluteFinish =
    potentialReady && potential.finishChance.kind === "absolute-match"
      ? potential.finishChance
      : undefined;

  return (
    <article className="bg-base-200 mt-4 flex w-full min-w-0 flex-col items-stretch gap-3 rounded-xl p-3 lg:flex-row lg:items-start">
      <ArtifactCard
        artifact={artifact}
        fitAttributes={fitAttributes}
        suitIsFit={suitIsFit}
      />

      <div className="min-w-0 grow space-y-3">
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
          <div className="col-span-2 xl:col-span-1">
            <Metric
              label={t("Expected +20 Match")}
              value={percent.format(summary.bestExpected.expectedFinalMatch)}
              buildName={getBuildShortName(bestExpectedBuild, t)}
              tone="accent"
            />
          </div>
          <Metric
            label={t("Build Match")}
            value={percent.format(summary.bestCurrent.match)}
            buildName={getBuildShortName(bestCurrentBuild, t)}
          />
          <Metric
            label={t("Prospect Rarity")}
            value={
              prospectReady
                ? percent.format(prospect.result.percentile)
                : prospect?.status === "pending"
                ? t("Calculating")
                : t("Unavailable")
            }
            buildName={getBuildShortName(bestExpectedBuild, t)}
            tone="secondary"
            badge={
              prospectReady && prospect.result.percentile >= 0.9 ? (
                <span className="badge badge-secondary badge-sm text-secondary-content">
                  {t("Top 10%")}
                </span>
              ) : null
            }
          />
        </div>

        <div className="bg-base-100/70 rounded-lg p-2">
          <div className="flex items-center justify-between gap-2 px-1 text-xs">
            <span>
              {matchedBuilds.length > 0
                ? t("Matching builds", { count: matchedBuilds.length })
                : t("Matching builds", { count: 0 })}
            </span>
            {candidateBuilds.length > 8 && (
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                aria-expanded={showAll}
                onClick={() => setShowAll((value) => !value)}
              >
                {showAll ? t("Show less") : t("Show all")}
              </button>
            )}
          </div>
          <div className="mt-2 flex max-w-full gap-2 overflow-x-auto pb-1">
            {displayedBuilds.map((score) => (
              <button
                type="button"
                key={score.buildId}
                className={classNames(
                  "focus-visible:outline-primary shrink-0 rounded focus-visible:outline focus-visible:outline-2",
                  score.buildId === summary.bestCurrent.buildId &&
                    "ring-primary ring-2"
                )}
                aria-label={`${getBuildShortName(
                  builds[score.buildId],
                  t
                )} ${percent.format(score.match)}`}
                onClick={() => handleBuildClick(score.buildId)}
                onFocus={() => setHoveredBuild(score.buildId)}
                onBlur={() => setHoveredBuild(null)}
                onMouseEnter={() => setHoveredBuild(score.buildId)}
                onMouseLeave={() => setHoveredBuild(null)}
              >
                <CharacterCard
                  character={builds[score.buildId].character}
                  text={percent.format(score.match)}
                  width={14}
                  isBestFit={score.buildId === summary.bestCurrent.buildId}
                  saturate={score.match < Number(minMatch)}
                />
              </button>
            ))}
          </div>
        </div>

        <details className="collapse-arrow collapse bg-base-100/70 rounded-lg">
          <summary className="collapse-title min-h-0 py-3 font-semibold">
            {t("Upgrade forecast")}
          </summary>
          <div className="collapse-content">
            {potentialReady ? (
              <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                <div>
                  <div className="opacity-70">{t("P10")}</div>
                  <strong>
                    {percent.format(potential.result.p10FinalMatch)}
                  </strong>
                </div>
                <div>
                  <div className="opacity-70">{t("Median")}</div>
                  <strong>
                    {percent.format(potential.result.medianFinalMatch)}
                  </strong>
                </div>
                <div>
                  <div className="opacity-70">{t("P90")}</div>
                  <strong>
                    {percent.format(potential.result.p90FinalMatch)}
                  </strong>
                </div>
                <div>
                  <div className="opacity-70">{t("Best reachable")}</div>
                  <strong>
                    {percent.format(potential.result.bestReachableFinalMatch)}
                  </strong>
                </div>
                <div className="bg-secondary/10 col-span-2 rounded p-2 md:col-span-4">
                  {topTenFinish?.status === "available" ? (
                    <>
                      <div>{t("Chance to finish in the top 10%")}</div>
                      <strong>
                        {percent.format(topTenFinish.probability)}
                      </strong>
                      <span className="ml-2 text-xs opacity-70">
                        {t("Top 10% finished Match cutoff", {
                          value: percent.format(topTenFinish.targetFinalMatch),
                        })}
                      </span>
                    </>
                  ) : topTenFinish?.status === "unavailable" ? (
                    <span>{t("No tie-preserving top 10% cutoff exists")}</span>
                  ) : null}
                </div>
                {absoluteFinish && (
                  <div className="bg-accent/10 col-span-2 rounded p-2 md:col-span-4">
                    {t("Chance to reach Match target", {
                      target: percent.format(absoluteFinish.targetFinalMatch),
                      chance: percent.format(absoluteFinish.probability),
                    })}
                  </div>
                )}
              </div>
            ) : potential?.status === "pending" ? (
              <span
                className="loading loading-dots loading-sm"
                aria-label={t("Calculating")}
              />
            ) : (
              <p className="text-sm opacity-70">
                {t("Detailed upgrade forecast unavailable")}
              </p>
            )}
          </div>
        </details>
      </div>
    </article>
  );
};

export default ArtifactScoreCard;
