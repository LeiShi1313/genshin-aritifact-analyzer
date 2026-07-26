import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Check } from "phosphor-react";
import { getBuildName } from "../../utils/build";

const NameEditor = ({ name, setName, isPreset = false }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const displayName = getBuildName(name, t);

  return !isEditing ? (
    <h2 className="card-title">
      {isPreset && <span className="badge badge-primary">{t("Presets")}</span>}
      {displayName}
      <button
        type="button"
        className="btn btn-ghost btn-circle btn-xs"
        aria-label={t("Edit")}
        onClick={() => setIsEditing(true)}
      >
        <Pencil aria-hidden="true" />
      </button>
    </h2>
  ) : (
    <div className="flex flex-row items-center">
      <input
        id="name"
        type="text"
        placeholder={t("Unnamed Build")}
        aria-label={t("Name")}
        className="input input-primary input-ghost input-sm max-w-xs"
        value={name ?? ""}
        autoFocus
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Escape") setIsEditing(false);
        }}
      />
      <button
        type="button"
        className="btn btn-ghost btn-circle btn-xs"
        aria-label={t("Confirm")}
        onClick={() => setIsEditing(false)}
      >
        <Check aria-hidden="true" weight="bold" />
      </button>
    </div>
  );
};

export default NameEditor;
