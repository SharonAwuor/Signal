import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1120",
        surface: "#131C2E",
        surface2: "#1B2740",
        line: "#253150",
        text: "#E7ECF5",
        muted: "#8B96AB",
        dim: "#556077",
        cyan: "#38BDF8",
        green: "#34D399",
        amber: "#FBBF24",
        red: "#FB4D6B",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      keyframes: {
        ring: {
          "0%": { transform: "scale(0.6)", opacity: "0.9" },
          "100%": { transform: "scale(1.9)", opacity: "0" },
        },
        toastIn: {
          from: { transform: "translateX(30px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        pulseBg: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        ring: "ring 1.6s ease-out 1",
        toastIn: "toastIn 0.35s cubic-bezier(.2,.9,.25,1)",
        pulseBg: "pulseBg 2s infinite",
        fadeUp: "fadeUp 0.4s ease",
      },
    },
  },
  plugins: [],
};
export default config;
