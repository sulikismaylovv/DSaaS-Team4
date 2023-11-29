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
        primary: {"50":"#faf5ff","100":"#f3e8ff","200":"#e9d5ff","300":"#d8b4fe","400":"#c084fc","500":"#a855f7","600":"#9333ea","700":"#7e22ce","800":"#6b21a8","900":"#581c87","950":"#3b0764"},
        'dark-mode': "#1c2632",
        'test': "#2c3642",
        'dark-mode-text': "#b5a8ee",
        'light-mode': "#fffff0",
        'navbar-hover-light':"#f5f5dd",
        'light-mode-acc': "#f5f5dd",
        'light-mode-text':"#1c2632",
        'gold': '#FFD700',
        //'light-mode-text':"#422f97",
        'pink':"#d154dd",
        //'dark-gray':"rgba(41,51,65,0.43)",
        'dark-gray':"#18202a",
        'gray':"#4C5474",
        'light-gray':"#848CA9",
        'lighter-purple':'#6F44C8',
        'very-light-purple':'#D2C7EE',
        'search-bar':"rgba(28,38,50,0.59)"
      },
      scale:{
        '150': '1.5',
        '175': '1.75',
        '185': '1.85',
        '200': '2',
        '300': '3',
        '400': '4',
        '500': '5',
        '600': '6',
        '700': '7',
      },
      width: {
        '40' : '10rem',
        '44' : '11rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
        '176': '44rem',
        '192': '48rem',
        '208': '52rem',
        '224': '56rem',
        '226': '56.5rem',
        '240': '60rem',
        '256': '64rem',
        '272': '68rem',
      },
      borderColor: theme => ({
        ...theme('colors'), // This ensures you keep all existing colors
        'gold': '#FFD700', // This adds 'gold' to the borderColor palette
      }),
      borderWidth: {
        '1': '1px',
        '2': '2px',
        '4': '4px',
        '5': '5px',
        '6': '6px',// In case you don't have this already
      },
    },
    fontFamily: {
      'body': [
        'Inter',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'system-ui',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji'
      ],
      'sans': [
        'Inter',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'system-ui',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji'
      ]
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
}
