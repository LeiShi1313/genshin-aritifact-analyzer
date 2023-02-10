import { useTranslation } from "react-i18next";
import { themes } from "../utils/theme";
import { ThemeContext } from "../contexts/ThemeContext";
import { useContext } from "react";

const ThemeSwitcher = () => {
    const { setTheme } = useContext(ThemeContext);
    const { t } = useTranslation();
    return (
        <div title={t('Themes')} className='dropdown-end dropdown'>
            <div tabIndex="0" className="gap-1 normal-case btn btn-ghost">
                <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-5 w-5 stroke-current md:h-6 md:w-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
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
            <div className="overflow-y-auto top-px mt-16 w-56 h-[70vh] shadow-2xl dropdown-content rounded-t-box rounded-b-box bg-base-200 text-base-content">
                <ul className="gap-1 p-3 menu menu-compact">
                    {themes.map((t) => (
                        <li key={t} >
                            <button
                                key={t}
                                className="overflow-hidden"
                                onClick={() => setTheme(t)}
                            >
                                {t}
                            </button>
                        </li>
                    ))}
                </ul>

            </div>

        </div>
    );
}

export default ThemeSwitcher;