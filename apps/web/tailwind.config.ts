import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#E0004D",
          "pink-hover": "#E94D82",
          "pink-light": "#FFE5EB",
        },
        neutral: {
          dark: "#333333",
          border: "#E5E7EB",
          muted: "#6B7280",
        },
        status: {
          success: "#10B981",
          warning: "#F59E0B",
          error: "#E0004D",
          info: "#3B82F6",
        },
      },
      boxShadow: {
        card: "0px 2px 8px rgba(0,0,0,0.08)",
        "card-hover": "0px 4px 16px rgba(0,0,0,0.12)",
        "focus-pink": "0px 0px 0px 3px rgba(224,0,77,0.1)",
      },
      borderRadius: {
        btn: "4px",
        card: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
