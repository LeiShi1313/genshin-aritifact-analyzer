import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CaretDown, X } from "phosphor-react";
import classNames from "classnames";

const MultiSelect = ({
  values,
  setValues,
  options,
  renderFunc = (v) => v,
  zeroValue = null,
}) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const handleAdd = useCallback(
    (option) => {
      if (!values.includes(option)) setValues((arr) => [...arr, option]);
    },
    [values, setValues]
  );
  const handleRemove = useCallback(
    (value) => {
      setValues((arr) => arr.filter((v) => v !== value));
    },
    [setValues]
  );
  const handleToggle = useCallback(
    (option) => {
      if (values.includes(option)) handleRemove(option);
      else handleAdd(option);
    },
    [values, handleAdd, handleRemove]
  );

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={classNames("dropdown", {
        "dropdown-open": open,
      })}
    >
      <div className="flex w-64 flex-row items-center rounded-xl normal-case">
        <div
          className="flex h-full w-full cursor-pointer flex-row flex-wrap items-center justify-start rounded-xl"
          onClick={() => setOpen(true)}
        >
          {values.length === 0 && zeroValue && (
            <span className="text-lg font-bold">{zeroValue}</span>
          )}
          {[...values]
            .sort((a, b) =>
              renderFunc(a).localeCompare(renderFunc(b), i18n.language)
            )
            .map((value) => (
              <div key={value} className="flex flex-row px-1 py-1">
                <span className="badge badge-primary text-xs">
                  {renderFunc(value)}
                  <button
                    type="button"
                    className="inline-flex items-center justify-center"
                    aria-label={t("Delete")}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(value);
                    }}
                  >
                    <X aria-hidden="true" className="cursor-pointer" />
                  </button>
                </span>
              </div>
            ))}
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-circle text-primary"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={zeroValue ?? t("Pick one")}
          onClick={() => setOpen((prev) => !prev)}
        >
          <CaretDown aria-hidden="true" size={20} weight="fill" />
        </button>
      </div>
      <div className="dropdown-content rounded-t-box rounded-b-box left-0 top-full z-30 h-[50vh] w-56 translate-y-0 overflow-y-auto bg-base-200 text-base-content shadow-2xl">
        <ul className="menu menu-sm w-full p-3">
          {[...options]
            .sort((a, b) =>
              renderFunc(a).localeCompare(renderFunc(b), i18n.language)
            )
            .map((option) => (
              <li key={option} className="overflow-hidden">
                <button
                  type="button"
                  className="flex w-full flex-row items-center gap-2"
                  onClick={() => handleToggle(option)}
                >
                  <input
                    type="checkbox"
                    readOnly
                    tabIndex={-1}
                    checked={values.includes(option)}
                    className="checkbox pointer-events-none"
                  />
                  <span className="grow text-left">{renderFunc(option)}</span>
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default MultiSelect;
