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
          50: '#f1f7f9',
          100: '#d2e5eb',
          200: '#a4c9d3',
          300: '#6aa7b4',
          400: '#3f8796',
          500: '#1f6a79',
          600: '#0f5361',
          700: '#0b3f4b',
          800: '#09323c',
          900: '#062127',
        },
        secondary: {
          50: '#e6f5ec',
          100: '#cce6d8',
          200: '#a8d0bf',
          300: '#85b8a6',
          400: '#689f8e',
          500: '#517f72',
          600: '#40665b',
          700: '#345147',
          800: '#273d35',
          900: '#192824',
        },
        tertiary: {
          50: '#fff4e3',
          100: '#fde7c0',
          200: '#f7c86f',
          300: '#f2ac33',
          400: '#d9961f',
          500: '#b47c0f',
          600: '#8d6300',
          700: '#7c5700',
          800: '#6b4b00',
          900: '#4a3300',
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
