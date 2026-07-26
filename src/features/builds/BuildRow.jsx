import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { Character } from "../../genshin/character";
import { Weapon } from "../../genshin/weapon";
import { Set } from "../../genshin/set";
import { AttributeType } from "../../genshin/attribute";
import { hashBuild } from "../../utils/hash";
import { toggleBuild } from "../../store/reducers/build";
import { encodeBuild, getBuildDisplayName } from "../../utils/build";

const badgeByIdx = (idx) =>
  idx === 0
    ? "badge-secondary"
    : idx === 1
      ? "badge-accent"
      : "badge-ghost";

const badgeClass = (idx) =>
  classNames(
    "badge",
    "text-xs",
    "h-auto",
    "max-w-full",
    "whitespace-normal",
    "py-1",
    badgeByIdx(idx)
  );

const mapWeapons = (weapons, t) =>
  weapons
    .filter((weapon) => Weapon[weapon])
    .map((weapon, idx) => (
      <span key={weapon} className={badgeClass(idx)}>
        {t(Weapon[weapon].toLowerCase(), { ns: "weapons" })}
      </span>
    ));

const mapSuits = (suits, t) =>
  suits.map((suit, idx) => (
    <span
      key={suit.setCombos.map((setCombo) => setCombo.set).join("-") || idx}
      className={badgeClass(idx)}
    >
      <span className="overflow-hidden text-ellipsis">
        {suit.setCombos
          .map((setCombo) => setCombo.set)
          .filter((set) => Set[set])
          .map((set) => t(Set[set].toLowerCase(), { ns: "sets" }))
          .join(" + ")}
      </span>
    </span>
  ));

const mapAttrs = (attrs, t) =>
  attrs
    .filter((attr) => AttributeType[attr])
    .map((attr, idx) => (
      <span className={badgeClass(idx)} key={attr}>
        {t(AttributeType[attr].toLowerCase(), { ns: "artifacts" })}
      </span>
    ));

const BuildRow = ({ build, setPendingDelete, isPreset = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { config } = useSelector((state) => state.build);
  const hash = useMemo(() => hashBuild(build), [build]);
  const encodedBuild = useMemo(() => encodeBuild(build), [build]);
  const characterKey = Character[build.character]?.toLowerCase();

  const handleCheck = (e) => {
    dispatch(toggleBuild({ hash, enabled: e.target.checked }));
  };

  return (
      <tr className="flex w-full flex-col items-center md:table-row md:items-start">
        <th className="flex w-full flex-row items-center justify-between md:table-cell md:w-auto">
          <span className="w-24 md:hidden">{t("Enabled")}</span>
          <label>
            <input
              type="checkbox"
              className="checkbox"
              aria-label={t("Enabled")}
              checked={config[hash]?.enabled ?? false}
              onChange={handleCheck}
            />
          </label>
        </th>
        <td className="flex w-full flex-row items-center justify-between md:table-cell md:w-auto">
          <span className="w-24 md:hidden">{t("Name")}</span>
          <div className="flex items-center space-x-3">
            <div className="avatar">
              <div className="mask mask-squircle h-12 w-12">
                {characterKey && (
                  <img
                    src={
                      new URL(
                        `../../assets/characters/${characterKey}_icon.png`,
                        import.meta.url
                      ).href
                    }
                    alt=""
                  />
                )}
              </div>
            </div>
            <div>
              <div className="font-bold">
                {getBuildDisplayName(build, t)}
              </div>
              <div className="text-sm opacity-50">
                {characterKey ? t(characterKey, { ns: "characters" }) : "—"}
              </div>
            </div>
          </div>
        </td>
        <td className="flex w-full flex-row items-center justify-between md:table-cell md:w-auto md:items-start">
          <span className="w-24 md:hidden">{t("Weapons")}</span>
          <div className="flex flex-row flex-wrap items-center gap-1 md:flex-col md:items-start">
            {mapWeapons(build.weapons, t)}
          </div>
        </td>
        <td className="flex w-full flex-row items-center justify-between md:table-cell md:w-auto">
          <span className="w-24 md:hidden">{t("Sets")}</span>
          <div className="flex flex-row flex-wrap items-center gap-1 md:flex-col md:items-start">
            {mapSuits(build.suits, t)}
          </div>
        </td>
        <td className="flex w-full flex-row items-center justify-between md:table-cell md:w-auto">
          <span className="w-24 md:hidden">
            {t("sands", { ns: "artifacts" })}
          </span>
          <div className="flex flex-row flex-wrap items-center gap-1 md:flex-col md:items-start">
            {mapAttrs(build.sandsAttributes, t)}
          </div>
        </td>
        <td className="flex w-full flex-row items-center justify-between md:table-cell md:w-auto">
          <span className="w-24 md:hidden">
            {t("goblet", { ns: "artifacts" })}
          </span>
          <div className="flex flex-row flex-wrap items-center gap-1 md:flex-col md:items-start">
            {mapAttrs(build.gobletAttributes, t)}
          </div>
        </td>
        <td className="flex w-full flex-row items-center justify-between md:table-cell md:w-auto">
          <span className="w-24 md:hidden">
            {t("circlet", { ns: "artifacts" })}
          </span>
          <div className="flex flex-row flex-wrap items-center gap-1 md:flex-col md:items-start">
            {mapAttrs(build.circletAttributes, t)}
          </div>
        </td>
        <th className="flex w-full flex-row items-center justify-center md:table-cell md:w-auto">
          {isPreset ? (
            <button
              className="btn btn-primary btn-sm md:btn-ghost md:btn-xs"
              onClick={() => navigate(`/build?build=${encodedBuild}`)}
            >
              {t("Clone")}
            </button>
          ) : (
            <div className="flex flex-row md:flex-col md:items-start md:space-y-1">
              <button
                className="btn btn-primary btn-sm md:btn-ghost md:btn-xs"
                onClick={() => navigate(`/build?id=${hash}&build=${encodedBuild}`)}
              >
                {t("Edit")}
              </button>
              <button
                className="btn btn-error btn-sm md:btn-ghost md:btn-xs"
                onClick={() => setPendingDelete(build)}
              >
                {t("Delete")}
              </button>
            </div>
          )}
        </th>
      </tr>
  );
};

export default BuildRow;
