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
}
