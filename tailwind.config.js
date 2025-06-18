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
      fontFamily: {
        sans: [
          'Inter',
          'Roboto', 
          'Noto Sans', // Noto Sans có hỗ trợ Tiếng Việt tốt
          'Roboto Condensed', // Tốt cho hiển thị trong UI
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
        mono: [
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'Consolas',
          'Liberation Mono',
          'Menlo',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}

