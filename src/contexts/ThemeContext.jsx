import React, { useState, useMemo } from "react";
import { useEffect } from "react";

const light_theme = 'autumn';
const dark_theme = 'luxury';

export const ThemeContext = React.createContext();

const setHtmlDataTheme = (theme) => {
    const html = document.getElementsByTagName('html')[0]
    html.setAttribute('data-theme', theme)
}

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('')

    useEffect(() => {
        let theme = localStorage.getItem('genshin-aritifact-builds-theme')
        if (!!!theme) {
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? dark_theme : light_theme
        }
        // TODO: check valid theme
        setHtmlDataTheme(theme)
        setTheme(theme)
    }, [])

    const value = useMemo(
        () => ({
            theme,
            setTheme: (_theme) => {
                console.log(_theme)
                if (_theme === 'auto') {
                    _theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? dark_theme : light_theme
                    localStorage.setItem('genshin-aritifact-builds-theme', '')
                } else {
                    localStorage.setItem('genshin-aritifact-builds-theme', _theme)
                }
                setHtmlDataTheme(_theme)
                setTheme(_theme)
            }
        }),
        [theme]
    )
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
