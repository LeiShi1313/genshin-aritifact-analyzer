import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Check } from "phosphor-react";

const NameEditor = ({ name, setName, isPreset=false }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  return !isEditing ? (
    <h2 className="card-title">
      {isPreset && <span className="badge badge-primary">{t("Presets")}</span>}
      {name ? t(name) : t("Unnamed Build")}
      <Pencil className="cursor-pointer" onClick={() => setIsEditing(true)} />
    </h2>
  ) : (
    <div className="flex flex-row items-center">
      <input
        id="name"
        type="text"
        placeholder={t("Unnamed Build")}
        className="input input-primary input-ghost input-sm max-w-xs"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Check className="cursor-pointer" onClick={() => setIsEditing(false)} weight='bold' />
    </div>
  );
};

export default NameEditor;
