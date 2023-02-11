import { useState, useCallback } from "react";
import { CaretDown, X } from "phosphor-react";
import classNames from "classnames";

const MultiSelect = ({ values, setValues, options }) => {
  const [open, setOpen] = useState(false);
  const handleAdd = useCallback((option) => {
    console.log('ok')
    if (!values.includes(option)) setValues((arr) => [...arr, option]);
    setOpen(false);
  }, [values]);
  const handleRemove = useCallback((value) => {
    setValues((arr) => [...arr].filter((v) => v !== value));
  }, [values]);
  const handleToggle = useCallback((option) => {
    console.log(option)
    if (values.includes(option)) handleRemove(option)
    else handleAdd(option)
  }, [values]);
  return (
    <div
      className={classNames("dropdown", "dropdown-right", {
        "dropdown-open": open,
      })}
    >
      <div className="flex flex-row normal-case">
          <div className="flex flex-row w-56 overflow-x-scroll rounded-xl">
        {values.map((value) => (
          <div className="flex flex-row">
            <span className="badge">
              {value}
              <X
                className="cursor-pointer"
                onClick={() => handleRemove(value)}
              />
            </span>
          </div>
        ))}
        </div>
        <CaretDown
          size={20}
          className="cursor-pointer text-primary"
          onClick={() => setOpen((prev) => !!!prev)}
        />
      </div>
      <div className="dropdown-content rounded-t-box rounded-b-box top-px mt-8 h-[70vh] w-56 overflow-y-auto bg-base-200 text-base-content shadow-2xl">
        <ul className="menu menu-compact gap-1 p-3">
          {options.map((option) => (
            <li key={option} className="overflow-hidden">
              <div className="form-control flex-row">
                <input
                  type="checkbox"
                  checked={values.includes(option)}
                  onChange={() => handleToggle(option)}
                  className="checkbox"
                />
                <button className="grow w-full" onClick={() => handleAdd(option, (close = true))}>
                  {option}
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
