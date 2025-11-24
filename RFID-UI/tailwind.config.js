/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  extend: {
    fontSize: {
      base: "18px",
      lg: "20px",
      xl: "24px",
      "2xl": "28px",
    },
    lineHeight: {
      base: "28px",
      lg: "32px",
      xl: "36px",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
    }
  },
},
  plugins: [],
}
