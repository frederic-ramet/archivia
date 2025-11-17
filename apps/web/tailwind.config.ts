import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        heritage: {
          50: "#FDF8F3",
          100: "#F5EBE0",
          200: "#E8D5C4",
          300: "#D4B896",
          400: "#C19A6B",
          500: "#A67B5B",
          600: "#8B6347",
          700: "#704F39",
          800: "#553D2E",
          900: "#3A2A1F",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
