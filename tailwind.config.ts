import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F2",
        charcoal: "#1F2937",
        adobo: {
          DEFAULT: "#C2410C",
          dark: "#9A3412",
          soft: "#FFF1E8",
        },
        calamansi: {
          DEFAULT: "#15803D",
          soft: "#ECFDF3",
        },
      },
      boxShadow: {
        card: "0 10px 30px -18px rgba(31, 41, 55, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
