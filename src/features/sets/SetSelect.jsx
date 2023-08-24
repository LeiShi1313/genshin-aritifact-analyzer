import { useTranslation } from "react-i18next";

import { Set, filterBy2PieceBonus } from "../../genshin/set";
import { enumToIdx } from "../../utils/enum";
import { AttributePosition, AttributeType } from "../../genshin/attribute";
import { useState } from "react";
import classNames from "classnames";
import IconClose from "../../assets/svgs/IconClose";
import IconSet from "../../assets/svgs/IconSet";
import IconReset from "../../assets/svgs/IconReset";
import AttributeIcon from "../../assets/svgs/AttributeIcon";
import IconElementalRes from "../../assets/svgs/IconElementalRes";
import IconCRIT from "../../assets/svgs/IconCRIT";
import IconTalents from "../../assets/svgs/IconTalents";
import Icon_Inventory_Artifacts from "../../assets/pngs/Icon_Inventory_Artifacts.png";
import IconShieldStrength from "../../assets/svgs/IconShieldStrength";
import IconTimeReduced from "../../assets/svgs/IconTimeReduced";
import IconAllElementsColored from "../../assets/svgs/IconAllElementsColored";

const iconFilterBy2PieceBonus = {
  elemental_damage: <IconAllElementsColored className="All_Elements" />,
  physical_damage: AttributeIcon(AttributeType.PHYSICAL_DAMAGE_BONUS),
  hp: AttributeIcon(AttributeType.HP),
  atk: AttributeIcon(AttributeType.ATK),
  def: AttributeIcon(AttributeType.DEF),
  em: AttributeIcon(AttributeType.ELEMENTAL_MASTERY),
  crit: <IconCRIT className="CRIT" />,
  healing: AttributeIcon(AttributeType.HEALING_BONUS),
  er: AttributeIcon(AttributeType.ENERGY_RECHARGE),
  shield_strength: <IconShieldStrength className="ShieldStrength" />,
  elemental_res: <IconElementalRes className="Elemental_RES" />,
  talents_damage: <IconTalents className="Talents_DMG" />,
  less_affected_time: <IconTimeReduced className="Less_Affected_Time" />,
};

const SetSelect = ({ set, setSet }) => {
  const { t, i18n } = useTranslation();

  const handleClick = (value) => {
    setSet(value);

    // Collapse the dropdown list
    const elem = document.activeElement;
    if (elem) {
      elem?.blur();
    }
  };

  const getSetIconUrl = (id) => {
    let setId = Set[id].toLocaleLowerCase();
    let posId =
      AttributePosition[setId.startsWith("prayers_") ? 5 : 1].toLowerCase();
    return new URL(
      `../../assets/artifacts/${setId}_${posId}.png`,
      import.meta.url
    ).href;
  };

  const [showModal, setShowModal] = useState(false);
  const [setFilter, setSetFilter] = useState(0);

  return (
    <div className="z-[42] w-full">
      <button
        className="btn w-full flex-nowrap justify-start gap-2 overflow-hidden text-ellipsis rounded-full text-left normal-case"
        onClick={() => setShowModal(true)}
      >
        {set !== 0 ? (
          <>
            <img
              className="inline-block aspect-square w-8"
              src={getSetIconUrl(set)}
            />
            {t(Set[set].toLowerCase(), { ns: "sets" })}
          </>
        ) : (
          <>
            <img className="aspect-square w-8" src={Icon_Inventory_Artifacts} />
            {t("All")}
          </>
        )}
      </button>
      <div
        id="backdrop"
        className={classNames(
          "fixed left-0 top-0 h-screen w-full",
          "cursor-pointer bg-neutral/50",
          { hidden: !showModal }
        )}
        onClick={() => setShowModal(false)}
      ></div>
      <div
        id="modal_container"
        className={classNames(
          "invisible fixed left-0 top-0 h-screen w-full",
          "flex items-start justify-center",
          { hidden: !showModal }
        )}
      >
        <div
          id="modal_card"
          className="card visible mt-8 h-auto max-h-[calc(100%_-_4rem)] w-96 overflow-hidden bg-neutral text-neutral-content shadow-xl"
        >
          {/* Dialog card header */}
          <div className="flex h-12 w-full shrink-0 items-center gap-2 border-b-2 border-neutral-content/10 pl-6 pr-2">
            <div className="text-md">
              {t("Pick one")} {t("set")}
            </div>
            <div className="grow" />
            <button
              className="btn btn-circle btn-sm"
              onClick={() => setShowModal(false)}
            >
              <IconClose />
            </button>
          </div>

          {/* Dialog card body */}
          {/* Filter for sets */}
          <div className="m-2 w-auto shrink-0 flex-nowrap space-y-2 overflow-auto rounded-xl bg-black/10 p-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm">{t("Filter by 2-piece bonus")}</div>
              <button
                className="btn btn-ghost btn-sm gap-2 rounded-full"
                onClick={() => setSetFilter(0)}
              >
                <IconReset />
                {t("Reset Filter")}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(filterBy2PieceBonus).map((key) => (
                <button
                  className={classNames(
                    "btn btn-secondary btn-sm flex-nowrap justify-start gap-2 rounded-lg text-left text-xs normal-case",
                    { "btn-outline": setFilter !== key }
                  )}
                  key={key}
                  onClick={() => setSetFilter(key)}
                >
                  <div className="w-4">{iconFilterBy2PieceBonus[key]}</div>
                  {t(key, { ns: "artifacts" })}
                </button>
              ))}
            </div>
          </div>

          {/* List of Sets */}
          <ul className="menu w-full flex-nowrap overflow-auto p-2 text-sm">
            <li>
              <a
                className={classNames(
                  "overflow-hidden text-ellipsis !rounded-full p-0 px-2",
                  set === 0
                    ? "bg-neutral-content text-neutral"
                    : "hover:bg-neutral-content/10"
                )}
                onClick={() => setSet(0)}
              >
                <img
                  className="aspect-square w-8"
                  src={Icon_Inventory_Artifacts}
                />
                {t("All")}
              </a>
            </li>
            {(setFilter ? filterBy2PieceBonus[setFilter] : [...enumToIdx(Set)])
              .sort((a, b) =>
                t(Set[a].toLowerCase(), { ns: "sets" }).localeCompare(
                  t(Set[b].toLowerCase(), { ns: "sets" }),
                  i18n.language
                )
              )
              .map((key) => (
                <li key={key}>
                  <a
                    className={classNames(
                      "overflow-hidden text-ellipsis !rounded-full p-0 px-2",
                      set === key
                        ? "bg-neutral-content text-neutral"
                        : "hover:bg-neutral-content/10"
                    )}
                    onClick={() => setSet(key)}
                  >
                    <img
                      className="aspect-square w-8"
                      src={getSetIconUrl(key)}
                    />
                    {t(Set[key].toLowerCase(), { ns: "sets" })}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </div>
      {/* <label
        tabIndex="0"
        className="btn-primary btn w-full flex-nowrap justify-start overflow-hidden text-ellipsis rounded-full text-left normal-case"
      >
        {set !== 0 ? (
          <>
            <img
              className="mr-1 inline-block aspect-square w-8"
              src={getSetIconUrl(set)}
            />
            {t(Set[set].toLowerCase(), { ns: "sets" })}
          </>
        ) : (
          <>
            {t("Pick one")} {t("set")}
          </>
        )}
        <span className="grow" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="24"
        >
          <path d="M7,10L12,15L17,10H7Z" />
        </svg>
      </label>
      <ul
        tabIndex="0"
        className="dropdown-content menu rounded-box mt-1 max-h-96 w-full flex-nowrap overflow-auto bg-primary p-2 text-sm text-primary-content shadow"
      >
        {[...enumToIdx(Set)]
          .sort((a, b) =>
            t(Set[a].toLowerCase(), { ns: "sets" }).localeCompare(
              t(Set[b].toLowerCase(), { ns: "sets" }),
              i18n.language
            )
          )
          .map((key) => (
            <li key={key}>
              <a
                className="overflow-hidden text-ellipsis !rounded-full p-0 px-2 hover:bg-primary-content/10"
                onClick={() => {
                  handleClick(key);
                }}
              >
                <img className="aspect-square w-8" src={getSetIconUrl(key)} />
                {t(Set[key].toLowerCase(), { ns: "sets" })}
              </a>
            </li>
          ))}
      </ul> */}
    </div>
  );
};

export default SetSelect;
