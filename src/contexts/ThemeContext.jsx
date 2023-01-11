import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const light_theme = 'autumn';
const dark_theme = 'luxury';

export const ThemeContext = React.createContext();

const setHtmlDataTheme = (theme) => {
    console.log(theme)
    const html = document.getElementsByTagName('html')[0]
    html.setAttribute('data-theme', theme)
}

export const ThemeProvider = ({ children }) => {
    const location = useLocation()
    const [theme, setTheme] = useState('')

    useEffect(() => {
        console.log(theme);
        if (location.pathname === '/build') return;
        let _theme = localStorage.getItem('genshin-aritifact-builds-theme')
        if (!!!_theme) {
            _theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? dark_theme : light_theme
        }
        console.log(_theme);
        // TODO: check valid theme
        setHtmlDataTheme(_theme)
        setTheme(_theme)
    }, [location])

    const value = useMemo(
        () => ({
            theme,
            setTheme: (_theme) => {
        console.log(theme);
                if (_theme === 'auto') {
                    _theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? dark_theme : light_theme
                    if (location.pathname !== '/build') localStorage.setItem('genshin-aritifact-builds-theme', '')
                } else {
                    if (location.pathname !== '/build') localStorage.setItem('genshin-aritifact-builds-theme', _theme)
                }
                setHtmlDataTheme(_theme)
                setTheme(_theme)
            }
        }),
        [theme, location]
    )
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
