import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        axp: {
          blue: "#006FCF",
          navy: "#002663",
          ink: "#172033",
          mist: "#F3F7FA",
          line: "#D8E2EA"
        }
      },
      boxShadow: {
        panel: "0 10px 30px rgba(20, 36, 56, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
