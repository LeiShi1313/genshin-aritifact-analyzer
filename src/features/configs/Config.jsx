import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import {
  DEFAULT_FOUR_LINE_START_PROBABILITY,
  resetFourLineStartProbability,
  updateFourLineStartProbability,
} from "../../store/reducers/configs";

const Config = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const fourLineStartProbability = useSelector(
    (state) =>
      state.configs.fourLineStartProbability ??
      DEFAULT_FOUR_LINE_START_PROBABILITY
  );
  const percentage = useMemo(
    () =>
      new Intl.NumberFormat(i18n.resolvedLanguage ?? i18n.language, {
        style: "percent",
        maximumFractionDigits: 0,
      }).format(fourLineStartProbability),
    [fourLineStartProbability, i18n.language, i18n.resolvedLanguage]
  );
  const inputId = "four-line-start-probability";

  return (
    <main className="flex w-full justify-center px-4 py-6">
      <section className="bg-base-200 w-full max-w-xl rounded-xl p-4 shadow-md md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold">
            {t("Artifact scoring assumptions")}
          </h1>
          <span className="badge badge-secondary badge-outline">
            {t("Model assumption")}
          </span>
        </div>

        <div className="bg-base-100 mt-5 rounded-lg p-4">
          <div className="flex items-baseline justify-between gap-4">
            <label className="font-bold" htmlFor={inputId}>
              {t("Four-line start probability")}
            </label>
            <output
              className="text-primary text-lg font-bold"
              htmlFor={inputId}
            >
              {percentage}
            </output>
          </div>
          <p className="mt-1 text-sm opacity-75">
            {t("Four-line start probability description")}
          </p>
          <input
            id={inputId}
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={fourLineStartProbability}
            className="range range-primary mt-4"
            aria-valuetext={t("Four-line start probability value", {
              value: percentage,
            })}
            onChange={(event) =>
              dispatch(
                updateFourLineStartProbability(Number(event.target.value))
              )
            }
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => dispatch(resetFourLineStartProbability())}
            >
              {t("Reset four-line start probability")}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Config;
