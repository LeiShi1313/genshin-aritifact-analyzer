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
        <button className="btn btn-xs btn-ghost px-0"
          onClick={() => setValue(Math.round((value - step) * x) / x)}
        >
        <Minus
          size={12}
        />

        </button>
      )}
      <input
        type="number"
        placeholder="0.0"
        disabled={!canEdit}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input input-ghost input-xs w-8 max-w-xs px-0 text-center text-sm md:input-sm md:w-12 md:px-0"
      />
      {canEdit && (
        <button className="btn btn-xs btn-ghost px-0"
          onClick={() => setValue(Math.round((value + step) * x) / x)}
        >
        <Plus
          size={12}
          className="cursor-pointer"
        />
        </button>
      )}
    </div>
  );
};

export default DigitInput;
