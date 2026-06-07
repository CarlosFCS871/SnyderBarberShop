/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#121212',   // Negro
        accent: '#FFC107',    // Amarillo
        white: '#FFFFFF',     // Blanco
      }
    },
  },
  plugins: [],
}