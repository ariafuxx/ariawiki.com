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
        offwhite: "#FAF9F6",
        primary: "#1A1A1A",
        secondary: "#6A6A62",
        muted: "#9A9A92",
        faded: "#B0AA9E",
        accent: "#E8A820",
        border: "#E8E6E0",
        "card-bg": "#FFFFFF",
        "pill-inactive-bg": "#EFEDE6",
        "pill-inactive-text": "#7A7A72",
      },
      fontFamily: {
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "var(--font-noto-sans-sc)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
        chinese: ["var(--font-noto-sans-sc)", "sans-serif"],
      },
      keyframes: {
        heroReveal: {
          from: { opacity: "0", transform: "translateY(50px) scale(0.96)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        subtitleIn: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        cardIn: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "hero-reveal": "heroReveal 1.1s cubic-bezier(.22,1,.36,1) 0.3s both",
        "subtitle-in": "subtitleIn 0.8s cubic-bezier(.22,1,.36,1) 0.7s both",
        "subtitle-in-delayed": "subtitleIn 0.8s cubic-bezier(.22,1,.36,1) 0.9s both",
        "fade-in": "fadeIn 0.8s ease 1s both",
        "fade-in-delayed": "fadeIn 0.8s ease 1.4s both",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
