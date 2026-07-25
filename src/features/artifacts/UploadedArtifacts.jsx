import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { X, LockOpen, Users, Diamond, Sword, UserCircle, ChartLine } from "phosphor-react";

import { removeUploadedArtifacts } from "../../store/reducers/uploads";

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

const UploadedArtifacts = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const uploaded = useSelector((state) => state.uploads.artifacts);

  const handleDownloadYasLock = (artifacts) => {
    // console.log(artifacts)
    const element = document.createElement("a");
    const file = new Blob(
      [
        JSON.stringify(
          artifacts.map((_, idx) => idx).filter((idx) => artifacts[idx].locked)
        ),
      ],
      { type: "text/json" }
    );
    element.href = URL.createObjectURL(file);
    element.download = "lock.json";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="my-auto flex h-[60vh] w-full flex-col items-center justify-start space-y-2 overflow-y-auto px-4 pb-8">

        {Object.keys(uploaded)
          .filter((key) => uploaded[key].items)
          .map((key) => (
            <div
              className="flex flex-row items-center justify-center gap-2"
              key={key}
            >
              <div
                className="btn btn-primary w-72"
                onClick={() => navigate(`/artifacts/${key}`)}
              >
                <UploadedDetails uploaded={uploaded[key]} />
              </div>
              <div className="tooltip tooltip-bottom z-50" data-tip={t("GCSim")}>
                <ChartLine
                  size={24}
                  weight="bold"
                  className="cursor-pointer text-success"
                  onClick={() => navigate(`/gcsim/teams/${key}`)}
                />
              </div>
              {uploaded[key].characters?.length > 0 && (
                <div
                  className="tooltip tooltip-bottom z-50"
                  data-tip={t("Characters")}
                >
                  <Users
                    size={24}
                    weight="bold"
                    className="cursor-pointer text-secondary"
                    onClick={() => navigate(`/characters/${key}`)}
                  />
                </div>
              )}
              <div className="tooltip tooltip-bottom z-50" data-tip={t("Delete")}>
                <X
                  size={24}
                  weight="bold"
                  className="cursor-pointer text-error"
                  onClick={() => dispatch(removeUploadedArtifacts(key))}
                />
              </div>
              <div className="tooltip tooltip-bottom z-50" data-tip={t("Unlock All")}>
                {uploaded[key].format === "GOOD" && (
                  <LockOpen
                    size={24}
                    weight="bold"
                    className="cursor-pointer text-info"
                    onClick={() => handleDownloadYasLock(uploaded[key].items)}
                  />
                )}
              </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default UploadedArtifacts;
