import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import md5 from "crypto-js/md5";

import { deserializeFromMona } from "../utils/artifact";
import { uploadArtifacts } from "../store/reducers/uploads";

const Main = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);

  const handleFile = (e) => {
    setFileLoading(true);

    const file = e.target.files[0];
    setFile(file);

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const text = e.target.result;
      const key = md5(text).toString();
      const mona = JSON.parse(text);
      const artifacts = [];
      for (const k of Object.keys(mona)) {
        if (k === "version") continue;
        for (const art of mona[k]) {
          artifacts.push(deserializeFromMona(art));
        }
      }
      dispatch(uploadArtifacts({ key, artifacts }));
      setFileLoading(false);
      navigate(`/artifacts/${key}`);
    };
    fileReader.readAsText(file, "UTF-8");
  };

  return (
    <div className="hero-content h-full text-center">
      <div className="max-w-md">
        <h1 className="mb-10 text-5xl font-bold">
          {t("Genshin Artifact Builds Platform")}
        </h1>
        <div className="flex flex-row items-center justify-center space-x-2">
          <div className="relative">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/builds")}
            >
              {t("Edit Builds")}
            </button>
            <a
              className="absolute left-1 top-12 cursor-pointer text-xs text-primary-focus underline"
              onClick={() => navigate("/build")}
            >
              {t("Add New Build")}
            </a>
          </div>
          <span>{t("or")}</span>

          <div>
            <button
              className={
                `btn btn-secondary btn-md rounded-lg ` +
                classNames({
                  loading: fileLoading,
                  "cursor-pointer": !fileLoading,
                  "cursor-not-allowed": fileLoading,
                })
              }
              onClick={() => document.getElementById("file_input").click()}
            >
              {t("Upload Your Artifacts")}
            </button>

            <input
              className="hidden"
              id="file_input"
              type="file"
              onChange={handleFile}
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center"></div>
      </div>
    </div>
  );
};

export default Main;
