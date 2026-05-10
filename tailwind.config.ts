import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#337C99",
        "primary-dark": "#265d73",
        danger: "#b6070e",
        "danger-dark": "#8c0509",
        warning: "#f33b41",
        info: "#00141B",
        "info-mid": "#0e2730",
        light: "#F7F7F7",
        dark: "#131313",
        muted: "#6c757d",
        "muted-light": "#cfd4da",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        figtree: ["var(--font-figtree)", "Figtree", "sans-serif"],
      },
      fontSize: {
        body: ["1.2rem", { lineHeight: "1.5", fontWeight: "300" }],
      },
      backgroundImage: {
        "primary-to-info": "linear-gradient(to left, #337C99, #00141B)",
        "info-to-danger": "linear-gradient(to left, #b6070e, #00141B)",
        "services-gradient": "linear-gradient(to top, #0e2730, #00141B)",
        "hero-gradient": "linear-gradient(180deg, rgb(0 0 0), rgb(0 0 0 / 10%), rgb(0 0 0 / 40%), rgb(0 0 0 / 88%), rgb(0 0 0))",
        "why-overlay": "linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
