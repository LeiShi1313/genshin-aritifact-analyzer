import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { useSelector, useDispatch } from "react-redux";
import { toggleAllBuilds, removeBuild } from "../../store/reducers/build";
import { Build } from "../../genshin/build";
import { Character } from "../../genshin/character";
import { AttributePosition } from "../../genshin/attribute";
import BuildRow from "./BuildRow";

const BuildsEditor = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const builds = useSelector((state) => state.build.builds);
  const config = useSelector((state) => state.build.config);
  const presets = useSelector((state) => state.presets.builds);
  const [pendingDelete, setPendingDelete] = useState(null);

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

  return (
    <div className="w-full overflow-x-auto">
    {pendingDelete && (
      <div className={classNames("modal", { "modal-open": pendingDelete !== null })}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">{t('Are you sure you want to delete')}</h3>
          <p className="py-4">{t(Character[pendingDelete.character].toLowerCase(), {
            ns: "characters",
          })} {pendingDelete.name ? pendingDelete.name : t("Unnamed Build")}</p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setPendingDelete(null)}>{t('Cancel')}</button>
            <button className="btn btn-error" onClick={() => {dispatch(removeBuild(pendingDelete));setPendingDelete(null);}}>{t('Confirm')}</button>
          </div>
        </div>
      </div>)}
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
          {Object.values(builds).map((build, idx) => (
            <BuildRow key={idx} build={build} setPendingDelete={setPendingDelete} />
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
