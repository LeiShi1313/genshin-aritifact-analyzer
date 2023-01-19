import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CaretDown, Activity } from "phosphor-react";
import classNames from "classnames";
import md5 from "crypto-js/md5";

import { deserializeFromMona, deserializeFromGood } from "../utils/artifact";
import { monaPositionToAttributePosition } from "../utils/attribute";
import { uploadArtifacts } from "../store/reducers/uploads";

const Main = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleFile = (e) => {
    if (!window.FileReader) {
      alert("No FileReader found, please use another browser and try again");
      return;
    }
    setFileLoading(true);

    const file = e.target.files[0];
    setFile(file);

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const text = e.target.result;
      const key = md5(text).toString();
      const content = JSON.parse(text);
      const artifacts = [];

      let format = null;
      if (content["format"] === "GOOD") {
        format = "GOOD";
        for (const art of content["artifacts"]) {
          const a = deserializeFromGood(art);
          artifacts.push(deserializeFromGood(art));
        }
      } else if (
        content["version"] === "1" &&
        Object.keys(monaPositionToAttributePosition).every((k) => k in content)
      ) {
        format = "YAS";
        for (const k of Object.keys(content)) {
          if (k === "version") continue;
          for (const art of content[k]) {
            artifacts.push(deserializeFromMona(art));
          }
        }
      } else {
        alert("Unsupported file format, please use supported file format");
        return;
      }
      dispatch(uploadArtifacts({ key, artifacts, format, name: file.name }));
      setFileLoading(false);
      navigate(`/artifacts/${key}`);
    };
    fileReader.readAsText(file, "UTF-8");
  };

  return (
    <div className="hero-content h-full text-center">
      <div className="max-w-md">
        <h1 className="mb-10 text-5xl font-bold">
          {t("Genshin Artifacts Analyzer")}
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
          <div className="tooltip" data-tip={t('Adjust Config')}>
          <button className="btn btn-sm btn-outline btn-circle" onClick={() => navigate('/config')}>
            <Activity size={18} />
          </button>

          </div>

          <div className="btn-group">
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
            <div
              className="btn relative w-1 bg-secondary"
              onClick={() => setShowDropdown((prev) => !prev)}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <button className="rounded-r-lg">
                <CaretDown size={16} />
              </button>
              {showDropdown && (
                <ul className="dropdown-content menu rounded-box absolute -right-1 top-12 w-52 bg-base-200 p-2 shadow">
                  <li>
                    <a onClick={() => navigate("/uploaded")}>
                      {t("Uploaded Artifacts")}
                    </a>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center"></div>
      </div>
    </div>
  );
};

export default Main;
