import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        weaviate: {
          lime: "#cfde22",
          limeHover: "#bdd01a",
          ink: "#1d156b",
          inkHover: "#150f52",
          pale: "#dcf090",
          slate: "#4c4b84",
          muted: "#8396b1",
          mutedLight: "#a2b9c0",
          paper: "#f7f9fd",
          border: "#dedcef",
          surface: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        'glow-lime': '0 0 25px -4px rgba(207, 222, 34, 0.45)',
        'glow-lime-sm': '0 0 12px -2px rgba(207, 222, 34, 0.35)',
        'glow-ink': '0 10px 30px -10px rgba(29, 21, 107, 0.18)',
        'card-weaviate': '0 4px 20px -2px rgba(29, 21, 107, 0.06), 0 2px 6px -1px rgba(29, 21, 107, 0.04)',
        'card-hover': '0 12px 32px -4px rgba(29, 21, 107, 0.12), 0 4px 12px -2px rgba(29, 21, 107, 0.08)',
      },
      borderRadius: {
        'pill': '9999px',
        'tile': '14px',
        'card': '24px',
      },
    },
  },
  plugins: [],
} satisfies Config;
