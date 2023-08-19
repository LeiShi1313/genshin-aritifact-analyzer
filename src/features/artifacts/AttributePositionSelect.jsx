import { useTranslation } from "react-i18next";

import { AttributePosition } from "../../genshin/attribute";
import { enumToIdx } from "../../utils/enum";
import ArtifactPositionIcon from "../../assets/svgs/ArtifactPositionIcon";
import IconReset from "../../assets/svgs/IconReset";
import classNames from "classnames";

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
                "btn btn-circle",
                pos === key ? "btn-primary" : "btn-ghost"
              )}
              key={key}
              onClick={() => {
                handleClick(key);
              }}
            >
              <div className="aspect-square w-6">
                {ArtifactPositionIcon[key]}
              </div>
            </button>
          )
      )}
      <button
        className={classNames(
          "btn gap-2 rounded-full",
          pos === 0 ? "btn-primary" : "btn-ghost"
        )}
        onClick={() => {
          handleClick(0);
        }}
      >
        <IconReset />
        {t("All")}
      </button>
    </div>
  );
};

export default AttributePositionSelect;
