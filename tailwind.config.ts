import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0f172a",
          raised: "#1e293b"
        },
        primary: "#38bdf8",
        accent: "#22d3ee"
      }
    }
  },
  plugins: []
} satisfies Config;
