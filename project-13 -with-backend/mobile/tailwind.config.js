/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffcf5',
          100: '#f9ddb1',
          200: '#f5c77e',
          300: '#f1b04c',
          400: '#ee9f27',
          500: '#ec9006', // Main brand color
          600: '#e88504',
          700: '#e27602',
          800: '#dc6601',
          900: '#d24e01',
        },
        surface: {
          DEFAULT: '#111111',
          100: '#1a1a1a',
          200: '#242424',
        },
        border: {
          DEFAULT: '#2e2e2e',
          subtle: '#1e1e1e',
        },
        text: {
          primary: '#f5f5f5',
          secondary: '#a3a3a3',
          muted: '#525252',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
