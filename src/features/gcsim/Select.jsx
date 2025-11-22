import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Diamond, Sword, UserCircle, FileText, Spinner } from "phosphor-react";
import { fetchGCSim } from "../../store/reducers/gcsim";

const UploadedDetails = ({ uploaded }) => {
  const { t } = useTranslation();

  const artifactCount = uploaded.items?.length ?? 0;
  const characterCount = uploaded.characters?.length ?? 0;
  const weaponCount = uploaded.weapons?.length ?? 0;

  return (
    <div className="flex w-full flex-col items-center justify-center text-ellipsis">
      <div className="flex w-full items-center justify-center gap-2">
        {uploaded.format && (
          <span className="badge badge-xs badge-secondary">{uploaded.format}</span>
        )}
        {uploaded.name && (
          <span className="truncate text-sm">{uploaded.name}</span>
        )}
      </div>
      <div className="flex flex-row items-center justify-center gap-2 text-xs opacity-80">
        <span className="flex items-center gap-1" title={t("Artifacts")}>
          <Diamond size={12} weight="fill" className="text-accent" />
          {artifactCount}
        </span>
        {characterCount > 0 && (
          <span className="flex items-center gap-1" title={t("Characters")}>
            <UserCircle size={12} weight="fill" className="text-info" />
            {characterCount}
          </span>
        )}
        {weaponCount > 0 && (
          <span className="flex items-center gap-1" title={t("Weapons")}>
            <Sword size={12} weight="fill" className="text-warning" />
            {weaponCount}
          </span>
        )}
      </div>
    </div>
  );
};

const ScriptsInfo = ({ scripts, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm opacity-70">
        <Spinner size={16} className="animate-spin" />
        {t("Loading gcsim scripts...")}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <FileText size={16} weight="fill" className="text-primary" />
      {t("Loaded X gcsim scripts", { num: scripts.length })}
    </div>
  );
};

const Select = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { scripts, isScriptsLoading } = useSelector((state) => state.gcsim);
  const uploaded = useSelector((state) => state.uploads.artifacts);

  const uploadedKeys = Object.keys(uploaded).filter((key) => uploaded[key].items);

  return (
    <div className="flex w-full max-w-screen-lg flex-col items-center justify-center gap-4 px-4 lg:px-0">
      {/* Scripts info section */}
      <div className="my-4 flex w-full flex-row items-center justify-between">
        <ScriptsInfo scripts={scripts} isLoading={isScriptsLoading} />
        <button
          className="btn btn-primary btn-sm"
          onClick={() => dispatch(fetchGCSim())}
          disabled={isScriptsLoading}
        >
          {t("Refresh")}
        </button>
      </div>

      {/* Uploaded artifacts section */}
      {uploadedKeys.length > 0 && (
        <>
          <div className="divider">{t("Select Uploaded Artifacts")}</div>
          <div className="flex w-full flex-col items-center justify-start gap-2">
            {uploadedKeys.map((key) => (
              <div
                key={key}
                className="btn btn-primary w-72"
                onClick={() => navigate(`/gcsim/teams/${key}`)}
              >
                <UploadedDetails uploaded={uploaded[key]} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {uploadedKeys.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center opacity-70">
          <Diamond size={48} weight="light" />
          <div>{t("No uploaded artifacts")}</div>
          <button
            className="btn btn-accent btn-sm"
            onClick={() => navigate("/")}
          >
            {t("Upload Artifacts")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Select;
