import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import { Spinner } from "phosphor-react";

import { fetchGCSim } from "../../store/reducers/gcsim";

const LoadingScripts = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <Spinner size={48} className="animate-spin text-primary" />
      <div className="text-lg">{t("Loading gcsim scripts...")}</div>
    </div>
  );
};

const GCSim = () => {
  const dispatch = useDispatch();
  const { isScriptsLoading } = useSelector((state) => state.gcsim);

  useEffect(() => {
    dispatch(fetchGCSim());
  }, [dispatch]);

  return isScriptsLoading ? <LoadingScripts /> : <Outlet />;
};

export default GCSim;
