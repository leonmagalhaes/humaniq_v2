/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bgdark': '#101728',
        'primary': '#9340FF',
        'secondary': '#CA3EAC',
        'tertiary': '#74279E',
        'dark-purple': '#131F45',
        'gray-light': '#DBDBDB',
        'gray-dark': '#232A39',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
