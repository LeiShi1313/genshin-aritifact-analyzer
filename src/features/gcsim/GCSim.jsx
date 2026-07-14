import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import { ArrowClockwise, Spinner, WarningCircle } from "phosphor-react";

import { fetchGCSim } from "../../store/reducers/gcsim";

const LoadingScripts = () => {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex h-full w-full flex-col items-center justify-center gap-4"
    >
      <Spinner
        size={48}
        className="text-primary animate-spin"
        aria-hidden="true"
      />
      <div className="text-lg">{t("Loading gcsim scripts...")}</div>
    </div>
  );
};

const ScriptsError = ({ onRetry }) => {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className="flex h-full w-full flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <WarningCircle size={48} className="text-error" aria-hidden="true" />
      <div className="text-lg font-semibold">
        {t("Failed to load GCSim scripts")}
      </div>
      <button className="btn btn-primary btn-sm" onClick={onRetry}>
        <ArrowClockwise size={16} />
        {t("Retry")}
      </button>
    </div>
  );
};

const GCSim = () => {
  const dispatch = useDispatch();
  const { scripts = [], status = "idle" } = useSelector((state) => state.gcsim);

  useEffect(() => {
    dispatch(fetchGCSim());
  }, [dispatch]);

  if (scripts.length === 0 && (status === "idle" || status === "loading")) {
    return <LoadingScripts />;
  }

  if (scripts.length === 0 && status === "error") {
    return <ScriptsError onRetry={() => dispatch(fetchGCSim())} />;
  }

  return <Outlet />;
};

export default GCSim;
