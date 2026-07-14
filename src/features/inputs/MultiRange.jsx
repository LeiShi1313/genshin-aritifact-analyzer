import classnames from "classnames";

import "./MultiRange.css";

const MultiRange = ({
  min,
  max,
  minValue,
  maxValue,
  onChange,
  minLabel,
  maxLabel,
  step = 1,
}) => {
  const percent = (value) => ((value - min) / (max - min)) * 100;
  const minPercent = percent(minValue);
  const maxPercent = percent(maxValue);
  const upperOverlapThreshold = max - (max - min) * 0.1;

  return (
    <div className="relative flex h-4 grow items-center justify-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minValue}
        aria-label={minLabel}
        onChange={(event) => {
          const value = Math.min(Number(event.target.value), maxValue);
          onChange({ min: value, max: maxValue });
        }}
        className={classnames("thumb thumb--zindex-3", {
          "thumb--zindex-5": minValue >= upperOverlapThreshold,
        })}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxValue}
        aria-label={maxLabel}
        onChange={(event) => {
          const value = Math.max(Number(event.target.value), minValue);
          onChange({ min: minValue, max: value });
        }}
        className="thumb thumb--zindex-4"
      />

      <div className="relative w-full">
        <div className="bg-primary/10 absolute -top-2 z-10 h-4 w-full rounded-xl" />
        <div
          className="bg-primary absolute -top-2 z-20 h-4 rounded-xl"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
      </div>
    </div>
  );
};

export default MultiRange;
