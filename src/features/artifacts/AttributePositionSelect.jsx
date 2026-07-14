import { useTranslation } from "react-i18next";

import { AttributePosition } from "../../genshin/attribute";
import { enumToIdx } from "../../utils/enum";
import ArtifactPositionIcon from "../../assets/svgs/ArtifactPositionIcon";
import classNames from "classnames";
import IconSet from "../../assets/svgs/IconSet";

const AttributePositionSelect = ({ pos, setPos, labelledBy }) => {
  const { t } = useTranslation();

  const handleClick = (value) => {
    setPos(value);
  };

  return (
    <div
      className="grid w-full min-w-0 grid-cols-3 gap-2 sm:flex sm:justify-between"
      role="group"
      aria-labelledby={labelledBy}
    >
      {enumToIdx(AttributePosition).map(
        (key, idx) =>
          idx < 5 && (
            <button
              type="button"
              className={classNames(
                "btn btn-sm min-h-9 md:btn-md w-full rounded-full !p-0 sm:w-9 md:w-12",
                pos === key ? "btn-primary" : "btn-ghost"
              )}
              key={key}
              aria-label={t(AttributePosition[key].toLowerCase(), {
                ns: "artifacts",
              })}
              aria-pressed={pos === key}
              onClick={() => {
                handleClick(key);
              }}
            >
              <div aria-hidden="true" className="aspect-square w-4 md:w-6">
                {ArtifactPositionIcon[key]}
              </div>
            </button>
          )
      )}
      <button
        type="button"
        className={classNames(
          "btn btn-sm min-h-9 md:btn-md w-full gap-2 rounded-full sm:w-auto",
          pos === 0 ? "btn-primary" : "btn-ghost"
        )}
        aria-pressed={pos === 0}
        onClick={() => {
          handleClick(0);
        }}
      >
        <span aria-hidden="true">
          <IconSet className="w-4 md:w-6" />
        </span>
        {t("All")}
      </button>
    </div>
  );
};

export default AttributePositionSelect;
