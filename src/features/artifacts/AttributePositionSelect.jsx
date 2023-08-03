import { useTranslation } from "react-i18next";

import { AttributePosition } from "../../genshin/attribute";
import { enumToIdx } from "../../utils/enum";
import ArtifactPositionIcon from "../../assets/svgs/ArtifactPositionIcon";

const AttributePositionSelect = ({ pos, setPos }) => {
  const { t } = useTranslation();

  const handleClick = (value) => {
    setPos(value);

    // Collapse the dropdown list
    const elem = document.activeElement;
    if (elem) {
      elem?.blur();
    }
  };

  return (
    <div className="dropdown z-[41]">
      <label tabIndex="0" className="btn btn-ghost m-1">
        <span className="flex items-center">
          {pos > 0 && pos < 6 ? (
            <>
              <div className="mr-1 inline-block aspect-square w-8 p-1.5">
                {ArtifactPositionIcon[pos]}
              </div>
              {t(AttributePosition[pos].toLowerCase(), { ns: "artifacts" })}
            </>
          ) : (
            <>
              {t("Pick one")} {t("position", { ns: "artifacts" })}
            </>
          )}
        </span>
      </label>
      <ul
        tabIndex="0"
        className="dropdown-content menu rounded-box max-h-96 w-max flex-nowrap overflow-auto bg-base-100 p-2 text-sm shadow"
      >
        {enumToIdx(AttributePosition).map(
          (key, idx) =>
            idx < 5 && (
              <li key={key}>
                <a
                  className="p-0 px-2"
                  onClick={() => {
                    handleClick(key);
                  }}
                >
                  <div className="aspect-square w-8 p-1.5">
                    {ArtifactPositionIcon[key]}
                  </div>
                  {t(AttributePosition[key].toLowerCase(), { ns: "artifacts" })}
                </a>
              </li>
            )
        )}
      </ul>
    </div>
  );
};

export default AttributePositionSelect;
