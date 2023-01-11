import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const light_theme = 'autumn';
const dark_theme = 'luxury';

export const ThemeContext = React.createContext();

const setHtmlDataTheme = (theme) => {
    const html = document.getElementsByTagName('html')[0]
    html.setAttribute('data-theme', theme)
}

export const ThemeProvider = ({ children }) => {
    const location = useLocation()
    const [theme, setTheme] = useState('')

    useEffect(() => {
        if (location.pathname === '/build') return;
        let theme = localStorage.getItem('genshin-aritifact-builds-theme')
        if (!!!theme) {
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? dark_theme : light_theme
        }
        // TODO: check valid theme
        setHtmlDataTheme(theme)
        setTheme(theme)
    }, [location])

    const value = useMemo(
        () => ({
            theme,
            setTheme: (_theme) => {
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
        [theme]
    )
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
