import { useTranslation } from "react-i18next";

import { Set } from "../../genshin/set";
import { enumToIdx } from "../../utils/enum";
import { AttributePosition } from "../../genshin/attribute";

const SetSelect = ({ set, setSet }) => {
  const { t, i18n } = useTranslation();

  const handleClick = (value) => {
    setSet(value);

    // Collapse the dropdown list
    const elem = document.activeElement;
    if (elem) {
      elem?.blur();
    }
  };

  const getSetIconUrl = (id) => {
    let setId = Set[id].toLocaleLowerCase();
    let posId =
      AttributePosition[setId.startsWith("prayers_") ? 5 : 1].toLowerCase();
    return new URL(
      `../../assets/artifacts/${setId}_${posId}.png`,
      import.meta.url
    ).href;
  };

  return (
    <div className="dropdown z-[42] w-full">
      <label
        tabIndex="0"
        className="btn-primary btn w-full flex-nowrap justify-start overflow-hidden text-ellipsis rounded-full text-left normal-case"
      >
        {set !== 0 ? (
          <>
            <img
              className="mr-1 inline-block aspect-square w-8"
              src={getSetIconUrl(set)}
            />
            {t(Set[set].toLowerCase(), { ns: "sets" })}
          </>
        ) : (
          <>
            {t("Pick one")} {t("set")}
          </>
        )}
        <span className="grow" />
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
        className="dropdown-content menu rounded-box mt-1 max-h-96 w-full flex-nowrap overflow-auto bg-primary p-2 text-sm text-primary-content shadow"
      >
        {[...enumToIdx(Set)]
          .sort((a, b) =>
            t(Set[a].toLowerCase(), { ns: "sets" }).localeCompare(
              t(Set[b].toLowerCase(), { ns: "sets" }),
              i18n.language
            )
          )
          .map((key) => (
            <li key={key}>
              <a
                className="overflow-hidden text-ellipsis !rounded-full p-0 px-2 hover:bg-primary-content/10"
                onClick={() => {
                  handleClick(key);
                }}
              >
                <img className="aspect-square w-8" src={getSetIconUrl(key)} />
                {t(Set[key].toLowerCase(), { ns: "sets" })}
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default SetSelect;
