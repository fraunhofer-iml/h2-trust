/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'), ...createGlobPatternsForDependencies(__dirname)],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f4fa',
          100: '#e6e4f2',
          200: '#cecbdf',
          300: '#b4b1cb',
          400: '#9491ae',
          500: '#757493',
          600: '#5c5c79',
          700: '#50506d',
          800: '#444461',
          900: '#2e2e49',
        },
        secondary: {
          50: '#e4f2ee',
          100: '#c9e0d9',
          200: '#a5c8c0',
          300: '#82afa7',
          400: '#64958f',
          500: '#4d7873',
          600: '#3c605c',
          700: '#304b47',
          800: '#243735',
          900: '#162322',
        },
        tertiary: {
          50: '#ffecf4', // 95
          100: '#ffd8ed', // 90
          200: '#e5bbd2', // 80
          300: '#c8a0b7', // 70
          400: '#ac869c', // 60
          500: '#906d82', // 50
          600: '#765469', // 40
          700: '#69495d', // 35
          800: '#5c3d51', // 30
          900: '#44273a', // 20
        },
        'h2-yellow': '#F0D354',
        'h2-pink': '#BD608B',
        'h2-green': '#4F9C83',
        'h2-orange': '#CF9153',

        'h2-yellow-text': '#9c7f02',
        'h2-pink-text': '#731f46',
        'h2-green-text': '#1f5c52',
        'h2-orange-text': '#8f571f',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
