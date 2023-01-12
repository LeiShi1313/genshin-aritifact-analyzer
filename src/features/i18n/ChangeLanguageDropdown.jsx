import { useTranslation } from "react-i18next";
import classNames from "classnames";

const ChangeLanguageDropdown = () => {
    const { t, i18n } = useTranslation();
    return (
        <div title={t("Change Language")} className="dropdown-end dropdown">
          <div tabIndex="0" className="gap-1 normal-case btn btn-ghost">
            <svg
              className="inline-block w-4 h-4 fill-current md:h-5 md:w-5"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 512 512"
            >
              <path d="M363,176,246,464h47.24l24.49-58h90.54l24.49,58H480ZM336.31,362,363,279.85,389.69,362Z"></path>
              <path d="M272,320c-.25-.19-20.59-15.77-45.42-42.67,39.58-53.64,62-114.61,71.15-143.33H352V90H214V48H170V90H32v44H251.25c-9.52,26.95-27.05,69.5-53.79,108.36-32.68-43.44-47.14-75.88-47.33-76.22L143,152l-38,22,6.87,13.86c.89,1.56,17.19,37.9,54.71,86.57.92,1.21,1.85,2.39,2.78,3.57-49.72,56.86-89.15,79.09-89.66,79.47L64,368l23,36,19.3-11.47c2.2-1.67,41.33-24,92-80.78,24.52,26.28,43.22,40.83,44.3,41.67L255,362Z"></path>
            </svg>
            <svg
              width="12px"
              height="12px"
              className="hidden ml-1 w-3 h-3 opacity-60 fill-current sm:inline-block"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 2048 2048"
            >
              <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
            </svg>
          </div>
          <div className="overflow-y-auto top-px mt-16 w-56 shadow-2xl dropdown-content rounded-t-box rounded-b-box bg-base-200 text-base-content">
            <ul className="gap-1 p-3 menu menu-compact" tabIndex="0">
              <li>
                <button className={classNames("flex", {"active": i18n.language === 'en'})} onClick={() => i18n.changeLanguage("en")}>
                  <img
                    loading="lazy"
                    width="20"
                    height="20"
                    alt="English"
                    src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.0/svg/1f1fa-1f1f8.svg"
                  />{" "}
                  <span className="flex flex-1 justify-between">English </span>
                </button>{" "}
              </li>
              <li>
                <button className={classNames("flex", {"active": i18n.language === 'zh'})} onClick={() => i18n.changeLanguage("zh")}>
                  <img
                    loading="lazy"
                    width="20"
                    height="20"
                    alt="简体中文"
                    src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.0/svg/1f1e8-1f1f3.svg"
                  />{" "}
                  <span className="flex flex-1 justify-between">简体中文 </span>
                </button>{" "}
              </li>
              <li>
                <button className={classNames("flex", {"active": i18n.language === 'zh-Hant'})} onClick={() => i18n.changeLanguage("zh-Hant")}>
                  <img
                    loading="lazy"
                    width="20"
                    height="20"
                    alt="繁体中文"
                    src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.0/svg/1f1ed-1f1f0.svg"
                  />{" "}
                  <span className="flex flex-1 justify-between">繁体中文 </span>
                </button>{" "}
              </li>
              <li>
                <button className={classNames("flex", {"active": i18n.language === 'ja'})} onClick={() => i18n.changeLanguage("ja")}>
                  <img
                    loading="lazy"
                    width="20"
                    height="20"
                    alt="日本語"
                    src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.0/svg/1f1ef-1f1f5.svg"
                  />{" "}
                  <span className="flex flex-1 justify-between">日本語 </span>
                </button>{" "}
              </li>
              <li>
                <button className={classNames("flex", {"active": i18n.language === 'ko'})} onClick={() => i18n.changeLanguage("ko")}>
                  <img
                    loading="lazy"
                    width="20"
                    height="20"
                    alt="한국어"
                    src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.0/svg/1f1f0-1f1f7.svg"
                  />{" "}
                  <span className="flex flex-1 justify-between">한국어 </span>
                </button>{" "}
              </li>
              <li>
                <button className={classNames("flex", {"active": i18n.language === 'fr'})} onClick={() => i18n.changeLanguage("fr")}>
                  <img
                    loading="lazy"
                    width="20"
                    height="20"
                    alt="Français"
                    src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.0/svg/1f1eb-1f1f7.svg"
                  />{" "}
                  <span className="flex flex-1 justify-between">Français </span>
                </button>{" "}
              </li>
              <li>
                <button className={classNames("flex", {"active": i18n.language === 'es'})} onClick={() => i18n.changeLanguage("es")}>
                  <img
                    loading="lazy"
                    width="20"
                    height="20"
                    alt="Español"
                    src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.0/svg/1f1ea-1f1f8.svg"
                  />{" "}
                  <span className="flex flex-1 justify-between">Español </span>
                </button>{" "}
              </li>
              <li>
                <button className={classNames("flex", {"active": i18n.language === 'de'})} onClick={() => i18n.changeLanguage("de")}>
                  <img
                    loading="lazy"
                    width="20"
                    height="20"
                    alt="Deutsch"
                    src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.0/svg/1f1e9-1f1ea.svg"
                  />{" "}
                  <span className="flex flex-1 justify-between">Deutsch </span>
                </button>{" "}
              </li>
            </ul>
          </div>
        </div>
    )
}

export default ChangeLanguageDropdown;