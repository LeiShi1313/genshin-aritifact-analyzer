import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const UploadedDetails = ({ uploaded }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center space-y-1">
      {uploaded.name && (
        <span>
          {t("File Name")}: {uploaded.name}
        </span>
      )}
      <div className="flex flex-col items-center justify-center space-x-1 md:flex-row">
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
  const navigate = useNavigate();
  const uploaded = useSelector((state) => state.uploads.artifacts);
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="my-auto flex h-full w-full flex-col items-center justify-center  space-y-2">
        {Object.keys(uploaded)
          .filter((key) => uploaded[key].items)
          .map((key) => (
            <div
              className="flex w-12 flex-col items-center justify-center"
              onClick={() => navigate(`/artifacts/${key}`)}
              key={key}
            >
              <div className="btn btn-primary w-72">
                <UploadedDetails uploaded={uploaded[key]} />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default UploadedArtifacts;
