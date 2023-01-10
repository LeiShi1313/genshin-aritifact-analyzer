import { useTranslation } from "react-i18next";

import { Set } from "../../genshin/set";
import { enumToIdx } from "../../utils/enum";

const SetSelect = ({ set, setSet }) => {
  const { t } = useTranslation();
  return (
      <select
        className="select select-ghost select-sm"
        value={set}
        onChange={(e) => setSet(Number(e.target.value))}
      >
        <option disabled value={0}>
          {t("Pick one")}{t("Sets")}
        </option>
        {enumToIdx(Set)
          .map((key) => (
            <option key={key} value={key}>
              {t(Set[key].toLowerCase(), { ns: "sets" })}
            </option>
          ))}
      </select>
  );
};

export default SetSelect;
