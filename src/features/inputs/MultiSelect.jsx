import { useState, useCallback } from "react";
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
  const handleAdd = useCallback(
    (option) => {
      if (!values.includes(option)) setValues((arr) => [...arr, option]);
    },
    [values]
  );
  const handleRemove = useCallback(
    (value) => {
      setValues((arr) => [...arr].filter((v) => v !== value));
    },
    [values]
  );
  const handleToggle = useCallback(
    (option) => {
      console.log(option);
      if (values.includes(option)) handleRemove(option);
      else handleAdd(option);
    },
    [values]
  );
  return (
    <div
      className={classNames("dropdown", {
        "dropdown-open": open,
      })}
    >
      <div className="flex w-64 flex-row items-center rounded-xl normal-case">
        <div
          className="flex h-full w-full flex-row flex-wrap items-center justify-start rounded-xl"
          onClick={(e) => {
            e.preventDefault();
            values.length === 0 ? setOpen(true) : null;
          }}
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
                  <X
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(value);
                    }}
                  />
                </span>
              </div>
            ))}
        </div>
        <CaretDown
          size={20}
          weight="fill"
          className="w-12 cursor-pointer text-primary"
          onClick={() => {
            console.log("CaretDown");
            setOpen((prev) => !!!prev);
          }}
        />
      </div>
      <div className="dropdown-content rounded-t-box rounded-b-box left-0 top-full h-[50vh] w-56 translate-y-0 overflow-y-auto bg-base-200 text-base-content shadow-2xl">
        <ul className="menu menu-compact p-3">
          {[...options]
            .sort((a, b) =>
              renderFunc(a).localeCompare(renderFunc(b), i18n.language)
            )
            .map((option) => (
              <li
                key={option}
                className="overflow-hidden"
                onClick={() => handleToggle(option)}
              >
                <div className="form-control flex-row">
                  <input
                    type="checkbox"
                    readOnly
                    checked={values.includes(option)}
                    className="checkbox"
                  />
                  <button
                    className="w-full grow"
                    onClick={() => setOpen(false)}
                  >
                    {renderFunc ? renderFunc(option) : option}
                  </button>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default MultiSelect;
