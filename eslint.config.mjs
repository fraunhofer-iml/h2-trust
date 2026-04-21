/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import nx from '@nx/eslint-plugin';
import licenseHeader from 'eslint-plugin-license-header';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/artifacts/**'],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'warn',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.js'],
    ignores: ['**/*.spec.ts', '**/*.test.ts', '**/fixtures/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@h2-trust/contracts/*/fixtures', '@h2-trust/contracts/*/fixtures/**'],
              message: 'Fixtures are test-only. Do not import them from production code.',
            },
            {
              group: ['apps/*', 'libs/*'],
              message: 'Use relative imports within an app/lib or @h2-trust/* aliases across boundaries.',
            },
          ],
        },
      ],
    },
  },
  {
    // Frontend: DTOs only - no entities & payloads
    files: ['apps/frontend/**/*.ts'],
    ignores: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@h2-trust/contracts/entities', '@h2-trust/contracts/entities/*'],
              message: 'Frontend must not import entities. Use @h2-trust/contracts/dtos.',
            },
            {
              group: ['@h2-trust/contracts/payloads', '@h2-trust/contracts/payloads/*'],
              message: 'Frontend must not import payloads. Use @h2-trust/contracts/dtos.',
            },
          ],
        },
      ],
    },
  },
  {
    // Microservices: entities & payloads only - no DTOs
    files: ['apps/process-svc/**/*.ts', 'apps/general-svc/**/*.ts'],
    ignores: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@h2-trust/contracts/dtos', '@h2-trust/contracts/dtos/*'],
              message: 'Microservices must not import DTOs. Use @h2-trust/contracts/payloads or /entities.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.cts', '**/*.mts', '**/*.js', '**/*.cjs', '**/*.mjs'],
    plugins: {
      'license-header': licenseHeader,
    },
    rules: {
      'license-header/header': ['error', '.license-header'],
    },
  },
  {
    files: ['**/*.ts', '**/*.cts', '**/*.mts', '**/*.js', '**/*.cjs', '**/*.mjs'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/exports': 'error',
    },
  },
];
