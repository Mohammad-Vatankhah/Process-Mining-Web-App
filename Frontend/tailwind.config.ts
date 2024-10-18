import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FEFAE0", // Light Cornsilk for background
        foreground: "#283618", // Pakistan Green for main text

        card: {
          DEFAULT: "#F9FEEF", // Soft light Cornsilk for card background
          foreground: "#4A5734", // Darker Moss Green for card text
        },
        popover: {
          DEFAULT: "#DDA15E", // Earth Yellow for popover background
          foreground: "#283618", // Pakistan Green for popover text
        },

        primary: {
          DEFAULT: "#606C38", // Dark Moss Green for primary actions
          foreground: "#FEFAE0", // Cornsilk text on primary
        },
        secondary: {
          DEFAULT: "#283618", // Pakistan Green for secondary actions
          foreground: "#FEFAE0", // Cornsilk text for secondary
        },
        muted: {
          DEFAULT: "#DDA15E", // Earth Yellow for muted backgrounds
          foreground: "#606C38", // Dark Moss Green for muted text
        },
        accent: {
          DEFAULT: "#BC6C25", // Tiger's Eye for accents
          foreground: "#FEFAE0", // Cornsilk text on accent
        },
        destructive: {
          DEFAULT: "#BC6C25", // Tiger's Eye for destructive actions
          foreground: "#FEFAE0", // Cornsilk text for destructive
        },

        border: "#606C38", // Dark Moss Green for borders
        input: "#606C38", // Cornsilk for input fields
        ring: "#606C38", // Dark Moss Green for focus ring

        chart: {
          "1": "#606C38", // Dark Moss Green for charts
          "2": "#283618", // Pakistan Green for charts
          "3": "#DDA15E", // Earth Yellow for charts
          "4": "#BC6C25", // Tiger's Eye for charts (destructive)
          "5": "#FEFAE0", // Cornsilk for lighter chart elements
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
