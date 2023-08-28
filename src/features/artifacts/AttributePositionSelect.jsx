import { useTranslation } from "react-i18next";

import { AttributePosition } from "../../genshin/attribute";
import { enumToIdx } from "../../utils/enum";
import ArtifactPositionIcon from "../../assets/svgs/ArtifactPositionIcon";
import classNames from "classnames";
import IconSet from "../../assets/svgs/IconSet";

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
    <div className="flex w-full justify-between">
      {enumToIdx(AttributePosition).map(
        (key, idx) =>
          idx < 5 && (
            <button
              className={classNames(
                "btn btn-sm w-8 rounded-full !p-0 md:btn-md md:w-12",
                pos === key ? "btn-primary" : "btn-ghost"
              )}
              key={key}
              onClick={() => {
                handleClick(key);
              }}
            >
              <div className="aspect-square w-4 md:w-6">
                {ArtifactPositionIcon[key]}
              </div>
            </button>
          )
      )}
      <button
        className={classNames(
          "btn btn-sm gap-2 rounded-full md:btn-md",
          pos === 0 ? "btn-primary" : "btn-ghost"
        )}
        onClick={() => {
          handleClick(0);
        }}
      >
        <IconSet className="w-4 md:w-6" />
        {t("All")}
      </button>
    </div>
  );
};

export default AttributePositionSelect;
