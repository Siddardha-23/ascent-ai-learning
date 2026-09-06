import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Calm developer learning studio palette
        navy: {
          DEFAULT: "#0f1c33",
          900: "#0b1526",
          800: "#0f1c33",
          700: "#16263f",
          600: "#1f3352",
        },
        surface: {
          DEFAULT: "#f7f9fc",
          raised: "#ffffff",
          sunken: "#eef2f8",
        },
        action: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
          soft: "#dbe6ff",
        },
        progress: {
          DEFAULT: "#15803d",
          soft: "#dcfce7",
        },
        ink: {
          DEFAULT: "#1a2332",
          muted: "#4a5568",
          faint: "#718096",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        reading: "72ch",
      },
    },
  },
  plugins: [],
};

export default config;
