import { useTranslation } from "react-i18next";
import { SelectionAll, SelectionSlash } from "phosphor-react";

const ArtifactSortSelect = ({
  sortKey,
  setSortKey,
  showSelected,
  setShowSelected,
}) => {
  const { t } = useTranslation();
  const handleDropdownClick = (sortCondition) => {
    let keyPair = sortKey.split("-");
    setSortKey(sortCondition + "-" + keyPair[1]);

    // Collapse the dropdown list
    const elem = document.activeElement;
    if (elem) {
      elem?.blur();
    }
  };

  const changeSortDirection = () => {
    let keyPair = sortKey.split("-");
    setSortKey(keyPair[0] + "-" + (keyPair[1] === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="flex gap-2">
      <div className="dropdown">
        <label
          tabIndex="0"
          className="btn btn-sm btn-primary flex-nowrap rounded-full normal-case"
        >
          {sortKey.split("-")[0] === "fitness" ? t("Fitness") : t("Rarity")}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24"
          >
            <path d="M7,10L12,15L17,10H7Z" />
          </svg>
        </label>
        <ul
          tabIndex="0"
          className="dropdown-content menu rounded-box z-[40] mt-1 w-full flex-nowrap overflow-auto bg-neutral p-1 text-sm text-neutral-content shadow"
        >
          <li>
            <a
              className="!rounded-full px-3 py-1 hover:bg-neutral-content/10"
              onClick={() => handleDropdownClick("fitness")}
            >
              {t("Fitness")}
            </a>
          </li>
          <li>
            <a
              className="!rounded-full px-3 py-1 hover:bg-neutral-content/10"
              onClick={() => handleDropdownClick("rarity")}
            >
              {t("Rarity")}
            </a>
          </li>
        </ul>
      </div>

      <button
        className="btn btn-circle btn-primary btn-sm aspect-square"
        onClick={changeSortDirection}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="24"
        >
          {sortKey.split("-")[1] === "asc" ? (
            <>
              <title>sort-ascending</title>
              <path d="M11,15L11,19C11,20.104 10.104,21 9,21L7,21C5.896,21 5,20.104 5,19L5,15C5,13.896 5.896,13 7,13L9,13C10.104,13 11,13.896 11,15ZM9,15L7,15L7,19L9,19L9,15Z" />
              <path d="M5,5C5,3.896 5.896,3 7,3L9,3C10.104,3 11,3.896 11,5L11,9C11,10.104 10.104,11 9,11L5,11L5,9L9,9L9,8L7,8C5.896,8 5,7.104 5,6L5,5ZM9,6L9,5L7,5L7,6L9,6Z" />
              <path d="M16,9L16,21L14,21L14,3L20,9L16,9Z" />
            </>
          ) : (
            <>
              <title>sort-descending</title>
              <path d="M11,15L11,19C11,20.104 10.104,21 9,21L7,21C5.896,21 5,20.104 5,19L5,15C5,13.896 5.896,13 7,13L9,13C10.104,13 11,13.896 11,15ZM9,15L7,15L7,19L9,19L9,15Z" />
              <path d="M5,5C5,3.896 5.896,3 7,3L9,3C10.104,3 11,3.896 11,5L11,9C11,10.104 10.104,11 9,11L5,11L5,9L9,9L9,8L7,8C5.896,8 5,7.104 5,6L5,5ZM9,6L9,5L7,5L7,6L9,6Z" />
              <path d="M16,15L20,15L14,21L14,3L16,3L16,15Z" />
            </>
          )}
        </svg>
      </button>
      <div
        className="tooltip flex items-center"
        data-tip={
          showSelected
            ? t("show_selected", { ns: "artifacts" })
            : t("show_unselected", { ns: "artifacts" })
        }
      >
        <label className="swap swap-rotate">
        <input
          type="checkbox"
          checked={showSelected}
          onChange={() => setShowSelected(!showSelected)}
        />
        <SelectionAll className="swap-on" size={32} />
        <SelectionSlash className="swap-off" size={32} />

        </label>
      </div>
    </div>
  );
};

export default ArtifactSortSelect;
