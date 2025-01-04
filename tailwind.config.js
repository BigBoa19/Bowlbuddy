/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#161622',
        secondary: '#8a92eb',
        tertiary: '#ccccff',
        background: '#252537',
      },
      fontFamily: {
        gBlack: ["Gotham-Black", "sans-serif"],
        gBold: ["Gotham-Bold", "sans-serif"],
        gBook: ["Gotham-Book", "sans-serif"],
        gLight: ["Gotham-Light", "sans-serif"],
        gMedium: ["Gotham-Medium", "sans-serif"],
        gThin: ["Gotham-Thin", "sans-serif"],
        gUltra: ["Gotham-Ultra", "sans-serif"],
        gXLight: ["Gotham-XLight", "sans-serif"],

      },
    },
  },
  plugins: [],
}
