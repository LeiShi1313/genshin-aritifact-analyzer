import { useTranslation } from "react-i18next";

import { AttributePosition } from "../../genshin/attribute";
import { enumToIdx } from "../../utils/enum";

const AttributePositionSelect = ({ pos, setPos }) => {
  const { t } = useTranslation();
  return (
      <select
        className="select select-ghost select-sm"
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
      >
        <option disabled value={0}>
          {t("Pick one")} {t("position", { ns: "artifacts"})}
        </option>
        {enumToIdx(AttributePosition)
          .map((key) => (
            <option key={key} value={key}>
              {t(AttributePosition[key].toLowerCase(), { ns: "artifacts" })}
            </option>
          ))}
      </select>
  );
};

export default AttributePositionSelect;
