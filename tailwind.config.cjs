/** @type {import('tailwindcss').Config} */
const defaultTailwindTheme = require("tailwindcss/defaultTheme");
const defaultDaisyuiTheme = require("daisyui/src/theming/themes");
const characterThemes = require('./src/data/genshin_character_themes.json');

module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    fontFamily: {
      sans: ["GS", ...defaultTailwindTheme.fontFamily.sans],
    },
    extend: {
      aspectRatio: {
        "2/3": "2 / 3",
        "5/8": "5 / 8",
      },
    },
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
  daisyui: {
    themes: [
      {
        genshin: {
          ...defaultDaisyuiTheme["[data-theme=light]"],
          primary: "#424f65",
          "primary-content": "#ece5d8",
          secondary: "#93806a",
          accent: "#f7ba3f",
          "accent-content": "#1c1c22",
          neutral: "#424f65",
          "neutral-content": "#ece5d8",
          "base-100": "#ece5d8",
          "base-200": "rgba(242, 242, 242, 0)",
        },
      },
      {
        genshin_dark: {
          ...defaultDaisyuiTheme["[data-theme=dark]"],
          primary: "#d3bc8e",
          "primary-content": "#424f65",
          secondary: "#93806a",
          accent: "#f7ba3f",
          "accent-content": "#1c1c22",
          neutral: "#424f65",
          "neutral-content": "#ece5d8",
          "base-100": "#1c1c22",
        },
      },
      ...characterThemes,
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
    ],
  },
};
