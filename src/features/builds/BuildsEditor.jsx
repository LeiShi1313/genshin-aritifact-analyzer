import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { useSelector, useDispatch } from "react-redux";
import { toggleAllBuilds, removeBuild } from "../../store/reducers/build";
import { Build } from "../../genshin/build";
import { Character } from "../../genshin/character";
import { AttributePosition } from "../../genshin/attribute";
import { encodeBuild, getBuildShortName } from "../../utils/build";
import BuildRow from "./BuildRow";
import RestoreBuildsModal from "./RestoreBuildsModal";

const BuildsEditor = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const builds = useSelector((state) => state.build.builds);
  const config = useSelector((state) => state.build.config);
  const presets = useSelector((state) => state.presets.builds);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  const presetsAllEnabled = useMemo(
    () =>
      Object.keys(presets).every(
        (hash) => config[hash] && config[hash].enabled
      ),
    [config, presets]
  );
  const toggleAllPresets = () =>
    dispatch(
      toggleAllBuilds({
        hashes: Object.keys(presets),
        enabled: !presetsAllEnabled,
      })
    );

  const handleBackup = useCallback(() => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        JSON.stringify(
          Object.fromEntries(
            Object.values(builds).map((build) => [
              getBuildShortName(build, t),
              encodeBuild(build),
            ])
          )
        ),
      ],
      { type: "text/json" }
    );
    element.href = URL.createObjectURL(file);
    element.download = "builds.json";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }, [builds, t]);

  return (
    <div className="flex w-full flex-col space-y-2 overflow-x-auto">
      <RestoreBuildsModal open={restoreModalOpen} setOpen={setRestoreModalOpen} />
      {pendingDelete && (
        <div
          className={classNames("modal", {
            "modal-open": pendingDelete !== null,
          })}
        >
          <div className="modal-box">
            <h3 className="text-lg font-bold">
              {t("Are you sure you want to delete")}
            </h3>
            <p className="py-4">
              {t(Character[pendingDelete.character].toLowerCase(), {
                ns: "characters",
              })}{" "}
              {pendingDelete.name ? pendingDelete.name : t("Unnamed Build")}
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setPendingDelete(null)}
              >
                {t("Cancel")}
              </button>
              <button
                className="btn btn-error"
                onClick={() => {
                  dispatch(removeBuild(pendingDelete));
                  setPendingDelete(null);
                }}
              >
                {t("Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
      <table className="xs:w-96 mx-auto flex w-64 flex-col md:table md:w-full">
        <thead className="hidden md:table-header-group">
          <tr className="flex items-center md:table-row">
            <th className="flex md:table-cell">{t("Enabled")}</th>
            <th className="flex md:table-cell">{t("Name")}</th>
            <th className="flex md:table-cell">{t("Weapons")}</th>
            <th className="flex md:table-cell">{t("Sets")}</th>
            <th className="flex md:table-cell">
              {t("sands", { ns: "artifacts" })}
            </th>
            <th className="flex md:table-cell">
              {t("goblet", { ns: "artifacts" })}
            </th>
            <th className="flex md:table-cell">
              {t("circlet", { ns: "artifacts" })}
            </th>
            <th className="flex md:table-cell"></th>
          </tr>
        </thead>
        <tbody className="flex flex-col items-center justify-center space-y-2 md:table-row-group">
          <tr className="flex md:table-row">
            <th colSpan={8} className="flex md:table-cell">
              <div className="divider">
                <button
                  className="btn btn-primary btn-sm"
                  disabled={Object.keys(builds).length === 0}
                  onClick={() => handleBackup()}
                >
                  {t("Backup")}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setRestoreModalOpen(true)}
                >
                  {t("Import")}
                </button>
              </div>
            </th>
          </tr>
          {Object.values(builds).map((build, idx) => (
            <BuildRow
              key={idx}
              build={build}
              setPendingDelete={setPendingDelete}
            />
          ))}
          <tr className="flex md:table-row">
            <th colSpan={8} className="flex md:table-cell">
              <div className="divider">
                {t("Presets")}
                <div
                  className="tooltip tooltip-right"
                  data-tip={t("Enable all presets")}
                >
                  <label className="label cursor-pointer">
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={presetsAllEnabled}
                      onChange={toggleAllPresets}
                    />
                  </label>
                </div>
              </div>
            </th>
          </tr>
          {Object.values(presets).map((build, idx) => (
            <BuildRow key={idx} build={build} isPreset={true} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BuildsEditor;
