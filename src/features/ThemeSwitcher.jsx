import { useTranslation } from "react-i18next";
import { themes } from "../utils/theme";
import { ThemeContext } from "../contexts/ThemeContext";
import { useContext } from "react";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const { t } = useTranslation();
  return (
    <div
      className="tooltip tooltip-bottom"
      data-tip={t(`Switch to ${themes[0] != theme ? "light" : "dark"} theme`)}
    >
      <button
        className="btn btn-ghost btn-circle"
        onClick={() => setTheme(themes[0] != theme ? themes[0] : themes[1])}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-6 fill-current"
        >
          {themes[0] != theme ? (
            <path d="M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z" />
          ) : (
            <path d="M12,18C11.11,18 10.26,17.8 9.5,17.45C11.56,16.5 13,14.42 13,12C13,9.58 11.56,7.5 9.5,6.55C10.26,6.2 11.11,6 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z" />
          )}
        </svg>
      </button>
    </div>
    // <div title={t('Themes')} className='dropdown-end dropdown'>
    //     <div tabIndex="0" className="gap-1 normal-case btn btn-ghost">
    //         <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-5 w-5 stroke-current md:h-6 md:w-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
    //         <svg
    //             width="12px"
    //             height="12px"
    //             className="hidden ml-1 w-3 h-3 opacity-60 fill-current sm:inline-block"
    //             xmlns="http://www.w3.org/2000/svg"
    //             viewBox="0 0 2048 2048"
    //         >
    //             <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
    //         </svg>
    //     </div>
    //     <div className="overflow-y-auto top-px mt-16 w-56 h-[70vh] shadow-2xl dropdown-content rounded-t-box rounded-b-box bg-base-200 text-base-content">
    //         <ul className="gap-1 p-3 menu menu-compact">
    //             {themes.map((t) => (
    //                 <li key={t} >
    //                     <button
    //                         key={t}
    //                         className="overflow-hidden"
    //                         onClick={() => setTheme(t)}
    //                     >
    //                         {t}
    //                     </button>
    //                 </li>
    //             ))}
    //         </ul>

    //     </div>

    // </div>
  );
};

export default ThemeSwitcher;
