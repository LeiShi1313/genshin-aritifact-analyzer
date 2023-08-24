import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CaretDown, Activity } from "phosphor-react";
import classNames from "classnames";
import md5 from "crypto-js/md5";

import { deserializeFromMona, deserializeFromGood } from "../utils/artifact";
import { monaPositionToAttributePosition } from "../utils/attribute";
import { uploadArtifacts } from "../store/reducers/uploads";
import IconConfig from "../assets/svgs/IconConfig";
import IconUpload from "../assets/svgs/IconUpload";
import IconArtifactsFile from "../assets/svgs/IconArtifactsFile";
import IconBuilds from "../assets/svgs/IconBuilds";

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
      let content;
      try {
        content = JSON.parse(text);
      } catch (_) {
        alert(t("Unsupported file format, please use supported file format"));
        return;
      }
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
        alert(t("Unsupported file format, please use supported file format"));
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
        <h1 className="mb-10 text-4xl md:text-5xl font-bold">
          {t("Genshin Artifacts Analyzer")}
        </h1>
        <div className="flex flex-col items-stretch justify-center gap-2">
          <button
            className={classNames(
              "btn btn-accent justify-between rounded-full",
              {
                loading: fileLoading,
                "cursor-pointer": !fileLoading,
                "cursor-not-allowed": fileLoading,
              }
            )}
            onClick={() => document.getElementById("file_input").click()}
          >
            <IconUpload />
            {t("Upload Your Artifacts")}
            <div className="w-8" />
          </button>
          <input
            className="hidden"
            id="file_input"
            type="file"
            onChange={handleFile}
          />

          <button
            className="btn btn-primary justify-between rounded-full"
            onClick={() => navigate("/uploaded")}
          >
            <IconArtifactsFile />
            {t("Uploaded Artifacts")}
            <div className="w-8" />
          </button>

          <button
            className="btn btn-primary justify-between rounded-full"
            onClick={() => navigate("/builds")}
          >
            <IconBuilds />
            {t("Edit Builds")}
            <div className="w-8" />
          </button>

          <div
            className="tooltip tooltip-left tooltip-primary self-end"
            data-tip={t("Adjust Config")}
          >
            <button
              className="btn btn-ghost btn-circle"
              onClick={() => navigate("/config")}
            >
              <IconConfig />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center"></div>
      </div>
    </div>
  );
};

export default Main;
