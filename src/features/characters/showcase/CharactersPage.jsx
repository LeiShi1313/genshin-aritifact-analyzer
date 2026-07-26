import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  Diamond,
  MagnifyingGlass,
  SlidersHorizontal,
  UploadSimple,
} from "phosphor-react";
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Character } from "../../../genshin/character";
import { Set } from "../../../genshin/set";
import { Weapon } from "../../../genshin/weapon";
import { getBuildName } from "../../../utils/build";
import { characterMetadata } from "../../../utils/character";
import { getArtifactScoreBand } from "../../artifacts/scorePresentation";
import {
  buildArtifactShowcase,
  getCharacterBuildOptions,
  getEquippedArtifacts,
  getLatestCharacterSource,
  selectCharacterBuildOption,
  sortCharacterRosterByAverageScore,
} from "./characterShowcaseModel";
import { getCharacterGachaUrl, getCharacterIconUrl } from "./showcaseAssets";
import { translateGameLabel } from "./showcaseI18n";
import "./showcase-page.css";
import "./showcase-element-themes.css";

const validDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const sourceLabel = (source, id, t, dateFormatter) => {
  const name =
    source.name ||
    t("roster.importFallback", {
      ns: "showcase",
      id: id.slice(0, 6),
    });
  const date = validDate(source.date);
  return date ? `${name} · ${dateFormatter.format(date)}` : name;
};

const artifactSetSummary = (artifacts, t) => {
  const counts = new Map();
  artifacts.filter(Boolean).forEach((artifact) => {
    counts.set(artifact.set, (counts.get(artifact.set) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 2)
    .map(([set, count]) => ({
      id: set,
      count,
      name: translateGameLabel(t, "sets", Set[set]?.toLowerCase()),
    }));
};

const CharacterRosterCard = ({
  info,
  source,
  sourceId,
  activeBuild,
  averageScore,
}) => {
  const { t } = useTranslation([
    "common",
    "showcase",
    "characters",
    "sets",
    "weapons",
  ]);
  const navigate = useNavigate();
  const characterKey = Character[info.character];
  const name = translateGameLabel(t, "characters", characterKey.toLowerCase());
  const metadata = characterMetadata[characterKey] ?? {};
  const theme = metadata.element?.toLowerCase() || "neutral";
  const artifacts = getEquippedArtifacts(source, info.character);
  const presentArtifacts = artifacts.filter(Boolean);
  const scoreBand =
    averageScore === undefined
      ? "unscored"
      : getArtifactScoreBand(averageScore).id;
  const weapon = source.weapons?.find(
    (item) => item.location === info.character
  );
  const sets = artifactSetSummary(artifacts, t);
  const missing = 5 - presentArtifacts.length;
  const route = `/characters/${sourceId}/${characterKey.toLowerCase()}`;
  const query = activeBuild
    ? `?build=${encodeURIComponent(activeBuild.id)}`
    : "";

  return (
    <button
      type="button"
      className={`character-roster-card character-roster-card--${theme}`}
      onClick={() => navigate(`${route}${query}`)}
    >
      <img
        className="character-roster-card__art"
        src={getCharacterGachaUrl(info.character)}
        alt=""
      />
      <span className="character-roster-card__wash" aria-hidden="true" />
      <span className="character-roster-card__element" aria-hidden="true">
        {metadata.element?.slice(0, 1)}
      </span>

      <span className="character-roster-card__topline">
        <span>{t("card.level", { ns: "showcase", level: info.level })}</span>
        <strong className={info.constellation >= 6 ? "is-elite" : ""}>
          {t("constellation", {
            ns: "common",
            count: info.constellation,
          })}
        </strong>
      </span>

      <span className="character-roster-card__body">
        <span className="character-roster-card__identity">
          <img src={getCharacterIconUrl(info.character)} alt="" />
          <span>
            <strong>{name}</strong>
            <small>
              {activeBuild
                ? getBuildName(activeBuild.build.name, t)
                : t("roster.chooseProfile", { ns: "showcase" })}
            </small>
          </span>
        </span>

        <span className="character-roster-card__loadout">
          <span>
            {weapon
              ? translateGameLabel(
                  t,
                  "weapons",
                  Weapon[weapon.weapon]?.toLowerCase()
                )
              : t("roster.noWeapon", { ns: "showcase" })}
          </span>
          <span>
            {sets.length
              ? sets.map((set) => `${set.count}× ${set.name}`).join(" · ")
              : t("roster.noArtifacts", { ns: "showcase" })}
          </span>
        </span>

        <span className="character-roster-card__footer">
          <span className={`character-roster-score is-${scoreBand}`}>
            <Diamond weight="fill" aria-hidden="true" />
            <strong>{averageScore ?? "—"}</strong>
            <small>{t("roster.averageShort", { ns: "showcase" })}</small>
          </span>
          <span className={missing ? "needs-attention" : "is-complete"}>
            {missing
              ? t("roster.missingArtifacts", {
                  ns: "showcase",
                  count: missing,
                })
              : activeBuild
              ? t("roster.buildReady", { ns: "showcase" })
              : t("roster.profileNeeded", { ns: "showcase" })}
          </span>
          <ArrowRight weight="bold" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
};

export default function CharactersPage() {
  const navigate = useNavigate();
  const { artifactsId } = useParams();
  const { t, i18n } = useTranslation(["common", "showcase", "characters"]);
  const locale = i18n.resolvedLanguage ?? i18n.language ?? "en";
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale]
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const uploads = useSelector((state) => state.uploads.artifacts);
  const customBuilds = useSelector((state) => state.build.builds);
  const buildConfig = useSelector((state) => state.build.config);
  const presetBuilds = useSelector((state) => state.presets.builds);
  const [search, setSearch] = useState("");
  const latest = getLatestCharacterSource(uploads);

  const source = artifactsId ? uploads[artifactsId] : undefined;
  const completeSources = Object.entries(uploads)
    .filter(([, upload]) => (upload.characters?.length ?? 0) > 0)
    .sort(
      (left, right) =>
        (validDate(right[1].date)?.getTime() ?? 0) -
        (validDate(left[1].date)?.getTime() ?? 0)
    );
  const filter = searchParams.get("filter") || "all";

  const roster = useMemo(() => {
    if (!source?.characters) return [];
    const query = search.trim().toLocaleLowerCase(locale);

    const matchingCharacters = source.characters
      .map((info) => {
        const characterKey = Character[info.character];
        const name = characterKey
          ? translateGameLabel(
              t,
              "characters",
              characterKey.toLowerCase()
            ).toLocaleLowerCase(locale)
          : "";
        const artifacts = getEquippedArtifacts(source, info.character);
        const missing = artifacts.filter((artifact) => !artifact).length;
        const activeBuild = selectCharacterBuildOption(
          getCharacterBuildOptions({
            character: info.character,
            customBuilds,
            presetBuilds,
            config: buildConfig,
          })
        );
        const scores = artifacts
          .filter(Boolean)
          .map((artifact) => buildArtifactShowcase(artifact, activeBuild))
          .filter((result) => result.status === "ok")
          .map((result) => result.score);
        const average = scores.length
          ? Math.round(
              scores.reduce((total, score) => total + score, 0) / scores.length
            )
          : undefined;
        const attention = missing > 0 || !activeBuild || (average ?? 0) < 80;
        return { info, name, attention, averageScore: average, activeBuild };
      })
      .filter(({ name, attention }) => {
        const matchesSearch = !query || name.includes(query);
        const matchesFilter =
          filter === "all" ||
          (filter === "attention" && attention) ||
          (filter === "complete" && !attention);
        return matchesSearch && matchesFilter;
      });

    return sortCharacterRosterByAverageScore(matchingCharacters);
  }, [
    source,
    search,
    filter,
    customBuilds,
    presetBuilds,
    buildConfig,
    locale,
    t,
  ]);

  if (!artifactsId && latest) {
    return <Navigate to={`/characters/${latest.id}`} replace />;
  }

  if (!source?.characters?.length) {
    return (
      <main className="characters-empty-state">
        <span className="characters-empty-state__icon">
          <UploadSimple weight="duotone" aria-hidden="true" />
        </span>
        <p>{t("archive.character", { ns: "showcase" })}</p>
        <h1>{t("roster.emptyTitle", { ns: "showcase" })}</h1>
        <span>{t("roster.emptyDescription", { ns: "showcase" })}</span>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          {t("roster.importAccount", { ns: "showcase" })}
        </button>
        {completeSources.length > 0 && (
          <button
            className="btn btn-ghost"
            onClick={() => navigate(`/characters/${completeSources[0][0]}`)}
          >
            {t("roster.openLatest", { ns: "showcase" })}
          </button>
        )}
      </main>
    );
  }

  return (
    <main className="characters-page">
      <header className="characters-page__header">
        <div>
          <span>
            {t("archive.account", {
              ns: "showcase",
              format: source.format || t("archive.import", { ns: "showcase" }),
            })}
          </span>
          <h1>{t("roster.title", { ns: "showcase" })}</h1>
          <p>{t("roster.description", { ns: "showcase" })}</p>
        </div>
        <div className="characters-page__header-actions">
          <label>
            <span>{t("roster.accountSnapshot", { ns: "showcase" })}</span>
            <select
              value={artifactsId}
              onChange={(event) =>
                navigate(`/characters/${event.target.value}`)
              }
            >
              {completeSources.map(([id, upload]) => (
                <option value={id} key={id}>
                  {sourceLabel(upload, id, t, dateFormatter)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="characters-page__secondary-action"
            onClick={() => navigate("/")}
          >
            <UploadSimple weight="bold" />
            {t("roster.importNew", { ns: "showcase" })}
          </button>
        </div>
      </header>

      <section
        className="characters-page__controls"
        aria-label={t("roster.filtersLabel", { ns: "showcase" })}
      >
        <label className="characters-search">
          <MagnifyingGlass aria-hidden="true" />
          <span className="sr-only">
            {t("roster.search", { ns: "showcase" })}
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("roster.search", { ns: "showcase" })}
          />
        </label>
        <div className="characters-filters">
          <SlidersHorizontal aria-hidden="true" />
          {[
            ["all", t("All", { ns: "common" })],
            ["attention", t("roster.needsAttention", { ns: "showcase" })],
            ["complete", t("roster.buildReady", { ns: "showcase" })],
          ].map(([value, label]) => (
            <button
              type="button"
              className={filter === value ? "is-active" : ""}
              key={value}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                if (value === "all") next.delete("filter");
                else next.set("filter", value);
                setSearchParams(next, { replace: true });
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="characters-page__artifact-link"
          onClick={() => navigate(`/artifacts/${artifactsId}`)}
        >
          {t("roster.reviewArtifacts", { ns: "showcase" })}
          <ArrowRight weight="bold" />
        </button>
      </section>

      <section className="character-roster" aria-live="polite">
        {roster.map(({ info, activeBuild, averageScore }) => (
          <CharacterRosterCard
            key={info.character}
            info={info}
            source={source}
            sourceId={artifactsId}
            activeBuild={activeBuild}
            averageScore={averageScore}
          />
        ))}
        {roster.length === 0 && (
          <div className="character-roster__no-results">
            {t("roster.noResults", { ns: "showcase" })}
          </div>
        )}
      </section>
    </main>
  );
}
