import { useTranslation } from "react-i18next";

import { Character } from "../../genshin/character";
import { enumToIdx } from "../../utils/enum";

const CharacterSelect = ({ char, setChar }) => {
  const { t } = useTranslation();
  return (
      <select
        className="select select-ghost select-sm"
        value={char}
        onChange={(e) => setChar(Number(e.target.value))}
      >
        <option disabled value={0}>
          {t("Pick one")}{t("Character")}
        </option>
        {enumToIdx(Character)
          .map((key) => (
            <option key={key} value={key}>
              {t(Character[key].toLowerCase(), { ns: "characters" })}
            </option>
          ))}
      </select>
  );
};

export default CharacterSelect;
