import type { Config } from "tailwindcss";

const config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f6f2e8",
        ink: "#1d2a20",
        moss: "#355f45",
        mint: "#dce8d0",
        clay: "#b65c3d",
        dusk: "#9ca291",
        line: "#d7dccb"
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Segoe UI"', "sans-serif"],
        display: ['"Iowan Old Style"', '"Palatino Linotype"', "serif"]
      },
      boxShadow: {
        float: "0 32px 80px rgba(29, 42, 32, 0.16)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at top left, rgba(220, 232, 208, 0.8), transparent 38%), radial-gradient(circle at bottom right, rgba(182, 92, 61, 0.16), transparent 28%)"
      }
    }
  },
  plugins: []
} satisfies Config;

export default config;
