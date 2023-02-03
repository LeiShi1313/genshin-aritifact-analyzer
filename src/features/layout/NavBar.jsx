import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { UserCircle } from "phosphor-react";

import ChangeLanguageDropdown from "../i18n/ChangeLanguageDropdown";
import { ThemeContext } from "../../contexts/ThemeContext";

const MenuItems = ({ location, navigate }) => {
  const { t } = useTranslation();
  return (
    <>
      <li>
        <a className="btn btn-ghost rounded-lg" onClick={() => navigate("/")}>
          {t("Home")}
        </a>
      </li>
      {location.pathname !== "/builds" && (
        <li>
          <a
            className="btn btn-ghost rounded-lg"
            onClick={() => navigate("/builds")}
          >
            {t("Edit Builds")}
          </a>
        </li>
      )}
      {location.pathname !== "/build" && (
        <li>
          <a
            className="btn btn-ghost rounded-lg"
            onClick={() => navigate("/build")}
          >
            {t("Add New Build")}
          </a>
        </li>
      )}
      {location.pathname !== "/config" && (
        <li>
          <a
            className="btn btn-ghost rounded-lg"
            onClick={() => navigate("/config")}
          >
            {t("Adjust Config")}
          </a>
        </li>
      )}
      {location.pathname !== "/uploaded" && (
        <li>
          <a
            className="btn btn-ghost rounded-lg"
            onClick={() => navigate("/uploaded")}
          >
            {t("Uploaded Artifacts")}
          </a>
        </li>
      )}
    </>
  );
};
const NavBar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="navbar flex items-center justify-end bg-base-100">
      <div className="navbar-start">
        {location.pathname !== "/" && (
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
            >
              <MenuItems location={location} navigate={navigate} />
            </ul>
          </div>
        )}
      </div>
      {location.pathname !== "/" && (
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <MenuItems location={location} navigate={navigate} />
          </ul>
        </div>
      )}
      <div className="navbar-end px-2">
        <ChangeLanguageDropdown />
      </div>
    </div>
  );
};
export default NavBar;
