import { useTranslation } from "react-i18next";

import { maximumArtifactLevel } from "../../config";

const ArtifactLevelSelect = ({ level, setLevel }) => {
  const { t } = useTranslation();
  return (
      <select
        className="select select-ghost select-sm"
        value={level}
        onChange={(e) => setLevel(Number(e.target.value))}
      >
        <option disabled value={-1}>
          {t("Pick one")} {t("level", { ns: "artifacts"})}
        </option>
        {[...Array(maximumArtifactLevel+1).keys()]
          .map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
      </select>
  );
};

export default ArtifactLevelSelect;
