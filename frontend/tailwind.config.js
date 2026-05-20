/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        accent: '#06B6D4',
        success: '#26A69A',
        'nexa-dark': '#0A0A0F',
        'nexa-bg': '#1A1A2E',
        background: '#0A0A0F',
      },
    },
  },
  plugins: [],
}

