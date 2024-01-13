import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import ReactLoading from "react-loading";
import { fetchGCSim } from "../../store/reducers/gcsim";
import ThemedSuspense from "../ThemedSuspense";
import { ArrayNodeDependencies } from "mathjs";
import UploadedCharactersRow from "./UploadedCharactersRow";
const Select = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { scripts } = useSelector((state) => state.gcsim);
  const handleClick = () => {
    dispatch(fetchGCSim());
  };

  useEffect(() => {}, [scripts]);
  return (
    <div className="flex w-full max-w-screen-lg flex-col items-center justify-center gap-4 px-4 lg:px-0">
      <div className="my-8 flex w-full flex-row items-center justify-end space-x-2">
        <div>{t("Loaded X gcsim scripts", { num: scripts.length })}</div>
        <button className="btn btn-primary btn-sm" onClick={handleClick}>
          {t("Refresh")}
        </button>
      </div>
      <div className="divider">OR</div>
        {Array.from(Array(3).keys()).map((idx) => (
            <UploadedCharactersRow  source={"adklajsd"} />
        ))}
      <div className="divider">OR</div>
      <div className="mb-4 flex w-full flex-col items-center justify-start space-y-4">
        {Array.from(Array(5).keys()).map((idx) => (
          <div className="flex h-40 w-full max-w-3xl items-center justify-center rounded-lg bg-base-200 shadow-2xl"></div>
        ))}
      </div>
    </div>
  );
};

export default Select;
