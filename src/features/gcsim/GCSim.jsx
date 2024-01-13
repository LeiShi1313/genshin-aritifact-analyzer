import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

import ThemedSuspense from "../ThemedSuspense";
import { fetchGCSim } from "../../store/reducers/gcsim";

const GCSim = () => {
  const dispatch = useDispatch();
  const { isScriptsLoading } = useSelector((state) => state.gcsim);

  useEffect(() => {
      dispatch(fetchGCSim());
  }, []);
  return isScriptsLoading ? <ThemedSuspense /> : <Outlet />;
};

export default GCSim;
