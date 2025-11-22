import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

type ParamState = string | number | boolean;

interface UseQueryParamsOptions {
  name: string;
  defaultValue: ParamState;
  isNumeric?: boolean;
  isBoolean?: boolean;
  replace?: boolean;
}

type States = {
  [name: string]: ParamState;
};

type SetStates = {
  [name: string]: React.Dispatch<React.SetStateAction<ParamState>>;
};

const useQueryParams = (params: UseQueryParamsOptions[]) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const states: States = {};
  const setStates: SetStates = {};
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
      if (String(urlParam) !== String(paramValues.current[param.name] as any)) {
        const value = param.isNumeric ? Number(urlParam) : param.isBoolean ? Boolean(urlParam) : urlParam;
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
