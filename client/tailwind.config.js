/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        grey01: "#f3f3f3",
        grey: "#7D7D7D",
        primary: "#F76B10",
        darkBg: "#242424",
        lightGrey: "#E1E1E1",
        whiteBG: "#FFFCF8",
      },
    },
  },
  plugins: [],
};
