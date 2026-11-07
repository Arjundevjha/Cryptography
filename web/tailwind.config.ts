import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Cinzel", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      colors: {
        museum: {
          vault: "#090b10",
          surface: "#0f1218",
          panel: "rgba(12, 14, 20, 0.88)",
          gold: "#d4af37",
          "gold-light": "#f59e0b",
          "gold-dark": "#b45309",
          border: "rgba(212, 175, 55, 0.22)",
          "border-subtle": "rgba(255, 255, 255, 0.08)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
