import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CaretDown, WarningCircle } from "phosphor-react";

import SetSelect from "../sets/SetSelect";
import MultiRange from "../inputs/MultiRange";
import AttributePositionSelect from "./AttributePositionSelect";

const PercentRange = ({ id, label, value, onChange, disabled = false }) => (
  <div className="flex min-w-0 items-center gap-3">
    <input
      id={id}
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={value}
      disabled={disabled}
      className="range range-primary min-w-0 grow"
      aria-label={label}
      aria-valuetext={`${Math.round(Number(value) * 100)}%`}
      onChange={(event) => onChange(Number(event.target.value))}
    />
    <output htmlFor={id} className="w-14 shrink-0 text-right font-bold">
      ≥{Math.round(Number(value) * 100)}%
    </output>
  </div>
);

const ArtifactsFilter = ({
  match,
  setMatch,
  prospectEnabled,
  setProspectEnabled,
  prospect,
  setProspect,
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
  const levelOnChange = useCallback(
    ({ min, max }) => setLevelRange({ minLevel: min, maxLevel: max }),
    [setLevelRange]
  );
  const downloadDisabled =
    !isDownloadBtnActive || downloadEvaluationStatus !== "ready";
  const downloadLabel =
    downloadEvaluationStatus === "pending-summary"
      ? t("Calculating Build Match")
      : downloadEvaluationStatus === "pending-prospect"
      ? t("Waiting for Prospect Rarity")
      : downloadEvaluationStatus === "unavailable"
      ? t("Artifact scoring unavailable")
      : t("Generate lock file");

  return (
    <section
      className="bg-secondary/[.15] grid w-full min-w-0 grid-cols-1 items-center gap-x-4 gap-y-2 rounded-xl p-4 md:grid-cols-[auto_minmax(0,1fr)_0_auto_minmax(0,1fr)] md:gap-y-4"
      aria-label={t("Artifact score filters")}
    >
      <label
        className="whitespace-nowrap font-bold"
        htmlFor="artifact-match-filter"
      >
        {t("Build Match")}
      </label>
      <PercentRange
        id="artifact-match-filter"
        label={t("Minimum Build Match")}
        value={match}
        onChange={setMatch}
      />

      <div className="hidden md:block" aria-hidden="true" />
      <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap font-bold">
        <input
          type="checkbox"
          className="toggle toggle-secondary toggle-sm"
          checked={prospectEnabled}
          onChange={(event) => setProspectEnabled(event.target.checked)}
        />
        {t("Prospect Rarity")}
      </label>
      <PercentRange
        id="artifact-prospect-filter"
        label={t("Minimum Prospect Rarity")}
        value={prospect}
        onChange={setProspect}
        disabled={!prospectEnabled}
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
  );
};

export default ArtifactsFilter;
