/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#E6F0FF',  // Very light blue
          DEFAULT: '#3B82F6', // Medium blue
          dark: '#1E40AF',    // Dark blue
          hover: '#60A5FA',   // Light blue for hover
          text: '#1E3A8A',    // Dark blue for text
        },
      },
    },
  },
  plugins: [],
}

