/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { H2TrustRoutes } from './routes';

export const H2TrustRouterLinks = {
  ROOT: [H2TrustRoutes.ROOT] as const,
  UNITS: ['/', H2TrustRoutes.UNITS] as const,
  UNIT_DETAILS: (id: string) => ['/', H2TrustRoutes.UNITS, id] as const,
  UNIT_EDIT: (id: string) => ['/', H2TrustRoutes.UNITS, id, 'edit'] as const,
  UNIT_CREATE: ['/', H2TrustRoutes.UNITS, 'create'] as const,
  BOTTLING: ['/', H2TrustRoutes.BOTTLING] as const,
  BATCH: ['/', H2TrustRoutes.BOTTLING] as const,
  BATCH_DETAILS: (id: string) => ['/', H2TrustRoutes.BOTTLING, id] as const,
  BATCH_EDIT: (id: string) => ['/', H2TrustRoutes.BOTTLING, id, 'edit'] as const,
  BATCH_CREATE: ['/', H2TrustRoutes.BOTTLING, 'create'] as const,
  PPA_REQUESTS: ['/', H2TrustRoutes.PPA_REQUESTS] as const,
  PRODUCTION: ['/', H2TrustRoutes.PRODUCTION] as const,
  PRODUCTION_FILES: ['/', H2TrustRoutes.PRODUCTION, H2TrustRoutes.FILES] as const,
  PRODUCTION_DATA: ['/', H2TrustRoutes.PRODUCTION, H2TrustRoutes.DATA] as const,
  PRODUCTION_DATA_SELECT: ['/', H2TrustRoutes.PRODUCTION, H2TrustRoutes.DATA, 'select'] as const,
  PRODUCTION_ADD: ['/', H2TrustRoutes.PRODUCTION, 'add'] as const,
} as const;
