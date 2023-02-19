import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { useSelector, useDispatch } from "react-redux";
import { toggleAllBuilds, removeBuild } from "../../store/reducers/build";
import { Build } from "../../genshin/build";
import { Character } from "../../genshin/character";
import { AttributePosition } from "../../genshin/attribute";
import { encodeBuild, getBuildShortName } from "../../utils/build";
import { enumToIdx } from "../../utils/enum";
import BuildRow from "./BuildRow";
import RestoreBuildsModal from "./RestoreBuildsModal";
import MultiSelect from "../inputs/MultiSelect";

const BuildsEditor = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const builds = useSelector((state) => state.build.builds);
  const config = useSelector((state) => state.build.config);
  const presets = useSelector((state) => state.presets.builds);
  const [characters, setCharacters] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  const existingCharacters = useMemo(
    () =>
      Object.values(builds)
        .map((build) => build.character)
        .concat(Object.values(presets).map((build) => build.character))
        .filter((c, idx, arr) => arr.indexOf(c) === idx),

    [builds, presets]
  );
  const selectedBuilds = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(builds).filter(
          ([_, build]) =>
            characters.length === 0 || characters.includes(build.character)
        )
      ),
    [builds, characters]
  );
  const selectedPresets = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(presets).filter(
          ([_, build]) =>
            characters.length === 0 || characters.includes(build.character)
        )
      ),
    [presets, characters]
  );

  const presetsAllEnabled = useMemo(
    () =>
      Object.keys(selectedPresets).every(
        (hash) => config[hash] && config[hash].enabled
      ),
    [config, selectedPresets]
  );
  const customAllEnabled = useMemo(
    () =>
      Object.keys(selectedBuilds).every(
        (hash) => config[hash] && config[hash].enabled
      ),
    [selectedBuilds, config]
  );

  const toggleAllPresets = () =>
    dispatch(
      toggleAllBuilds({
        hashes: Object.keys(selectedPresets),
        enabled: !presetsAllEnabled,
      })
    );
  const toggleAllCustom = () =>
    dispatch(
      toggleAllBuilds({
        hashes: Object.keys(selectedBuilds),
        enabled: !customAllEnabled,
      })
    );

  const handleBackup = useCallback(() => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        JSON.stringify(
          Object.fromEntries(
            Object.values(selectedBuilds).map((build) => [
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
  }, [selectedBuilds, t]);

  return (
    <div className="flex w-full flex-col space-y-2 overflow-x-auto">
      <RestoreBuildsModal
        open={restoreModalOpen}
        setOpen={setRestoreModalOpen}
      />
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
      <div className="flex flex-col items-center justify-end space-y-2 py-5 md:flex-row md:space-y-0 md:space-x-2">
        <MultiSelect
          values={characters}
          setValues={setCharacters}
          options={enumToIdx(Character).filter((c) =>
            existingCharacters.includes(c)
          )}
          renderFunc={(character) =>
            t(Character[character].toLowerCase(), { ns: "characters" })
          }
          zeroValue={t("Pick") + t("Character")}
        />
      </div>
      <table className="xs:w-96 mx-auto flex min-h-[50vh] w-64 flex-col md:table md:w-full">
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
                  disabled={Object.keys(selectedBuilds).length === 0}
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
                <div
                  className="tooltip tooltip-right"
                  data-tip={characters.length === 0 ? t("Enable all custom builds") : t("Enable selected custom builds")}
                >
                  <label className="label cursor-pointer">
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      disabled={Object.keys(selectedBuilds).length === 0}
                      checked={customAllEnabled}
                      onChange={toggleAllCustom}
                    />
                  </label>
                </div>
              </div>
            </th>
          </tr>
          {Object.values(selectedBuilds).map((build, idx) => (
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
                  data-tip={characters.length === 0 ? t("Enable all presets"): t("Enable selected presets")}
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
          {Object.values(selectedPresets)
            .filter(
              (c) => characters.length === 0 || characters.includes(c.character)
            )
            .map((build, idx) => (
              <BuildRow key={idx} build={build} isPreset={true} />
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default BuildsEditor;
