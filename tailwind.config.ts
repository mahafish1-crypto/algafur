import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef8f3",
          100: "#d6efe2",
          200: "#afdfc5",
          300: "#7ec8a3",
          400: "#4ca97d",
          500: "#2d8d62",
          600: "#1e714d",
          700: "#185a3e",
          800: "#0b533b",
          900: "#064e3b",
          950: "#02261b",
          DEFAULT: "#064e3b",
        },
        gold: {
          50: "#fbf8ec",
          100: "#f5eccd",
          200: "#eddba1",
          300: "#e3c46e",
          400: "#d9ae43",
          500: "#c59b27",
          600: "#a97d1e",
          700: "#865e1b",
          800: "#6e4b1c",
          900: "#5c3e1b",
          DEFAULT: "#c59b27",
        },
        forest: {
          900: "#052319",
          950: "#02150f",
          DEFAULT: "#02261b",
        },
        ivory: {
          50: "#fdfdfa",
          100: "#fcfbf7",
          200: "#f7f5ed",
          300: "#ede8db",
          DEFAULT: "#fcfbf7",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "Traditional Arabic", "Amiri", "sans-serif"],
      },
      boxShadow: {
        premium: "0 10px 30px -5px rgba(6, 78, 59, 0.08), 0 4px 6px -2px rgba(6, 78, 59, 0.04)",
        gold: "0 10px 25px -5px rgba(197, 155, 39, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;

