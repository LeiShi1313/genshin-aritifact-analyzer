import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { X } from "phosphor-react";

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
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="my-auto flex h-full w-full flex-col items-center justify-center  space-y-2">
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
            </div>
          ))}
      </div>
    </div>
  );
};

export default UploadedArtifacts;
