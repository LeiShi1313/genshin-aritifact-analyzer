import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const BackToHome = ({ title }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <div className="card-actions justify-end">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/", { replace: true })}
          >
            {t("Back to home")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackToHome;
