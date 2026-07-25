import { forwardRef } from "react";
import { Sparkle, Star } from "phosphor-react";
import { useTranslation } from "react-i18next";

import { fallbackArtifact } from "./showcaseAssets";
import "./character-showcase-card.css";
import "./showcase-element-themes.css";

const IMPORTANCE_WEIGHT = {
  core: 1,
  useful: 0.68,
  minor: 0.38,
  neutral: 0,
};

const scoreTier = (score, t) => {
  if (score === 100) {
    return { key: "apex", label: t("Perfect", { ns: "common" }) };
  }
  if (score >= 90) {
    return { key: "crowned", label: t("card.elite", { ns: "showcase" }) };
  }
  if (score >= 80) {
    return {
      key: "exceptional",
      label: t("Exceptional", { ns: "common" }),
    };
  }
  if (score >= 70) {
    return { key: "excellent", label: t("Good", { ns: "common" }) };
  }
  return {
    key: "strong",
    label: t(score === undefined ? "card.unscored" : "card.standard", {
      ns: "showcase",
    }),
  };
};

const rollMarksFor = (rollEquivalent) => {
  if (!Number.isFinite(rollEquivalent) || rollEquivalent <= 0) return [];
  return Array.from(
    { length: Math.min(6, Math.ceil(rollEquivalent - 0.05)) },
    (_, index) => Math.min(1, Math.max(0.18, rollEquivalent - index))
  );
};

const substatPresentation = (substat, t, locale) => {
  const importance = substat.importance || "neutral";
  const rollEquivalent = substat.rollEquivalent ?? 0;
  const rollFactor = Math.min(1, 0.32 + rollEquivalent * 0.18);
  const impact = IMPORTANCE_WEIGHT[importance] * rollFactor;
  const quality =
    rollEquivalent >= 3.75
      ? "elite"
      : rollEquivalent >= 2.75
      ? "high"
      : rollEquivalent >= 1.75
      ? "solid"
      : "base";
  const priorityLabel =
    importance === "neutral"
      ? t("detail.notPrioritized", { ns: "showcase" })
      : t("detail.priority", {
          ns: "showcase",
          priority: t(`legend.${importance}`, { ns: "showcase" }),
        });
  const formattedRolls = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(rollEquivalent);

  return {
    importance,
    impact,
    quality,
    rollMarks: rollMarksFor(rollEquivalent),
    title: Number.isFinite(substat.rollEquivalent)
      ? t("card.maxRollEquivalents", {
          ns: "showcase",
          priority: priorityLabel,
          rolls: formattedRolls,
        })
      : priorityLabel,
  };
};

function Stars({ count = 5, compact = false, t }) {
  return (
    <span
      className={`ccp-stars${compact ? " ccp-stars--compact" : ""}`}
      aria-label={t("card.rarity", { ns: "showcase", count })}
    >
      {Array.from({ length: count }, (_, index) => (
        <Star key={index} weight="fill" aria-hidden="true" />
      ))}
    </span>
  );
}

function SourceMark({ label }) {
  return (
    <span className="ccp-source-mark">
      <span aria-hidden="true" />
      {label}
    </span>
  );
}

function WeaponSummary({ weapon, t }) {
  if (!weapon) {
    return (
      <div className="ccp-weapon ccp-weapon--missing">
        <div className="ccp-weapon-image" aria-hidden="true" />
        <div className="ccp-weapon-copy">
          <strong>{t("roster.noWeapon", { ns: "showcase" })}</strong>
          <div>{t("card.noWeaponSnapshot", { ns: "showcase" })}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ccp-weapon">
      <div className="ccp-weapon-image">
        <img src={weapon.image} alt="" />
      </div>
      <div className="ccp-weapon-copy">
        <strong>{weapon.name}</strong>
        <div>
          <Stars compact count={weapon.rarity} t={t} />
          <b>{t("card.level", { ns: "showcase", level: weapon.level })}</b>
          {" · "}
          {t("card.refinement", {
            ns: "showcase",
            refinement: weapon.refinement,
          })}
        </div>
      </div>
    </div>
  );
}

function TalentSummary({ talents, t }) {
  return (
    <div
      className="ccp-talent-block"
      aria-label={t("talents.levels", { ns: "showcase" })}
    >
      {talents.map((talent) => (
        <div className="ccp-talent" key={talent.label}>
          <span>{talent.label}</span>
          <strong>{talent.value}</strong>
        </div>
      ))}
    </div>
  );
}

function StatWing({ stats, side }) {
  return (
    <div className={`ccp-stat-wing ccp-stat-wing--${side}`}>
      {stats.map((stat) => (
        <div className={stat.featured ? "is-featured" : ""} key={stat.type}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
        </div>
      ))}
    </div>
  );
}

function ConstellationSeal({ value, t }) {
  const label = t("constellation", { ns: "common", count: value });

  return (
    <span
      className={`ccp-constellation${
        value >= 6 ? " ccp-constellation--elite" : ""
      }`}
      aria-label={label}
    >
      {value >= 6 && <Sparkle aria-hidden="true" weight="fill" />}
      <span>{label}</span>
    </span>
  );
}

function ArtifactCard({ artifact, character, index, locale, onSelect, t }) {
  if (!artifact) {
    return (
      <button
        type="button"
        className="ccp-artifact ccp-artifact--strong ccp-artifact--missing"
        disabled
      >
        <header>
          <span>0{index + 1}</span>
          <strong>{t("card.emptySlot", { ns: "showcase" })}</strong>
          <b>{t("card.missing", { ns: "showcase" })}</b>
        </header>
        <div className="ccp-artifact-hero">
          <div className="ccp-artifact-image">
            <img src={fallbackArtifact} alt="" />
          </div>
        </div>
        <strong className="ccp-main-stat">
          {t("card.noArtifact", { ns: "showcase" })}
        </strong>
        <p className="ccp-artifact-empty-copy">
          {t("card.equipArtifact", { ns: "showcase" })}
        </p>
      </button>
    );
  }

  const tier = scoreTier(artifact.score, t);

  return (
    <button
      type="button"
      className={`ccp-artifact ccp-artifact--${tier.key}`}
      onClick={() => onSelect?.(artifact)}
      aria-label={t("card.inspectArtifact", {
        ns: "showcase",
        slot: artifact.slot,
        score: artifact.score ?? t("Unavailable", { ns: "common" }),
      })}
    >
      <header>
        <span>0{index + 1}</span>
        <strong>{artifact.slot}</strong>
        <b>{tier.label}</b>
      </header>
      <div className="ccp-artifact-hero">
        <div className="ccp-artifact-image">
          <img
            src={artifact.image}
            alt={t("card.characterArtifactAlt", {
              ns: "showcase",
              character,
              slot: artifact.slot,
            })}
          />
          <span>+{artifact.level}</span>
        </div>
        <div className="ccp-score-seal">
          {artifact.score === 100 && (
            <Sparkle aria-hidden="true" weight="fill" />
          )}
          <strong>{artifact.score ?? "—"}</strong>
          <span>{t("Score", { ns: "common" })}</span>
        </div>
      </div>
      <strong className="ccp-main-stat">
        <span>{artifact.main.label}</span> {artifact.main.value}
      </strong>
      <ul
        className="ccp-substats"
        aria-label={t("card.artifactSubstats", {
          ns: "showcase",
          slot: artifact.slot,
        })}
      >
        {artifact.substats.map((substat) => {
          const analysis = substatPresentation(substat, t, locale);
          const impact = Math.round(analysis.impact * 100);
          const wash = Math.round(analysis.impact * 8);

          return (
            <li
              className={`ccp-substat ccp-substat--${analysis.importance} ccp-substat--${analysis.quality}`}
              aria-label={`${substat.label} ${substat.value}. ${analysis.title}`}
              key={substat.type}
              style={{
                "--roll-strength": Math.max(0.45, analysis.impact),
                "--substat-impact": `${impact}%`,
                "--substat-wash": `${wash}%`,
              }}
              title={analysis.title}
            >
              <span className="ccp-substat-copy">
                {substat.label} {substat.value}
              </span>
              {analysis.importance !== "neutral" && (
                <span className="ccp-roll-meter" aria-hidden="true">
                  {analysis.rollMarks.map((fill, rollIndex) => (
                    <i
                      aria-hidden="true"
                      key={rollIndex}
                      style={{ "--roll-fill": `${Math.round(fill * 100)}%` }}
                    />
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <footer>
        <span>{artifact.set}</span>
        <b>{artifact.role}</b>
      </footer>
    </button>
  );
}

const CharacterShowcaseCard = forwardRef(function CharacterShowcaseCard(
  { build, onArtifactSelect },
  ref
) {
  const { t, i18n } = useTranslation(["showcase", "common"]);
  const locale = i18n.resolvedLanguage ?? i18n.language ?? "en";

  return (
    <section
      ref={ref}
      className={`ccp-seal ccp-seal--${build.theme} character-showcase-card`}
      aria-labelledby="character-showcase-name"
    >
      <img className="ccp-seal-art" src={build.art} alt={build.name} />
      <div className="ccp-seal-wash" aria-hidden="true" />
      <div className="ccp-theme-ornament" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      <header className="ccp-seal-header">
        <SourceMark label={build.sourceLabel} />
        <span>
          {t("archive.artifactContribution", {
            ns: "showcase",
            profile: build.profileLabel,
          })}
          <small>
            {t("card.statScope", { ns: "showcase" })}
          </small>
        </span>
      </header>

      <div className="ccp-seal-identity">
        <span>
          {t("archive.entry", { ns: "showcase", index: build.index })}
        </span>
        <h2 id="character-showcase-name">
          <span>{build.nameLines[0]}</span>
          {build.nameLines[1] && <strong>{build.nameLines[1]}</strong>}
        </h2>
        <div>
          <Stars count={build.rarity} t={t} />
          <b>{t("card.level", { ns: "showcase", level: build.level })}</b>
          <ConstellationSeal value={build.constellation} t={t} />
        </div>
      </div>

      <StatWing
        stats={build.stats.slice(0, 4)}
        side="left"
      />
      <StatWing
        stats={build.stats.slice(4, 8)}
        side="right"
      />

      <div className="ccp-seal-loadout">
        <WeaponSummary weapon={build.weapon} t={t} />
        <TalentSummary talents={build.talents} t={t} />
      </div>

      <div
        className="ccp-seal-artifacts"
        aria-label={t("card.characterArtifacts", {
          ns: "showcase",
          character: build.name,
        })}
      >
        {build.artifacts.map((artifact, index) => (
          <ArtifactCard
            artifact={artifact}
            character={build.name}
            index={index}
            key={artifact?.position ?? `missing-${index}`}
            locale={locale}
            onSelect={onArtifactSelect}
            t={t}
          />
        ))}
      </div>
    </section>
  );
});

export default CharacterShowcaseCard;
