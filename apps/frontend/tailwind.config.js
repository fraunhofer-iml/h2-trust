const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'), ...createGlobPatternsForDependencies(__dirname)],
  theme: {
    extend: {
      colors: {
        primary: {
          0: '#000000',
          100: '#5f5f92',
          200: '#6d6da0',
          300: '#7a7aad',
          400: '#8686c0',
          500: '#9292cd',
          600: '#9e9ed8',
          700: '#aaaaf2',
          800: '#b6b6ff',
          900: '#c2c2ff',
          950: '#d1d1ff',
          980: '#e0e0ff',
          990: '#eeeeff',
        },
        secondary: {
          0: '#000000',
          100: '#045c50',
          200: '#077d6a',
          300: '#0a947f',
          400: '#2ea591',
          500: '#4cb6a4',
          600: '#6ac8b7',
          700: '#89dacb',
          800: '#a7ece0',
          900: '#c5fff5',
          950: '#d7fff9',
          980: '#eafffd',
          990: '#f9fffe',
        },
      },
    },
  },
};
