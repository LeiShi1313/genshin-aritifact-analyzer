import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { UserCircle } from "phosphor-react";

import ChangeLanguageDropdown from "../i18n/ChangeLanguageDropdown";
import { ThemeContext } from "../../contexts/ThemeContext";

const NavBar = () => {
  const { t, i18n } = useTranslation();
  return (
    <div className="navbar flex items-center justify-end bg-base-100">
      {/* <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">{t('Aurora Admin Panel')}</a>
      </div> */}
      <div className="flex flex-1 justify-end px-2">
        <ChangeLanguageDropdown />
        {/* <div className="flex items-stretch">
          <div className="dropdown-end dropdown">
            <label tabIndex="0" className="avatar btn btn-ghost btn-circle">
              <UserCircle size={32} />
            </label>
            <ul
              tabIndex="0"
              className="dropdown-content menu rounded-box menu-compact mt-3 w-40 bg-base-100 p-2 shadow"
            >
              <li>
                <a className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </a>
              </li>
              <li>
                <a>{t("Settings")}</a>
              </li>
              <li>
                <a>Logout</a>
              </li>
            </ul>
          </div>
        </div> */}
      </div>
    </div>
  );
};
export default NavBar;
