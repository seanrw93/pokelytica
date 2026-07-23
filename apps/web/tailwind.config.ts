import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pocket: ["var(--font-pocket-monk)", "system-ui"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;