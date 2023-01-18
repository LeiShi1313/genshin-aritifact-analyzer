import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

interface UseQueryParamsOptions {
  name: string;
  defaultValue: any;
  isNumeric?: boolean;
  replace?: boolean;
}

const useQueryParams = (params: UseQueryParamsOptions[]) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const states = {};
  const setStates = {};
  for (const param of params) {
    const [state, setState] = useState(param.defaultValue);
    states[param.name] = state;
    setStates[param.name] = setState;
  }
  const paramValues = useRef(
    params.reduce(
      (acc, param) => ({ ...acc, [param.name]: param.defaultValue }),
      {}
    )
  );

  useEffect(() => {
    for (const param of params) {
      const urlParam = searchParams.get(param.name) ?? param.defaultValue;
      if (String(urlParam) !== String(paramValues.current[param.name])) {
        const value = param.isNumeric ? Number(urlParam) : urlParam;
        paramValues.current[param.name] = value;
        setStates[param.name](value);
      }
    }
  }, [location, searchParams]);

  useEffect(() => {
    for (const param of params) {
      if (states[param.name] !== paramValues.current[param.name]) {
        let updatedSearchParams = new URLSearchParams(searchParams.toString());
        if (states[param.name] !== param.defaultValue) {
          updatedSearchParams.set(param.name, states[param.name]);
          setSearchParams(updatedSearchParams.toString(), {
            replace: param.replace ?? false,
          });
        } else {
          updatedSearchParams.delete(param.name);
          setSearchParams(updatedSearchParams.toString(), {
            replace: param.replace ?? false,
          });
        }
        paramValues.current[param.name] = states[param.name];
      }
    }
  }, [...Object.values(states)]);

  return [...Object.values(states), ...Object.values(setStates)] as const;
};

export default useQueryParams;
