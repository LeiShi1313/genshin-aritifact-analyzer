/** @type {import('tailwindcss').Config} */
const defaultTailwindTheme = require("tailwindcss/defaultTheme");
const defaultDaisyuiTheme = require("daisyui/src/colors/themes");

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
          secondary: "#93806a",
          accent: "#f7ba3f",
          neutral: "#424f65",
          "neutral-content": "#fff",
          "base-100": "#ece5d8",
        },
      },
      {
        genshin_dark: {
          ...defaultDaisyuiTheme["[data-theme=dark]"],
          primary: "#d3bc8e",
          "primary-content": "#424f65",
          secondary: "#93806a",
          accent: "#f7ba3f",
          neutral: "#424f65",
          "neutral-content": "#fff",
          "base-100": "#1c1c22",
        },
      },
      {
        zhongli: {
          primary: "#D3A84B",
          secondary: "#59400A",
          accent: "#241E20",
          "base-100": "#ECDCB0",
        },
      },
      {
        yun_jin: {
          primary: "#6F5076",
          secondary: "#451B1D",
          accent: "#7F171A",
          "base-100": "#DBCFD6",
        },
      },
      {
        yoimiya: {
          primary: "#D80000",
          secondary: "#A5412E",
          accent: "#DCAA7E",
          "base-100": "#ed7b7b",
        },
      },
      {
        RAIDEN_SHOGUN: {
          primary: "#8D56C0",
          secondary: "#B498D4",
          accent: "#EADAEC",
          "base-100": "#221256",
        },
      },
      {
        xingqiu: {
          primary: "#CEBBAA",
          secondary: "#305167",
          accent: "#EDE7E6",
          "base-100": "#2254a3",
        },
      },
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
