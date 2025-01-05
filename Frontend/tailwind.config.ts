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
        background: "#EEEEEE", // Light gray background for a clean look
        foreground: "#222831", // Dark gray for main text, providing strong contrast

        card: {
          DEFAULT: "#f7f0f5", // Medium gray for card background
          foreground: "#393E46", // Light gray for card text
        },
        popover: {
          DEFAULT: "#393E46", // Medium gray for popover background
          foreground: "#EEEEEE", // Light gray for popover text
        },

        primary: {
          DEFAULT: "#00ADB5", // Vibrant teal for primary actions
          foreground: "#EEEEEE", // Light gray text on primary
        },
        secondary: {
          DEFAULT: "#393E46", // Lighter gray for secondary actions
          foreground: "#EEEEEE", // Light gray for secondary text
        },
        muted: {
          DEFAULT: "#EEEEEE", // Light gray background for muted areas
          foreground: "#393E46", // Medium gray text for muted content
        },
        accent: {
          DEFAULT: "#00ADB5", // Teal accent color
          foreground: "#EEEEEE", // Dark gray for accent text
        },
        destructive: {
          DEFAULT: "#B33030", // Muted red for destructive actions
          foreground: "#EEEEEE", // Light gray for destructive text
        },

        border: "#393E46", // Medium gray for borders
        input: "#00ADB5", // Light gray for input fields
        ring: "#00ADB5", // Teal focus ring for inputs and buttons

        chart: {
          "1": "#00ADB5", // Teal for charts
          "2": "#393E46", // Medium gray for charts
          "3": "#222831", // Dark gray for charts
          "4": "#B33030", // Red for destructive areas in charts
          "5": "#EEEEEE", // Light gray for chart highlights
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
};

export default config;
