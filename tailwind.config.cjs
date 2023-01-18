/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      aspectRatio: {
        '2/3': '2 / 3',
        '5/8': '5 / 8',
      },
    },
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
  daisyui: {
    themes: [
      {
        zhongli: {
          "primary": "#D3A84B",
          "secondary": "#59400A",
          "accent": "#241E20",
          "base-100": "#ECDCB0",
        },
      },
      {
        yun_jin: {
          "primary": "#6F5076",
          "secondary": "#451B1D",
          "accent": "#7F171A",
          "base-100": "#DBCFD6",
        }
      },
      {
        yoimiya: {
          "primary": "#D80000",
          "secondary": "#A5412E",
          "accent": "#DCAA7E",
          "base-100": "#ed7b7b",
        }
      },
      {
        RAIDEN_SHOGUN: {
          "primary": "#8D56C0",
          "secondary": "#B498D4",
          "accent": "#EADAEC",
          "base-100": "#221256",
        }
      },
      {
        xingqiu: {
          "primary": "#CEBBAA",
          "secondary": "#305167",
          "accent": "#EDE7E6",
          "base-100": "#2254a3",
        }
      },
      "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"
    ],
  }
}
