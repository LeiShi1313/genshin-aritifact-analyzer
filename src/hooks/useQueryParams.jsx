import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

const useQueryParams = (
  param,
  defaultValue = null,
  { isNumeric = false, replace = true }
) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryParam, setQueryParam] = useState(defaultValue);
  const paramValue = useRef(defaultValue);

  useEffect(() => {
    const newParam = searchParams.get(param);
    if (newParam === null) paramValue.current = defaultValue;
    if (newParam !== null)
      isNumeric
        ? (paramValue.current = Number(newParam))
        : (paramValue.current = newParam);
  }, [location, searchParams]);

  useEffect(() => {
    /*
    const urlParam = isNumeric
      ? Number(searchParams.get(param) ?? defaultValue)
      : searchParams.get(param) ?? defaultValue;

    if (queryParam === urlParam) return;

    let updatedSearchParams = new URLSearchParams(searchParams.toString());
    if (queryParam !== defaultValue) {
      updatedSearchParams.set(param, queryParam);
      setSearchParams(updatedSearchParams.toString(), { replace: replace });
    } else {
      updatedSearchParams.delete(param);
      setSearchParams(updatedSearchParams.toString(), { replace: replace });
    }*/
    if (queryParam !== paramValue.current) {
      paramValue.current = queryParam;
      let updatedSearchParams = new URLSearchParams(searchParams.toString());
      if (queryParam !== defaultValue) {
        updatedSearchParams.set(param, queryParam);
        setSearchParams(updatedSearchParams.toString(), { replace: replace });
      } else {
        updatedSearchParams.delete(param);
        setSearchParams(updatedSearchParams.toString(), { replace: replace });
      }
    }
  }, [queryParam]);

  return [paramValue.current, setQueryParam];
};

export default useQueryParams;
