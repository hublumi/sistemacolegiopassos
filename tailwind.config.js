/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        "on-primary": "var(--on-primary)",
        secondary: "var(--secondary)",
        "on-surface": "var(--on-surface)",
        "outline-variant": "var(--outline-variant)",
        "secondary-container": "var(--secondary-container)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "surface-container-highest": "var(--surface-container-highest)",
        "surface-container-high": "var(--surface-container-high)",
        "brand-orange": "#F97316",
        "brand-cream": "#FDFAF6",
        "brand-dark": "#1C1917",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "40px",
        gutter: "24px",
      }
    },
  },
  plugins: [],
}
