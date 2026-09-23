import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F7F1E3",
        apricot: "#FF8A4C",
        ink: "#2A1F18",
        sky: "#7EB8E8",
        blush: "#F5C4D8",
        butter: "#F5E27A",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        card: "48px",
      },
    },
  },
  plugins: [],
};

export default config;
