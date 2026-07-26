import { useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { Weapon } from "../../genshin/weapon";
import { enumToIdx } from "../../utils/enum";
import IconClose from "../../assets/svgs/IconClose";

const WeaponSelect = ({ weapon, setWeapon, awaken = true, filterFn = null }) => {
  const { t, i18n } = useTranslation();
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const titleId = useId();

  const closeDialog = () => dialogRef.current?.close();

  const handleClick = (value) => {
    setWeapon(value);
    closeDialog();
  };

  const getWeaponIconUrl = (id) => {
    const weaponId = Weapon[id].toLowerCase();
    const suffix = awaken ? "_awaken" : "";
    return new URL(
      `../../assets/weapons/${weaponId}${suffix}.png`,
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
        onClick={() => dialogRef.current?.showModal()}
      >
        {weapon !== 0 && Weapon[weapon] ? (
          <>
            <img
              className="inline-block aspect-square w-8"
              src={getWeaponIconUrl(weapon)}
              alt=""
            />
            <span className="truncate">
              {t(Weapon[weapon].toLowerCase(), { ns: "weapons" })}
            </span>
          </>
        ) : (
          <span className="truncate">
            {t("Pick one thing", { thing: t("Weapon") })}
          </span>
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
              {t("Pick one thing", { thing: t("Weapon") })}
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

          <ul className="menu w-full flex-nowrap overflow-auto p-2 text-sm">
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
                  <button
                    type="button"
                    className={classNames(
                      "w-full overflow-hidden text-ellipsis !rounded-full p-0 px-2 text-left",
                      weapon === key
                        ? "bg-neutral-content text-neutral"
                        : "hover:bg-neutral-content/10"
                    )}
                    aria-pressed={weapon === key}
                    onClick={() => handleClick(key)}
                  >
                    <img
                      className="aspect-square w-8"
                      src={getWeaponIconUrl(key)}
                      alt=""
                    />
                    {t(Weapon[key].toLowerCase(), { ns: "weapons" })}
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

export default WeaponSelect;
