/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd5',
          200: '#fad5a5',
          300: '#f7b56b',
          400: '#f38d2b',
          500: '#f0710b',
          600: '#e15706',
          700: '#ba410a',
          800: '#94340f',
          900: '#782c0f',
        },
        secondary: {
          50: '#f4f7ee',
          100: '#e5ecda',
          200: '#c5d8b0',
          300: '#9bbd7d',
          400: '#6a9b47',
          500: '#4d7a2e',
          600: '#3d6124',
          700: '#324d1f',
          800: '#2b3f1d',
          900: '#25351a',
        },
      },
    },
  },
  plugins: [],
}
