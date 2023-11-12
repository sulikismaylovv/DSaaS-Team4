/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        gold: '#FFD700' // This adds a new color named 'gold'
      },
      borderColor: theme => ({
        ...theme('colors'), // This ensures you keep all existing colors
        'gold': '#FFD700', // This adds 'gold' to the borderColor palette
      }),
      borderWidth: {
        '4': '4px', // In case you don't have this already
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
