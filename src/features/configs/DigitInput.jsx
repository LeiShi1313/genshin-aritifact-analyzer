import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { Plus, Minus } from "phosphor-react";

const DigitInput = ({ value, setValue, step = 1, canEdit = true }) => {
  const { t } = useTranslation();
  const x = Number((1 / step).toFixed(0));
  return (
    <div
      className={
        "flex flex-row items-center justify-center border-b-2 " +
        classNames({ tooltip: !canEdit })
      }
      data-tip={t("This stat is not available for this position")}
    >
      {canEdit && (
        <button
          className="btn btn-ghost btn-xs px-0"
          onClick={() => setValue(Math.round((value - step) * x) / x)}
        >
          <Minus size={12} />
        </button>
      )}
      <input
        type="number"
        placeholder="0.0"
        disabled={!canEdit}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input input-ghost h-4 w-8 max-w-xs px-0 text-center text-xs leading-4 md:h-8 md:w-12 md:text-sm md:leading-8"
      />
      {canEdit && (
        <button
          className="btn btn-ghost btn-xs px-0"
          onClick={() => setValue(Math.round((value + step) * x) / x)}
        >
          <Plus size={12} className="cursor-pointer" />
        </button>
      )}
    </div>
  );
};

export default DigitInput;
