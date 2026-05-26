/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProblemDetail } from '@h2-trust/contracts/dtos';

export const ProblemDetailFixture = {
  create: (overrides: Partial<ProblemDetail> = {}): ProblemDetail => ({
    type: overrides.type ?? 'https://example.com/problems/fixture',
    status: overrides.status ?? 400,
    title: overrides.title ?? 'Fixture problem',
    detail: overrides.detail ?? 'Fixture problem detail',
    instance: overrides.instance ?? '/fixture/resource',
    timestamp: overrides.timestamp ?? '2026-05-20T12:00:00.000Z',
    validationErrors: overrides.validationErrors,
  }),
} as const;
