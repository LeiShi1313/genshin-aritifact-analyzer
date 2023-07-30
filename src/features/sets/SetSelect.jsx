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
    <div className="dropdown z-[100]">
      <label tabIndex="0" className="btn btn-ghost m-1">
        <span>
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
        </span>
      </label>
      <ul
        tabIndex="0"
        className="dropdown-content menu rounded-box max-h-96 w-max flex-nowrap overflow-auto bg-base-100 p-2 text-sm shadow"
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
                className="p-0"
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
