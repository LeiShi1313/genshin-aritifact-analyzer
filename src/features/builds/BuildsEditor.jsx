import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { toggleAllBuilds } from "../../store/reducers/build";
import { Build } from "../../genshin/build";
import { AttributePosition } from "../../genshin/attribute";
import BuildRow from "./BuildRow";

const BuildsEditor = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const builds = useSelector((state) => state.build.builds);
  const config = useSelector((state) => state.build.config);
  const presets = useSelector((state) => state.presets.builds);

  const presetsAllEnabled = useMemo(() => Object.keys(presets).every((hash) => config[hash] && config[hash].enabled), [config, presets]);
  const toggleAllPresets = () => dispatch(toggleAllBuilds({ hashes: Object.keys(presets), enabled: !presetsAllEnabled }));

  return (
    <div className="w-full overflow-x-auto">
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
            <BuildRow key={idx} build={build} />
          ))}
          <tr className="flex md:table-row">
            <th colSpan={8} className="flex md:table-cell">
              <div className="divider">
                {t("Presets")}
                <div className="tooltip tooltip-right" data-tip={t("Enable all presets")}>
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
