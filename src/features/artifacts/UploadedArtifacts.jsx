import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { X, LockOpen } from "phosphor-react";

import { removeUploadedArtifacts } from "../../store/reducers/uploads";

const UploadedDetails = ({ uploaded }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="flex w-full flex-col items-center justify-center space-y-1 text-ellipsis">
      {uploaded.name && (
        <span className="w-full truncate">{uploaded.name}</span>
      )}
      <div className="flex flex-col items-center justify-center space-x-1 text-xs md:flex-row">
        {uploaded.date && <span>{uploaded.date.toLocaleString()}</span>}
        <span>
          {t("Total")}: {uploaded.items.length}
        </span>
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
      <div className="my-auto flex h-[60vh] w-full flex-col items-center justify-start  space-y-2 overflow-auto">
          
        {Object.keys(uploaded)
          .filter((key) => uploaded[key].items)
          .map((key) => (
            <div
              className="flex flex-row items-center justify-center"
              key={key}
            >
              <div
                className="btn btn-primary w-72"
                onClick={() => navigate(`/artifacts/${key}`)}
              >
                <UploadedDetails uploaded={uploaded[key]} />
              </div>
              <div className="tooltip" data-tip={t("Delete")}>
                <X
                  size={24}
                  weight="bold"
                  className="cursor-pointer text-error"
                  onClick={() => dispatch(removeUploadedArtifacts(key))}
                />
              </div>
              <div className="tooltip" data-tip={t("Unlock All")}>
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
