import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { importBuilds } from "../../store/reducers/build";
import { decodeBuild } from "../../utils/build";
import { hashBuild } from "../../utils/hash";
import { createLatestFileReadGuard } from "./latestFileRead";

const RestoreBuildsModal = ({ open, setOpen }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const dialogRef = useRef(null);
  const [file, setFile] = useState(null);
  const [pendingBuilds, setPendingBuilds] = useState({});
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);
  const fileReaderRef = useRef(null);
  const readGuardRef = useRef(createLatestFileReadGuard());

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

  const abortPendingRead = useCallback(() => {
    readGuardRef.current.invalidate();
    const fileReader = fileReaderRef.current;
    fileReaderRef.current = null;
    if (fileReader?.readyState === 1) fileReader.abort();
  }, []);
  const resetImportState = useCallback(() => {
    abortPendingRead();
    setPendingBuilds({});
    setFile(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [abortPendingRead]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
    if (!open) resetImportState();
  }, [open, resetImportState]);
  useEffect(() => () => abortPendingRead(), [abortPendingRead]);

  const handleFile = (e) => {
    abortPendingRead();
    setPendingBuilds({});
    setFileError("");
    if (!window.FileReader) {
      setFileError(t("This browser cannot read build backup files"));
      return;
    }

    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }
    setFile(selectedFile);

    const fileReader = new FileReader();
    const readToken = readGuardRef.current.begin();
    fileReaderRef.current = fileReader;
    const isCurrentRead = () =>
      readGuardRef.current.isCurrent(readToken) &&
      fileReaderRef.current === fileReader;
    fileReader.onload = (event) => {
      if (!isCurrentRead()) return;
      try {
        const text = event.target?.result;
        if (typeof text !== "string") throw new TypeError("Invalid file data");
        const content = JSON.parse(text);
        if (!content || typeof content !== "object" || Array.isArray(content)) {
          throw new TypeError("Invalid backup object");
        }

        const nextBuilds = {};
        for (const rawBuild of Object.values(content)) {
          if (typeof rawBuild !== "string") {
            throw new TypeError("Invalid encoded build");
          }
          const build = decodeBuild(rawBuild);
          const hash = hashBuild(build);
          nextBuilds[hash] = build;
        }
        if (Object.keys(nextBuilds).length === 0) {
          throw new TypeError("Empty build backup");
        }
        setPendingBuilds(nextBuilds);
      } catch {
        setPendingBuilds({});
        setFileError(t("Build backup file is invalid"));
      } finally {
        if (isCurrentRead()) fileReaderRef.current = null;
      }
    };
    fileReader.onerror = () => {
      if (!isCurrentRead()) return;
      fileReaderRef.current = null;
      setPendingBuilds({});
      setFileError(t("Build backup file is invalid"));
    };
    fileReader.readAsText(selectedFile, "UTF-8");
  };
  const closeModal = () => {
    resetImportState();
    setOpen(false);
  };
  const handleImport = (replace) => {
    if (pendingBuildsLength === 0) return;
    dispatch(importBuilds({ builds: pendingBuilds, replace }));
    closeModal();
  };
  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-label={t("Import")}
      onClose={() => setOpen(false)}
    >
      <div className="modal-box">
        <div className="my-5 flex flex-row items-center justify-center">
          <div className="form-control w-full max-w-xs">
            <input
              ref={fileInputRef}
              type="file"
              className="file-input-primary file-input w-full max-w-xs"
              aria-label={t("select or drag builds file you want to import")}
              onChange={handleFile}
            />
            <div className="label flex flex-col items-start">
              <span className="text-xs">
                {pendingBuildsLength > 0 && file
                  ? t("Found X builds in file Y", {
                      num: pendingBuildsLength,
                      fileName: file.name,
                    })
                  : t("select or drag builds file you want to import")}
              </span>
              {pendingBuildsExistLength > 0 && (
                <span className="text-xs">
                  {t("X in your custom builds", {
                    num: pendingBuildsExistLength,
                  })}
                </span>
              )}
              {pendingBuildsExistPresetsLength > 0 && (
                <span className="text-xs">
                  {t("X in preset builds", {
                    num: pendingBuildsExistPresetsLength,
                  })}
                </span>
              )}
            </div>
            {fileError && (
              <p className="text-error mt-2 text-sm" role="alert">
                {fileError}
              </p>
            )}
          </div>
        </div>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={closeModal}>
            {t("Cancel")}
          </button>
          <div
            className="tooltip tooltip-left"
            data-tip={t("All your custom builds will be replaced")}
          >
            <button
              type="button"
              className="btn btn-warning"
              disabled={pendingBuildsLength === 0}
              onClick={() => handleImport(true)}
            >
              {t("Replace")}
            </button>
          </div>
          <button
            type="button"
            className="btn btn-info"
            disabled={pendingBuildsLength === 0}
            onClick={() => handleImport(false)}
          >
            {t("Merge")}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" aria-label={t("Cancel")}>
          {t("Cancel")}
        </button>
      </form>
    </dialog>
  );
};

export default RestoreBuildsModal;
