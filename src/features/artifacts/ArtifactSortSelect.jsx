import { useTranslation } from "react-i18next";
import { SortAscending, SortDescending } from "phosphor-react";

const ArtifactSortSelect = ({
  sortKey,
  setSortKey,
  showSelected,
  setShowSelected,
}) => {
  const { t } = useTranslation();
  const direction = sortKey.endsWith("-asc") ? "asc" : "desc";

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2 md:w-auto">
      <div
        className="join"
        role="group"
        aria-label={t("Artifact selection view")}
      >
        <button
          type="button"
          className={`join-item btn btn-sm ${
            showSelected ? "btn-primary" : "btn-ghost"
          }`}
          aria-label={t("Recommended artifacts")}
          aria-pressed={showSelected}
          onClick={() => setShowSelected(true)}
        >
          {t("Recommended")}
        </button>
        <button
          type="button"
          className={`join-item btn btn-sm ${
            !showSelected ? "btn-primary" : "btn-ghost"
          }`}
          aria-label={t("Other artifacts")}
          aria-pressed={!showSelected}
          onClick={() => setShowSelected(false)}
        >
          {t("Other")}
        </button>
      </div>

      <div className="flex items-center gap-1 text-sm">
        <span className="opacity-70">{t("Sort by")}</span>
        <span className="font-semibold">{t("Score")}</span>
        <button
          type="button"
          className="btn btn-circle btn-primary btn-sm"
          aria-label={
            direction === "asc" ? t("Sort descending") : t("Sort ascending")
          }
          onClick={() =>
            setSortKey(`score-${direction === "asc" ? "desc" : "asc"}`)
          }
        >
          {direction === "asc" ? (
            <SortAscending aria-hidden="true" size={20} />
          ) : (
            <SortDescending aria-hidden="true" size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ArtifactSortSelect;
