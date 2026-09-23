import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F2E7",
        paperLine: "#DED0AC",
        ink: "#2B2318",
        inkSoft: "#6B6050",
        due: "#8B2E2E",
        dueSoft: "#F3E1DD",
        paid: "#3F6B4F",
        paidSoft: "#E1EBE1",
        amber: "#C77D26",
        amberDark: "#A5641B",
        card: "#FFFDF8",
      },
      fontFamily: {
        slab: ["var(--font-slab)", "serif"],
        sans: ["var(--font-work)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
