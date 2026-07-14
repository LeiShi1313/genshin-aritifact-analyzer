import { useTranslation } from "react-i18next";

import { Set } from "../../genshin/set";
import { enumToIdx } from "../../utils/enum";
import { AttributePosition, AttributeType } from "../../genshin/attribute";
import { useId, useRef, useState } from "react";
import classNames from "classnames";
import IconClose from "../../assets/svgs/IconClose";
import IconReset from "../../assets/svgs/IconReset";
import AttributeIcon from "../../assets/svgs/AttributeIcon";
import IconElementalRes from "../../assets/svgs/IconElementalRes";
import IconCRIT from "../../assets/svgs/IconCRIT";
import IconTalents from "../../assets/svgs/IconTalents";
import Icon_Inventory_Artifacts from "../../assets/pngs/Icon_Inventory_Artifacts.png";
import IconShieldStrength from "../../assets/svgs/IconShieldStrength";
import IconTimeReduced from "../../assets/svgs/IconTimeReduced";
import IconAllElementsColored from "../../assets/svgs/IconAllElementsColored";
import { TwoPcBonusCateToSets } from "../../utils/set";

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

const SetSelect = ({ set, setSet, filterFn = null, labelledBy }) => {
  const { t, i18n } = useTranslation();
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const titleId = useId();
  const valueId = useId();
  const [setFilter, setSetFilter] = useState(0);
  const selectedSet =
    Number.isInteger(set) && set > 0 && typeof Set[set] === "string" ? set : 0;
  const triggerLabelledBy = [labelledBy, valueId].filter(Boolean).join(" ");

  const closeDialog = () => dialogRef.current?.close();

  const handleClick = (value) => {
    setSet(value);
    closeDialog();
  };

  const getSetIconUrl = (id) => {
    const setId = Set[id].toLocaleLowerCase();
    const posId =
      AttributePosition[setId.startsWith("prayers_") ? 5 : 1].toLowerCase();
    return new URL(
      `../../assets/artifacts/${setId}_${posId}.png`,
      import.meta.url
    ).href;
  };

  return (
    <div className="z-[42] w-full">
      <button
        ref={triggerRef}
        type="button"
        className="btn btn-primary w-full flex-nowrap justify-start gap-2 overflow-hidden text-ellipsis rounded-full text-left normal-case"
        aria-haspopup="dialog"
        aria-labelledby={triggerLabelledBy || undefined}
        onClick={() => dialogRef.current?.showModal()}
      >
        {selectedSet !== 0 ? (
          <>
            <img
              className="inline-block aspect-square w-8"
              src={getSetIconUrl(selectedSet)}
              alt=""
            />
            <span id={valueId} className="truncate">
              {t(Set[selectedSet].toLowerCase(), { ns: "sets" })}
            </span>
          </>
        ) : (
          <>
            <img
              className="aspect-square w-8"
              src={Icon_Inventory_Artifacts}
              alt=""
            />
            <span id={valueId} className="truncate">
              {t("All")}
            </span>
          </>
        )}
      </button>

      <dialog
        ref={dialogRef}
        className="modal"
        aria-labelledby={titleId}
        onClose={() => triggerRef.current?.focus()}
      >
        <div className="modal-box max-w-96 bg-neutral text-neutral-content flex max-h-[calc(100dvh_-_2rem)] w-[calc(100vw_-_2rem)] flex-col overflow-hidden p-0 shadow-xl">
          <div className="border-neutral-content/10 flex h-12 w-full shrink-0 items-center gap-2 border-b-2 pl-6 pr-2">
            <h2 id={titleId} className="text-md font-semibold">
              {t("Pick one")} {t("set")}
            </h2>
            <div className="grow" />
            <button
              type="button"
              className="btn btn-circle btn-sm"
              aria-label={t("Close")}
              autoFocus
              onClick={closeDialog}
            >
              <span aria-hidden="true">
                <IconClose />
              </span>
            </button>
          </div>

          <div className="m-2 max-h-[45dvh] w-auto shrink-0 space-y-2 overflow-y-auto rounded-xl bg-black/10 p-2 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm">{t("Filter by 2-piece bonus")}</div>
              <button
                type="button"
                className="btn btn-ghost btn-sm gap-2 rounded-full"
                onClick={() => setSetFilter(0)}
              >
                <span aria-hidden="true">
                  <IconReset />
                </span>
                {t("Reset Filter")}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Object.keys(TwoPcBonusCateToSets).map((key) => (
                <button
                  type="button"
                  className={classNames(
                    "btn btn-secondary btn-sm flex-nowrap justify-start gap-2 rounded-lg text-left text-xs normal-case",
                    { "btn-outline": setFilter !== key }
                  )}
                  key={key}
                  aria-pressed={setFilter === key}
                  onClick={() => setSetFilter(key)}
                >
                  <div aria-hidden="true" className="w-4">
                    {iconFilterBy2PieceBonus[key]}
                  </div>
                  {t(key, { ns: "artifacts" })}
                </button>
              ))}
            </div>
          </div>

          <ul className="menu w-full flex-nowrap overflow-auto p-2 text-sm">
            <li>
              <button
                type="button"
                className={classNames(
                  "w-full overflow-hidden text-ellipsis !rounded-full p-0 px-2 text-left",
                  selectedSet === 0
                    ? "bg-neutral-content text-neutral"
                    : "hover:bg-neutral-content/10"
                )}
                aria-pressed={selectedSet === 0}
                onClick={() => handleClick(0)}
              >
                <img
                  className="aspect-square w-8"
                  src={Icon_Inventory_Artifacts}
                  alt=""
                />
                {t("All")}
              </button>
            </li>
            {(setFilter
              ? [...TwoPcBonusCateToSets[setFilter]]
              : [...enumToIdx(Set)]
            )
              .sort((a, b) =>
                t(Set[a].toLowerCase(), { ns: "sets" }).localeCompare(
                  t(Set[b].toLowerCase(), { ns: "sets" }),
                  i18n.language
                )
              )
              .filter((key) => (filterFn ? filterFn(key) : true))
              .map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    className={classNames(
                      "w-full overflow-hidden text-ellipsis !rounded-full p-0 px-2 text-left",
                      selectedSet === key
                        ? "bg-neutral-content text-neutral"
                        : "hover:bg-neutral-content/10"
                    )}
                    aria-pressed={selectedSet === key}
                    onClick={() => handleClick(key)}
                  >
                    <img
                      className="aspect-square w-8"
                      src={getSetIconUrl(key)}
                      alt=""
                    />
                    {t(Set[key].toLowerCase(), { ns: "sets" })}
                  </button>
                </li>
              ))}
          </ul>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button type="submit" aria-label={t("Close")}>
            {t("Close")}
          </button>
        </form>
      </dialog>
    </div>
  );
};

export default SetSelect;
