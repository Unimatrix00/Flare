import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        flare: {
          blue: "#4ec7ff",
          orange: "#ff8a3d",
          ember: "#ff4f1f",
          void: "#050814",
        },
      },
      fontFamily: {
        display: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
    },
  },
};

export default config;
