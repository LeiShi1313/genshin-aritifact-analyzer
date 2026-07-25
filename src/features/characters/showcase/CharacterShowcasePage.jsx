import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  DownloadSimple,
  Info,
  SlidersHorizontal,
  X,
} from "phosphor-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toPng } from "html-to-image";

import characterData from "../../../data/characters.json";
import weaponData from "../../../data/weapons.json";
import { AttributePosition, AttributeType } from "../../../genshin/attribute";
import { Character } from "../../../genshin/character";
import { Set as ArtifactSet } from "../../../genshin/set";
import { Weapon } from "../../../genshin/weapon";
import { formatAttributeValue } from "../../../utils/attribute";
import { getBuildName } from "../../../utils/build";
import {
  adaptAppCharacterSheetLoadout,
  toAppCharacterStatAttributes,
} from "../../../utils/characterStats/appAdapter";
import { loadAppCharacterSheetProgression } from "../../../utils/characterStats/appProgressionLoader";
import { calculateCharacterSheetStatsFromProgression } from "../../../utils/characterStats/calculateCharacterSheetStats";
import {
  buildArtifactShowcase,
  getCharacterBuildOptions,
  getEquippedArtifacts,
  getResolvedArtifactMainAttribute,
  selectCharacterBuildOption,
} from "./characterShowcaseModel";
import CharacterShowcaseCard from "./CharacterShowcaseCard";
import {
  fallbackArtifact,
  getArtifactImageUrl,
  getCharacterGachaUrl,
  getWeaponImageUrl,
} from "./showcaseAssets";
import { humanizeGameKey, translateGameLabel } from "./showcaseI18n";
import "./showcase-page.css";
import "./showcase-element-themes.css";

const DAMAGE_TYPE_BY_ELEMENT = Object.freeze({
  anemo: AttributeType.ANEMO_DAMAGE_BONUS,
  cryo: AttributeType.CRYO_DAMAGE_BONUS,
  dendro: AttributeType.DENDRO_DAMAGE_BONUS,
  electro: AttributeType.ELECTRO_DAMAGE_BONUS,
  geo: AttributeType.GEO_DAMAGE_BONUS,
  hydro: AttributeType.HYDRO_DAMAGE_BONUS,
  pyro: AttributeType.PYRO_DAMAGE_BONUS,
});
const CHARACTER_ELEMENTS = new Set(Object.keys(DAMAGE_TYPE_BY_ELEMENT));

const fixedStatTypes = (theme) => [
  AttributeType.HP,
  AttributeType.ATK,
  AttributeType.DEF,
  AttributeType.ELEMENTAL_MASTERY,
  AttributeType.CRIT_RATE,
  AttributeType.CRIT_DAMAGE,
  AttributeType.ENERGY_RECHARGE,
  DAMAGE_TYPE_BY_ELEMENT[theme] ?? AttributeType.PHYSICAL_DAMAGE_BONUS,
];

const splitCharacterName = (name) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return [name];
  return [parts.slice(0, -1).join(" "), parts.at(-1)];
};

const buildSubstatImportance = (build, type) => {
  const weight = build?.subAttributes?.find(
    (attribute) => attribute.type === type
  )?.value;
  if (!Number.isFinite(weight) || weight <= 0) return "neutral";
  if (weight >= 0.8) return "core";
  if (weight >= 0.5) return "useful";
  return "minor";
};

const buildStatPriority = (build, type) => {
  const substat = build?.subAttributes?.find(
    (attribute) => attribute.type === type
  )?.value;
  const mainStatFields = [
    "flowerAttributes",
    "plumeAttributes",
    "sandsAttributes",
    "gobletAttributes",
    "circletAttributes",
  ];
  const mainStat = mainStatFields.some((field) =>
    build?.[field]?.includes(type)
  );
  return Math.max(Number.isFinite(substat) ? substat : 0, mainStat ? 0.7 : 0);
};

const buildStats = (calculation, activeBuild, theme, t, locale) => {
  const calculatedRows =
    calculation && calculation.status !== "invalid"
      ? toAppCharacterStatAttributes(
          calculation.stats,
          CHARACTER_ELEMENTS.has(theme) ? theme : undefined
        )
      : undefined;
  const rows =
    calculatedRows ?? fixedStatTypes(theme).map((type) => ({ type }));

  return rows.map(({ type, value }) => ({
    type,
    label: translateGameLabel(
      t,
      "artifacts",
      AttributeType[type]?.toLowerCase()
    ),
    value: Number.isFinite(value)
      ? formatAttributeValue({ type, value }, locale)
      : "—",
    featured: buildStatPriority(activeBuild?.build, type) >= 0.5,
  }));
};

const sourceDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const safeFileName = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function ArtifactDetailDialog({ artifact, onClose }) {
  const closeRef = useRef(null);
  const { t, i18n } = useTranslation(["showcase", "common"]);
  const locale = i18n.resolvedLanguage ?? i18n.language ?? "en";
  const rollFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
      }),
    [locale]
  );

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!artifact) return null;

  return (
    <div
      className="showcase-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="showcase-artifact-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="showcase-artifact-dialog-title"
      >
        <button
          ref={closeRef}
          type="button"
          className="showcase-artifact-dialog__close"
          onClick={onClose}
          aria-label={t("detail.close", { ns: "showcase" })}
        >
          <X weight="bold" />
        </button>
        <header>
          <img src={artifact.image} alt="" />
          <div>
            <span>{artifact.slot}</span>
            <h2 id="showcase-artifact-dialog-title">{artifact.set}</h2>
            <p>
              +{artifact.level} · {artifact.role}
            </p>
          </div>
          <strong>
            {artifact.score ?? "—"}
            <small>{t("Score", { ns: "common" })}</small>
          </strong>
        </header>
        <div className="showcase-artifact-dialog__main">
          <span>{t("detail.mainStat", { ns: "showcase" })}</span>
          <strong>
            {artifact.main.label} {artifact.main.value}
          </strong>
        </div>
        <div className="showcase-artifact-dialog__substats">
          {artifact.substats.map((substat) => (
            <div className={`is-${substat.importance}`} key={substat.type}>
              <span>{substat.label}</span>
              <strong>{substat.value}</strong>
              <small>
                {substat.importance === "neutral"
                  ? t("detail.notPrioritized", { ns: "showcase" })
                  : t("detail.priority", {
                      ns: "showcase",
                      priority: t(`legend.${substat.importance}`, {
                        ns: "showcase",
                      }),
                    })}
                {Number.isFinite(substat.rollEquivalent)
                  ? ` · ${t("detail.rolls", {
                      ns: "showcase",
                      rolls: rollFormatter.format(substat.rollEquivalent),
                    })}`
                  : ""}
              </small>
            </div>
          ))}
        </div>
        <p className="showcase-artifact-dialog__note">
          <Info weight="fill" aria-hidden="true" />
          {t("detail.note", { ns: "showcase" })}
        </p>
      </section>
    </div>
  );
}

export default function CharacterShowcasePage() {
  const { artifactsId, characterId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation([
    "common",
    "showcase",
    "artifacts",
    "characters",
    "sets",
    "weapons",
  ]);
  const locale = i18n.resolvedLanguage ?? i18n.language ?? "en";
  const shortDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale]
  );
  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale]
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const uploads = useSelector((state) => state.uploads.artifacts);
  const customBuilds = useSelector((state) => state.build.builds);
  const buildConfig = useSelector((state) => state.build.config);
  const presetBuilds = useSelector((state) => state.presets.builds);
  const cardRef = useRef(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [exportState, setExportState] = useState("idle");

  const source = uploads[artifactsId];
  const character = Character[characterId?.toUpperCase()];
  const info = source?.characters?.find(
    (entry) => entry.character === character
  );
  const buildOptions = getCharacterBuildOptions({
    character,
    customBuilds,
    presetBuilds,
    config: buildConfig,
  });
  const activeBuild = selectCharacterBuildOption(
    buildOptions,
    searchParams.get("build")
  );
  const equippedArtifacts = useMemo(
    () => getEquippedArtifacts(source, character),
    [source, character]
  );
  const weapon = source?.weapons?.find(
    (item) => item.location === character
  );
  const adaptedLoadout = useMemo(
    () =>
      info
        ? adaptAppCharacterSheetLoadout({
            character: info,
            weapon,
            artifacts: equippedArtifacts,
          })
        : undefined,
    [info, weapon, equippedArtifacts]
  );
  const [sheetRequest, setSheetRequest] = useState({ status: "idle" });

  useEffect(() => {
    if (!adaptedLoadout) {
      setSheetRequest({ status: "idle" });
      return undefined;
    }
    if (adaptedLoadout.status !== "ok") {
      setSheetRequest({ status: "invalid" });
      return undefined;
    }

    let active = true;
    const loadout = adaptedLoadout.loadout;
    setSheetRequest({ status: "loading", loadout });
    loadAppCharacterSheetProgression(loadout)
      .then((progression) => {
        if (!active) return;
        setSheetRequest({
          status: "resolved",
          loadout,
          result: calculateCharacterSheetStatsFromProgression(
            loadout,
            progression
          ),
        });
      })
      .catch((error) => {
        if (!active) return;
        console.error("Unable to load character stats", error);
        setSheetRequest({ status: "error", loadout });
      });

    return () => {
      active = false;
    };
  }, [adaptedLoadout]);

  const calculation =
    adaptedLoadout?.status === "ok" &&
    sheetRequest.status === "resolved" &&
    sheetRequest.loadout === adaptedLoadout.loadout
      ? sheetRequest.result
      : undefined;
  const statsStatus =
    adaptedLoadout?.status === "invalid" || calculation?.status === "invalid"
      ? "invalid"
      : sheetRequest.status === "error" &&
        sheetRequest.loadout === adaptedLoadout?.loadout
      ? "error"
      : calculation?.status === "partial"
      ? "partial"
      : calculation?.status === "complete"
      ? "complete"
      : "loading";
  const statsExportReady =
    statsStatus === "complete" || statsStatus === "partial";
  const statsNoticeKey =
    statsStatus === "loading"
      ? "notice.statsLoading"
      : statsStatus === "partial"
      ? "notice.statsPartial"
      : statsStatus === "error"
      ? "notice.statsError"
      : statsStatus === "invalid"
      ? "notice.statsUnavailable"
      : undefined;
  const statsNote = statsNoticeKey
    ? t(statsNoticeKey, { ns: "showcase" })
    : undefined;

  const viewModel = useMemo(() => {
    if (!source || !info || !Character[character]) return undefined;
    const key = Character[character].toLowerCase();
    const name = translateGameLabel(t, "characters", key);
    const metadata = characterData[key] ?? {};
    const theme = metadata.element?.toLowerCase() || "neutral";
    const artifacts = equippedArtifacts.map((artifact, index) => {
      if (!artifact) return undefined;
      const scoring = buildArtifactShowcase(artifact, activeBuild);
      const scoredSubstats =
        scoring.status === "ok"
          ? new Map(scoring.substats.map((substat) => [substat.type, substat]))
          : new Map();
      const positionKey = AttributePosition[artifact.position]?.toLowerCase();
      const mainType = artifact.mainAttribute?.type;
      const resolvedMainAttribute = getResolvedArtifactMainAttribute(artifact);

      return {
        raw: artifact,
        position: artifact.position,
        slot: translateGameLabel(t, "artifacts", positionKey),
        image: getArtifactImageUrl(artifact),
        level: artifact.level,
        score: scoring.status === "ok" ? scoring.score : undefined,
        set: translateGameLabel(
          t,
          "sets",
          ArtifactSet[artifact.set]?.toLowerCase()
        ),
        role:
          scoring.status !== "ok"
            ? activeBuild
              ? t("status.scoreUnavailable", { ns: "showcase" })
              : t("status.chooseProfile", { ns: "showcase" })
            : scoring.setRole === "set-match"
            ? t("Set match", { ns: "common" })
            : scoring.setRole === "off-piece"
            ? t("status.offPiece", { ns: "showcase" })
            : t("status.flexibleSet", { ns: "showcase" }),
        main: {
          label: translateGameLabel(
            t,
            "artifacts",
            AttributeType[mainType]?.toLowerCase()
          ),
          value: resolvedMainAttribute
            ? formatAttributeValue(resolvedMainAttribute, locale)
            : "—",
        },
        substats: artifact.subAttributes.map((substat) => {
          const scored = scoredSubstats.get(substat.type);
          return {
            type: substat.type,
            label: translateGameLabel(
              t,
              "artifacts",
              AttributeType[substat.type]?.toLowerCase()
            ),
            value: formatAttributeValue(substat, locale),
            importance:
              scored?.importance ||
              buildSubstatImportance(activeBuild?.build, substat.type),
            rollEquivalent: scored?.rollEquivalent,
          };
        }),
        sourceIndex: index,
      };
    });
    const index = source.characters.findIndex(
      (entry) => entry.character === character
    );
    const date = sourceDate(source.date);
    const weaponKey = weapon ? Weapon[weapon.weapon]?.toLowerCase() : undefined;

    return {
      theme,
      name,
      nameLines: splitCharacterName(name),
      art: getCharacterGachaUrl(character),
      rarity: Number(metadata.rarity) || 5,
      level: info.level,
      constellation: info.constellation,
      index: String(index + 1).padStart(2, "0"),
      sourceLabel: `${
        source.format || t("archive.import", { ns: "showcase" })
      } · ${
        source.name ||
        (date ? shortDateFormatter.format(date) : undefined) ||
        t("archive.currentSnapshot", { ns: "showcase" })
      }`,
      profileLabel: activeBuild
        ? getBuildName(activeBuild.build.name, t)
        : t("status.noScoringProfile", { ns: "showcase" }),
      weapon: weapon
        ? {
            name: translateGameLabel(
              t,
              "weapons",
              weaponKey,
              humanizeGameKey(weaponKey)
            ),
            image: getWeaponImageUrl(weapon.weapon),
            rarity: Number(weaponData[weaponKey]?.rarity) || 5,
            level: weapon.level,
            refinement: weapon.refinement,
          }
        : undefined,
      talents: ["normal", "skill", "burst"].map((talent, talentIndex) => ({
        label: t(`talents.${talent}`, { ns: "showcase" }),
        value: info.talents?.[talentIndex] ?? "—",
      })),
      stats: buildStats(calculation, activeBuild, theme, t, locale),
      statsApproximate: statsStatus === "partial",
      statsNote,
      artifacts,
      date,
    };
  }, [
    source,
    info,
    character,
    activeBuild,
    equippedArtifacts,
    weapon,
    calculation,
    statsStatus,
    statsNote,
    locale,
    shortDateFormatter,
    t,
  ]);

  const selectedArtifact = viewModel?.artifacts.find(
    (artifact) => artifact?.position === selectedPosition
  );

  const handleExport = async () => {
    if (
      !cardRef.current ||
      !viewModel ||
      !statsExportReady ||
      exportState === "working"
    )
      return;
    setExportState("working");
    const card = cardRef.current;
    try {
      await document.fonts?.ready;
      card.classList.add("is-exporting");
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const image = await toPng(card, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#160e23",
      });
      const link = document.createElement("a");
      link.download = `${safeFileName(viewModel.name)}-build.png`;
      link.href = image;
      link.click();
      setExportState("done");
      window.setTimeout(() => setExportState("idle"), 1800);
    } catch (error) {
      console.error("Unable to export character card", error);
      setExportState("error");
      window.setTimeout(() => setExportState("idle"), 2600);
    } finally {
      card.classList.remove("is-exporting");
    }
  };

  if (!source || !info || !viewModel) {
    return (
      <main className="characters-empty-state">
        <p>{t("archive.character", { ns: "showcase" })}</p>
        <h1>{t("empty.snapshotTitle", { ns: "showcase" })}</h1>
        <span>{t("empty.snapshotDescription", { ns: "showcase" })}</span>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/characters/${artifactsId || ""}`)}
        >
          {t("empty.backToRoster", { ns: "showcase" })}
        </button>
      </main>
    );
  }

  return (
    <main
      className={`character-showcase-page character-showcase-page--${viewModel.theme}`}
    >
      <header className="character-showcase-toolbar">
        <button
          type="button"
          className="character-showcase-toolbar__back"
          onClick={() => navigate(`/characters/${artifactsId}`)}
        >
          <ArrowLeft weight="bold" />
          {t("toolbar.roster", { ns: "showcase" })}
        </button>

        <div className="character-showcase-toolbar__selectors">
          <label>
            <span>{t("Character", { ns: "common" })}</span>
            <select
              value={character}
              onChange={(event) => {
                const nextCharacter = Number(event.target.value);
                navigate(
                  `/characters/${artifactsId}/${Character[
                    nextCharacter
                  ].toLowerCase()}`
                );
              }}
            >
              {source.characters.map((entry) => (
                <option value={entry.character} key={entry.character}>
                  {translateGameLabel(
                    t,
                    "characters",
                    Character[entry.character].toLowerCase()
                  )}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t("toolbar.scoringProfile", { ns: "showcase" })}</span>
            <select
              value={activeBuild?.id || ""}
              disabled={buildOptions.length === 0}
              onChange={(event) => {
                const next = new URLSearchParams(searchParams);
                next.set("build", event.target.value);
                setSearchParams(next, { replace: true });
              }}
            >
              {buildOptions.length === 0 ? (
                <option value="">
                  {t("toolbar.noProfile", { ns: "showcase" })}
                </option>
              ) : (
                buildOptions.map((option) => (
                  <option value={option.id} key={option.id}>
                    {getBuildName(option.build.name, t)}
                    {" · "}
                    {t(
                      option.source === "custom"
                        ? "toolbar.custom"
                        : "toolbar.preset",
                      { ns: "showcase" }
                    )}
                    {!option.enabled
                      ? ` · ${t("toolbar.disabled", { ns: "showcase" })}`
                      : ""}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        <div className="character-showcase-toolbar__meta">
          <span>
            {viewModel.date
              ? t("toolbar.updated", {
                  ns: "showcase",
                  date: dateTimeFormatter.format(viewModel.date),
                })
              : t("toolbar.importedSnapshot", { ns: "showcase" })}
          </span>
          <button
            type="button"
            className="character-showcase-toolbar__improve"
            onClick={() =>
              navigate(
                activeBuild
                  ? `/artifacts/${artifactsId}?build=${encodeURIComponent(
                      activeBuild.id
                    )}`
                  : "/build"
              )
            }
          >
            <SlidersHorizontal weight="bold" />
            {t(activeBuild ? "toolbar.improveBuild" : "toolbar.createProfile", {
              ns: "showcase",
            })}
          </button>
          <button
            type="button"
            className="character-showcase-toolbar__export"
            onClick={handleExport}
            data-state={exportState}
            disabled={!statsExportReady || exportState === "working"}
            title={!statsExportReady ? statsNote : undefined}
          >
            {exportState === "done" ? (
              <Check weight="bold" />
            ) : (
              <DownloadSimple weight="bold" />
            )}
            {exportState === "working"
              ? t("toolbar.rendering", { ns: "showcase" })
              : exportState === "done"
              ? t("toolbar.saved", { ns: "showcase" })
              : exportState === "error"
              ? t("toolbar.tryAgain", { ns: "showcase" })
              : t("toolbar.exportPng", { ns: "showcase" })}
          </button>
        </div>
      </header>

      {!activeBuild && (
        <aside className="character-showcase-notice">
          <Info weight="fill" aria-hidden="true" />
          {t("notice.profileRequired", { ns: "showcase" })}
          <button type="button" onClick={() => navigate("/build")}>
            {t("toolbar.createProfile", { ns: "showcase" })}
            <ArrowRight weight="bold" />
          </button>
        </aside>
      )}

      {statsNoticeKey && (
        <aside
          className={`character-showcase-notice character-showcase-notice--stats character-showcase-notice--${statsStatus}`}
          aria-live="polite"
        >
          <Info weight="fill" aria-hidden="true" />
          {statsNote}
          {statsStatus === "error" && (
            <button type="button" onClick={() => window.location.reload()}>
              {t("notice.reloadPage", { ns: "showcase" })}
              <ArrowRight weight="bold" />
            </button>
          )}
        </aside>
      )}

      <div className="character-showcase-canvas">
        <CharacterShowcaseCard
          ref={cardRef}
          build={viewModel}
          onArtifactSelect={(artifact) =>
            setSelectedPosition(artifact.position)
          }
        />
      </div>

      <footer className="character-showcase-legend">
        <div>
          <span className="is-core" />
          <strong>{t("legend.core", { ns: "showcase" })}</strong>
          {t("legend.coreDescription", { ns: "showcase" })}
        </div>
        <div>
          <span className="is-useful" />
          <strong>{t("legend.useful", { ns: "showcase" })}</strong>
          {t("legend.usefulDescription", { ns: "showcase" })}
        </div>
        <div>
          <span className="is-minor" />
          <strong>{t("legend.minor", { ns: "showcase" })}</strong>
          {t("legend.minorDescription", { ns: "showcase" })}
        </div>
        <p>{t("legend.rollExplanation", { ns: "showcase" })}</p>
      </footer>

      {selectedArtifact && (
        <ArtifactDetailDialog
          artifact={selectedArtifact}
          onClose={() => setSelectedPosition(null)}
        />
      )}
    </main>
  );
}
