import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "power-yellow": "#fbbf24",
        "power-yellow-dim": "#b58900",
      },
      animation: {
        "power-pulse": "power-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "power-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
