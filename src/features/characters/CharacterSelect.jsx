import { useTranslation } from "react-i18next";

import { Character } from "../../genshin/character";
import { enumToIdx } from "../../utils/enum";

const CharacterSelect = ({ char, setChar }) => {
  const { t, i18n } = useTranslation();
  return (
    <select
      className="select select-ghost select-sm"
      value={char}
      onChange={(e) => setChar(Number(e.target.value))}
    >
      <option disabled value={0}>
        {t("Pick one")}
        {t("Character")}
      </option>
      {[...enumToIdx(Character)]
        .sort((a, b) =>
          t(Character[a].toLowerCase(), { ns: "characters" }).localeCompare(
            t(Character[b].toLowerCase(), { ns: "characters" }),
            i18n.language
          )
        )
        .map((key) => (
          <option key={key} value={key}>
            {t(Character[key].toLowerCase(), { ns: "characters" })}
          </option>
        ))}
    </select>
  );
};

export default CharacterSelect;
