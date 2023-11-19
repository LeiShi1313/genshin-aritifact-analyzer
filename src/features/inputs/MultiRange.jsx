import { useState, useRef, useCallback, useEffect } from "react";
import classnames from "classnames";
import './MultiRange.css';

const MultiRange = ({ min, max, onChange, step=1 }) => {
    const [minVal, setMinVal] = useState(min);
    const [maxVal, setMaxVal] = useState(max);
    const minValRef = useRef(null);
    const maxValRef = useRef(null);
    const range = useRef(null);

    const getPercent = useCallback(
        (value) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    useEffect(() => {
        if (maxValRef.current) {
            const minPercent = getPercent(minVal);
            const maxPercent = getPercent(+maxValRef.current.value); // Precede with '+' to convert the value from type string to type number

            if (range.current) {
                range.current.style.left = `${minPercent}%`;
                range.current.style.width = `${maxPercent - minPercent}%`;
            }
        }
    }, [minVal, getPercent]);
    useEffect(() => {
        if (minValRef.current) {
            const minPercent = getPercent(+minValRef.current.value);
            const maxPercent = getPercent(maxVal);

            if (range.current) {
                range.current.style.width = `${maxPercent - minPercent}%`;
            }
        }
    }, [maxVal, getPercent]);

    useEffect(() => {
        onChange({ min: minVal, max: maxVal });
    }, [minVal, maxVal, onChange]);

    return (
        <div className="relative h-4 flex items-center justify-center grow">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={minVal}
                ref={minValRef}
                onChange={(event) => {
                    event.preventDefault();
                    const value = Math.min(+event.target.value, maxVal);
                    setMinVal(value);
                    event.target.value = value.toString();
                }}
                className={classnames("thumb thumb--zindex-3", {
                    "thumb--zindex-4": minVal > max - 100
                })}
            />
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={maxVal}
                ref={maxValRef}
                onChange={(event) => {
                    event.preventDefault();
                    const value = Math.max(+event.target.value, minVal);
                    setMaxVal(value);
                    event.target.value = value.toString();
                }}
                className="thumb thumb--zindex-4"
            />

            <div className="relative w-full">
                <div className="absolute bg-primary/10 rounded-xl h-4 w-full z-10 -top-2"></div>
                <div ref={range} className="absolute bg-primary rounded-xl h-4 z-20 -top-2"></div>
            </div>
        </div>
    )
}

export default MultiRange;