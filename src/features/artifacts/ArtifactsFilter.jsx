import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { CaretDown, WarningCircle } from "phosphor-react";

import SetSelect from "../sets/SetSelect";
import MultiRange from "../inputs/MultiRange";
import AttributePositionSelect from "./AttributePositionSelect";

const RANGE_TONE_CLASSES = {
  info: "range-info",
  success: "range-success",
};

const ScoreRange = ({ id, label, value, onChange, tone }) => (
  <div className="flex min-w-0 items-center gap-3">
    <input
      id={id}
      type="range"
      min="0"
      max="100"
      step="1"
      value={value}
      className={`range ${RANGE_TONE_CLASSES[tone]} min-w-0 grow`}
      aria-label={label}
      aria-valuetext={`${label} ${value}`}
      onChange={(event) => onChange(Number(event.target.value))}
    />
    <output htmlFor={id} className="w-14 shrink-0 text-right font-bold">
      ≥{value}
    </output>
  </div>
);

const ArtifactsFilter = ({
  minPotential,
  setMinPotential,
  minScore,
  setMinScore,
  set,
  setSet,
  pos,
  setPos,
  minLevel,
  maxLevel,
  setLevelRange,
  isDownloadBtnActive,
  downloadEvaluationStatus,
  handleDownloadYasLock,
  handleDownloadV2YasLock,
}) => {
  const { t } = useTranslation();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const levelOnChange = useCallback(
    ({ min, max }) => setLevelRange({ minLevel: min, maxLevel: max }),
    [setLevelRange]
  );
  const downloadDisabled =
    !isDownloadBtnActive || downloadEvaluationStatus !== "ready";
  const downloadLabel =
    downloadEvaluationStatus === "pending-summary"
      ? t("Calculating artifact scores")
      : downloadEvaluationStatus === "pending-set-eligibility"
      ? t("Calculating set recommendations")
      : downloadEvaluationStatus === "unavailable"
      ? t("Artifact scoring unavailable")
      : t("Generate lock file");

  return (
    <div className="bg-secondary/[.15] w-full min-w-0 rounded-xl">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 p-4 text-left md:hidden"
        aria-controls="artifact-score-filter-controls"
        aria-expanded={filtersOpen}
        onClick={() => setFiltersOpen((open) => !open)}
      >
        <span className="min-w-0">
          <span className="block font-bold">{t("Artifact score filters")}</span>
          <span className="block truncate text-xs font-medium opacity-70">
            {t("Potential")} ≥{minPotential} · {t("Score")} ≥{minScore}
          </span>
        </span>
        <CaretDown
          aria-hidden="true"
          className={`shrink-0 transition-transform ${
            filtersOpen ? "rotate-180" : ""
          }`}
          size={20}
        />
      </button>

      <section
        id="artifact-score-filter-controls"
        className={`${
          filtersOpen ? "grid" : "hidden"
        } w-full min-w-0 grid-cols-1 items-center gap-x-4 gap-y-2 p-4 pt-0 md:grid md:grid-cols-[auto_minmax(0,1fr)_0_auto_minmax(0,1fr)] md:gap-y-4 md:p-4`}
        aria-label={t("Artifact score filters")}
      >
        <label
          className="whitespace-nowrap font-bold"
          htmlFor="artifact-potential-filter"
        >
          {t("Potential")}
        </label>
        <ScoreRange
          id="artifact-potential-filter"
          label={t("Minimum Potential")}
          value={minPotential}
          onChange={setMinPotential}
          tone="info"
        />

        <div className="hidden md:block" aria-hidden="true" />
        <label
          className="whitespace-nowrap font-bold"
          htmlFor="artifact-score-filter"
        >
          {t("Score")}
        </label>
        <ScoreRange
          id="artifact-score-filter"
          label={t("Minimum Score")}
          value={minScore}
          onChange={setMinScore}
          tone="success"
        />

        <span id="artifact-set-filter-label" className="font-bold">
          {t("set")}
        </span>
        <SetSelect
          set={set}
          setSet={setSet}
          labelledBy="artifact-set-filter-label"
        />
        <div className="hidden md:block" aria-hidden="true" />
        <span id="artifact-position-filter-label" className="font-bold">
          {t("position", { ns: "artifacts" })}
        </span>
        <AttributePositionSelect
          pos={pos}
          setPos={setPos}
          labelledBy="artifact-position-filter-label"
        />

        <span className="whitespace-nowrap font-bold">
          {t("level", { ns: "artifacts" })}
        </span>
        <div className="flex min-w-0 items-center gap-2">
          <span className="w-[2ch]">{minLevel}</span>
          <MultiRange
            min={0}
            max={20}
            minValue={minLevel}
            maxValue={maxLevel}
            minLabel={t("Minimum artifact level")}
            maxLabel={t("Maximum artifact level")}
            onChange={levelOnChange}
          />
          <span className="w-[2ch]">{maxLevel}</span>
        </div>

        <div className="hidden md:block" aria-hidden="true" />
        <div className="col-span-1 md:col-span-2">
          <div className="join flex w-full items-stretch">
            <button
              type="button"
              className="join-item btn btn-accent text-accent-content min-h-12 h-auto min-w-0 flex-1 shrink whitespace-normal rounded-full py-2 text-center leading-tight shadow-md"
              onClick={handleDownloadYasLock}
              disabled={downloadDisabled}
            >
              {downloadLabel}
            </button>
            <div className="dropdown dropdown-end flex shrink-0 self-stretch">
              <button
                type="button"
                tabIndex={0}
                className="join-item btn btn-accent min-h-12 h-full rounded-full shadow-md"
                aria-label={t("More lock file options")}
                aria-haspopup="menu"
                disabled={downloadDisabled}
              >
                <CaretDown aria-hidden="true" size={20} />
              </button>
              <ul
                role="menu"
                className="dropdown-content menu rounded-box bg-base-100 text-base-content z-40 mt-1 w-64 max-w-[calc(100vw_-_2rem)] p-2 shadow"
              >
                <li>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleDownloadV2YasLock}
                    disabled={downloadDisabled}
                  >
                    {t("Generate V2 lock file")}
                    <span
                      className="tooltip tooltip-primary"
                      data-tip={t("V2_lock_file_tooltip")}
                    >
                      <WarningCircle aria-hidden="true" size={20} />
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArtifactsFilter;
