import { useTranslation } from "react-i18next";
import { Weapon } from "../../genshin/weapon";
import { enumToIdx } from "../../utils/enum";
import { useState } from "react";
import classNames from "classnames";
import IconClose from "../../assets/svgs/IconClose";

const WeaponSelect = ({ weapon, setWeapon, awaken = true, filterFn = null }) => {
  const { t, i18n } = useTranslation();

  const handleClick = (value) => {
    setWeapon(value);

    // Collapse the dropdown list
    const elem = document.activeElement;
    if (elem) {
      elem?.blur();
    }
  };

  const getWeaponIconUrl = (id) => {
    let weaponId = Weapon[id].toLowerCase();
    const suffix = awaken ? "_awaken" : "";
    return new URL(
      `../../assets/weapons/${weaponId}${suffix}.png`,
      import.meta.url
    ).href;
  };

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="z-[42] w-full">
      <button
        className="btn btn-primary w-full flex-nowrap justify-start gap-2 overflow-hidden text-ellipsis rounded-full text-left normal-case"
        onClick={() => setShowModal(true)}
      >
        {weapon !== 0 ? (
          <>
            <img
              className="inline-block aspect-square w-8"
              src={getWeaponIconUrl(weapon)}
            />
            {t(Weapon[weapon].toLowerCase(), { ns: "weapons" })}
          </>
        ) : (
          <>
            {t("Pick one")} {t("weapon")}
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
              {t("Pick one")} {t("weapon")}
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
          {/* List of Weapons */}
          <ul className="menu w-full flex-nowrap overflow-auto p-2 text-sm">
            <li>
              <a
                className={classNames(
                  "overflow-hidden text-ellipsis !rounded-full p-0 px-2",
                  weapon === 0
                    ? "bg-neutral-content text-neutral"
                    : "hover:bg-neutral-content/10"
                )}
                onClick={() => setWeapon(0)}
              >
                {t("All")}
              </a>
            </li>
            {[...enumToIdx(Weapon)]
              .sort((a, b) =>
                t(Weapon[a].toLowerCase(), { ns: "weapons" }).localeCompare(
                  t(Weapon[b].toLowerCase(), { ns: "weapons" }),
                  i18n.language
                )
              )
              .filter((key) => (filterFn ? filterFn(key) : true))
              .map((key) => (
                <li key={key}>
                  <a
                    className={classNames(
                      "overflow-hidden text-ellipsis !rounded-full p-0 px-2",
                      weapon === key
                        ? "bg-neutral-content text-neutral"
                        : "hover:bg-neutral-content/10"
                    )}
                    onClick={() => setWeapon(key)}
                  >
                    <img
                      className="aspect-square w-8"
                      src={getWeaponIconUrl(key)}
                    />
                    {t(Weapon[key].toLowerCase(), { ns: "weapons" })}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WeaponSelect;
