import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import classNames from "classnames";

import { Character } from "../../genshin/character";
import { Weapon } from "../../genshin/weapon";
import { Set } from "../../genshin/set";
import { AttributeType } from "../../genshin/attribute";
import { hashBuild } from "../../utils/hash";
import { toggleBuild  } from "../../store/reducers/build";
import { encodeBuild } from "../../utils/build";

const badgeByIdx = (idx) =>
  idx === 0
    ? "badge-secondary"
    : idx === 1
      ? "badge-accent"
      : "badge-ghost";
const mapWeapons = (weapons) =>
  weapons.map((weapon, idx) => (
    <span
      key={weapon}
      className={classNames("badge", "text-xs", badgeByIdx(idx))}
    >
      {t(`${Weapon[weapon].toLowerCase()}`, { ns: "weapons" })}
    </span>
  ));

const mapSuits = (suits) =>
  suits.map((suit, idx) => (
    <span key={idx} className={classNames("badge", "text-xs", badgeByIdx(idx))}>
    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
      {suit.setCombos
        .map((setCombo, idx) => setCombo.set)
        .map((set) => t(`${Set[set].toLowerCase()}`, { ns: "sets" }))
        .join(" + ")}
    </span>
    </span>
  ));

const mapAttrs = (attrs) =>
  attrs.map((attr, idx) => (
    <span
      className={classNames("badge", "text-xs", badgeByIdx(idx))}
      key={attr}
    >
      {t(`${AttributeType[attr].toLowerCase()}`, { ns: "artifacts" })}
    </span>
  ));

const BuildRow = ({ build, setPendingDelete, isPreset = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { config } = useSelector((state) => state.build);
  const [encodedBuild, setEncodedBuild] = useState("");
  const [hash, setHash] = useState("");

  const handleCheck = (e) => {
    dispatch(toggleBuild({ hash, enabled: e.target.checked }));
  };

  useEffect(() => {
    setHash(hashBuild(build));
    setEncodedBuild(encodeBuild(build));
    // console.log(`// ${t(Character[build.character].toLowerCase(), {
    //   ns: "characters",
    // })} ${build.name ? build.name : t("Unnamed Build")}`)
    // console.log(encodeBuild(build))
  }, [build]);

  return (
      <tr className="flex w-full flex-col items-center md:table-row md:items-start">
        <th className="flex w-full flex-row items-center justify-between md:table-cell md:w-auto">
          <span className="w-24 md:hidden">{t("Enabled")}</span>
          <label>
            <input
              type="checkbox"
              className="checkbox"
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
                <img
                  src={
                    new URL(
                      `../../assets/characters/${Character[
                        build.character
                      ].toLocaleLowerCase()}_icon.png`,
                      import.meta.url
                    ).href
                  }
                  alt={Character[build.character]}
                />
              </div>
            </div>
            <div>
              <div className="font-bold">
                {build.name ? build.name : t("Unnamed Build")}
              </div>
              <div className="text-sm opacity-50">
                {t(Character[build.character].toLowerCase(), {
                  ns: "characters",
                })}
              </div>
            </div>
          </div>
        </td>
        <td className="flex w-full flex-row items-center justify-between md:table-cell md:w-auto md:items-start">
          <span className="w-24 md:hidden">{t("Weapons")}</span>
          <div className="flex flex-row items-center md:flex-col md:items-start md:space-y-1">
            {mapWeapons(build.weapons)}
          </div>
        </td>
        <td className="flex w-full flex-row items-center justify-between md:table-cell md:w-auto">
          <span className="w-24 md:hidden">{t("Sets")}</span>
          <div className="flex flex-row items-center md:flex-col md:items-start md:space-y-1">
            {mapSuits(build.suits)}
          </div>
        </td>
        <td className="flex w-full flex-row items-center justify-between md:table-cell md:w-auto">
          <span className="w-24 md:hidden">
            {t("sands", { ns: "artifacts" })}
          </span>
          <div className="flex flex-row items-center md:flex-col md:items-start md:space-y-1">
            {mapAttrs(build.sandsAttributes)}
          </div>
        </td>
        <td className="flex w-full flex-row items-center justify-between md:table-cell md:w-auto">
          <span className="w-24 md:hidden">
            {t("goblet", { ns: "artifacts" })}
          </span>
          <div className="flex flex-row items-center md:flex-col md:items-start md:space-y-1">
            {mapAttrs(build.gobletAttributes)}
          </div>
        </td>
        <td className="flex w-full flex-row items-center justify-between md:table-cell md:w-auto">
          <span className="w-24 md:hidden">
            {t("circlet", { ns: "artifacts" })}
          </span>
          <div className="flex flex-row items-center md:flex-col md:items-start md:space-y-1">
            {mapAttrs(build.circletAttributes)}
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
