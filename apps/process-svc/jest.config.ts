/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export default {
  displayName: 'process-svc',
  preset: '../../jest.preset.js',
  setupFiles: ['../../test/jest.setup.ts'], // TODO-MP: remove after new paths are in place
  testEnvironment: 'node',
  coverageReporters: [['lcov', { projectRoot: process.cwd() }], 'text', 'text-summary'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: './coverage',
};
