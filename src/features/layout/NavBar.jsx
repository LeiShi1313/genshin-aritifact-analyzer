import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

import ChangeLanguageDropdown from "../i18n/ChangeLanguageDropdown";
import ThemeSwitcher from "../ThemeSwitcher";
import classNames from "classnames";
import { useMemo } from "react";

const MenuItems = ({ location, navigate }) => {
  const { t } = useTranslation();
  const firstPath = useMemo(
    () => "/" + location.pathname.split("/")[1],
    [location]
  );
  const navList = [
    {
      title: "Home",
      path: "/",
      iconPathEle: <path d="M12,3L20,9V21H15V14H9V21H4V9L12,3Z" />,
    },
    {
      title: "Builds",
      path: "/builds",
      iconPathEle: (
        <path d="M16 17V19H2V17S2 13 9 13 16 17 16 17M12.5 7.5A3.5 3.5 0 1 0 9 11A3.5 3.5 0 0 0 12.5 7.5M15.94 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13M15 4A3.39 3.39 0 0 0 13.07 4.59A5 5 0 0 1 13.07 10.41A3.39 3.39 0 0 0 15 11A3.5 3.5 0 0 0 15 4Z" />
      ),
    },
    {
      title: "Config",
      path: "/config",
      iconPathEle: (
        <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
      ),
    },
    {
      title: "Uploaded Artifacts",
      path: "/uploaded",
      iconPathEle: (
        <path d="M4 4C4 2.89 4.89 2 6 2H14L20 8V20C20 20.53 19.79 21.04 19.41 21.41C19.04 21.79 18.53 22 18 22H6C5.47 22 4.96 21.79 4.59 21.41C4.21 21.04 4 20.53 4 20V4M13 3.5V9H18.5L13 3.5M12 11L10.74 13.75L8 15L10.74 16.26L12 19L13.25 16.26L16 15L13.25 13.75L12 11Z" />
      ),
      alsoHighlightAtPath: ["/artifacts"],
    },
  ];
  return (
    <>
      {navList.map((item, idx) => (
        <li key={idx}>
          <a
            className={classNames("btn btn-ghost gap-2 !rounded-full", {
              "bg-secondary/[.15]":
                firstPath === item.path ||
                (typeof item.alsoHighlightAtPath === "object" &&
                  item.alsoHighlightAtPath.some((e) => e === firstPath)),
            })}
            onClick={() => navigate(item.path)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="24"
            >
              {item.iconPathEle}
            </svg>
            {t(item.title)}
          </a>
        </li>
      ))}
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
        <ThemeSwitcher />
        <ChangeLanguageDropdown />
      </div>
    </div>
  );
};
export default NavBar;
