import { useState, useMemo } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { importBuilds } from "../../store/reducers/build";
import { decodeBuild } from "../../utils/build";
import { hashBuild } from "../../utils/hash";

const RestoreBuildsModal = ({ open, setOpen }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [file, setFile] = useState(null);
  const [pendingBuilds, setPendingBuilds] = useState({});

  const builds = useSelector((state) => state.build.builds);
  const presets = useSelector((state) => state.presets.builds);

  const pendingBuildsLength = useMemo(
    () => Object.keys(pendingBuilds).length,
    [pendingBuilds]
  );
  const pendingBuildsExistLength = useMemo(
    () => Object.keys(pendingBuilds).filter((k) => k in builds).length,
    [pendingBuilds, builds]
  );
  const pendingBuildsExistPresetsLength = useMemo(
    () => Object.keys(pendingBuilds).filter((k) => k in presets).length,
    [pendingBuilds, presets]
  );

  const handleFile = (e) => {
    if (!window.FileReader) {
      alert("No FileReader found, please use another browser and try again");
      return;
    }

    const file = e.target.files[0];
    setFile(file);

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const text = e.target.result;
      const content = JSON.parse(text);

      const _pendingBuilds = {};
      for (const rawBuild of Object.values(content)) {
        const build = decodeBuild(rawBuild);
        const hash = hashBuild(build);
        _pendingBuilds[hash] = build;
      }
      console.log(_pendingBuilds);
      setPendingBuilds(_pendingBuilds);
    };
    fileReader.readAsText(file, "UTF-8");
  };
  return (
    <div
      className={classNames("modal", {
        "modal-open": open,
      })}
    >
      <div className="modal-box">
        <div className="my-5 flex flex-row items-center justify-center">
          <div className="form-control w-full max-w-xs">
            <input
              type="file"
              className="file-input file-input-primary file-input-bordered w-full max-w-xs"
              file={file}
              onChange={handleFile}
            />
            <label className="label flex flex-col items-start">
              <span className="label-text-alt">
                {pendingBuilds && file
                  ? t("Found X builds in file Y", {
                      num: pendingBuildsLength,
                      fileName: file.name,
                    })
                  : t("select or drag builds file you want to import")}
              </span>
              {pendingBuildsExistLength > 0 && (
                <span className="label-text-alt">
                  {t("X in your custom builds", {
                    num: pendingBuildsExistLength,
                  })}
                </span>
              )}
              {pendingBuildsExistPresetsLength > 0 && (
                <span className="label-text-alt">
                  {t("X in preset builds", {
                    num: pendingBuildsExistPresetsLength,
                  })}
                </span>
              )}
            </label>
          </div>
        </div>
        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={() => {
              setPendingBuilds({});
              setFile(null);
              setOpen(false);
            }}
          >
            {t("Cancel")}
          </button>
          <button
            className="btn btn-warning tooltip tooltip-left"
            data-tip={t("All your custom builds will be replaced")}
            onClick={() => {
              setOpen(false);
              dispatch(importBuilds({ builds: pendingBuilds, replace: true }))
            }}
          >
            {t("Replace")}
          </button>
          <button
            className="btn btn-info"
            onClick={() => {
              setOpen(false);
              dispatch(importBuilds({ builds: pendingBuilds, replace: false }))
            }}
          >
            {t("Merge")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestoreBuildsModal;
