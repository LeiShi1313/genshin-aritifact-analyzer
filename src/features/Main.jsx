import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { ChartLine, Users } from "phosphor-react";
import md5 from "crypto-js/md5";

import { parseImportFile } from "../utils/import";
import { uploadArtifacts } from "../store/reducers/uploads";
import { getGenshinGameVersion } from "../utils/genshindb";
import IconConfig from "../assets/svgs/IconConfig";
import IconUpload from "../assets/svgs/IconUpload";
import IconArtifactsFile from "../assets/svgs/IconArtifactsFile";
import IconBuilds from "../assets/svgs/IconBuilds";
import { getLatestCharacterSource } from "./characters/showcase/characterShowcaseModel";

const Main = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const uploads = useSelector((state) => state.uploads.artifacts);
  const latestCharacterSource = getLatestCharacterSource(uploads);

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
    if (!file) {
      setFileLoading(false);
      return;
    }
    setFile(file);

    const fileReader = new FileReader();
    fileReader.onerror = () => {
      setFileLoading(false);
      alert(t("Unsupported file format, please use supported file format"));
    };
    fileReader.onload = (e) => {
      const text = e.target.result;
      const key = md5(text).toString();
      let content;
      try {
        content = JSON.parse(text);
      } catch (_) {
        setFileLoading(false);
        alert(t("Unsupported file format, please use supported file format"));
        return;
      }

      const result = parseImportFile(content);
      if (!result.format) {
        setFileLoading(false);
        alert(t("Unsupported file format, please use supported file format"));
        return;
      }

      dispatch(
        uploadArtifacts({
          key,
          artifacts: result.artifacts,
          format: result.format,
          name: file.name,
          characters: result.characters,
          weapons: result.weapons,
        })
      );
      setFileLoading(false);
      navigate(
        result.characters?.length > 0 ? `/characters/${key}` : "/uploaded"
      );
    };
    fileReader.readAsText(file, "UTF-8");
  };

  return (
    <div className="hero-content h-full text-center">
      <div className="max-w-md">
        <h1 className="flex flex-row mb-10 text-4xl md:text-5xl font-bold items-center">
          {t("Genshin Artifacts Analyzer")}
          <div className="badge badge-primary self-start">{getGenshinGameVersion()}</div>
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

          {latestCharacterSource && (
            <button
              className="btn btn-primary justify-between rounded-full"
              onClick={() =>
                navigate(`/characters/${latestCharacterSource.id}`)
              }
            >
              <Users size={20} weight="bold" />
              {t("Characters")}
              <div className="w-8" />
            </button>
          )}

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

          <button
            className="btn btn-primary justify-between rounded-full"
            onClick={() => navigate("/gcsim")}
          >
            <ChartLine size={20} weight="bold"/>
            {t("DPS Simulator")}&nbsp;(gcsim)
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
