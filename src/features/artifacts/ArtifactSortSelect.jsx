import { useTranslation } from "react-i18next";
import { SortAscending, SortDescending } from "phosphor-react";

const SORT_LABELS = {
  expectedFinalMatch: "Expected +20 Match",
  currentMatch: "Build Match",
  prospect: "Prospect Rarity",
};

const splitSort = (sortKey) => {
  const separator = sortKey.lastIndexOf("-");
  return [sortKey.slice(0, separator), sortKey.slice(separator + 1)];
};

const ArtifactSortSelect = ({
  sortKey,
  setSortKey,
  showSelected,
  setShowSelected,
}) => {
  const { t } = useTranslation();
  const [metric, direction] = splitSort(sortKey);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="artifact-score-sort">
        {t("Sort by")}
      </label>
      <select
        id="artifact-score-sort"
        className="select select-sm select-primary rounded-full"
        value={metric}
        onChange={(event) => setSortKey(`${event.target.value}-${direction}`)}
      >
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {t(label)}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="btn btn-circle btn-primary btn-sm"
        aria-label={
          direction === "asc" ? t("Sort descending") : t("Sort ascending")
        }
        onClick={() =>
          setSortKey(`${metric}-${direction === "asc" ? "desc" : "asc"}`)
        }
      >
        {direction === "asc" ? (
          <SortAscending aria-hidden="true" size={20} />
        ) : (
          <SortDescending aria-hidden="true" size={20} />
        )}
      </button>

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
          aria-pressed={showSelected}
          onClick={() => setShowSelected(true)}
        >
          {t("show_selected", { ns: "artifacts" })}
        </button>
        <button
          type="button"
          className={`join-item btn btn-sm ${
            !showSelected ? "btn-primary" : "btn-ghost"
          }`}
          aria-pressed={!showSelected}
          onClick={() => setShowSelected(false)}
        >
          {t("show_unselected", { ns: "artifacts" })}
        </button>
      </div>
    </div>
  );
};

export default ArtifactSortSelect;
