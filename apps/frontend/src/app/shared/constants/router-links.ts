/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { H2TrustRoutes } from './routes';

const splitRoute = (route: H2TrustRoutes, ...tail: (string | number)[]) => ['/', ...route.split('/'), ...tail] as const;

export const H2TrustRouterLinks = {
  ROOT: [H2TrustRoutes.ROOT] as const,
  UNITS: ['/', H2TrustRoutes.UNITS] as const,
  UNIT_DETAILS: (id: string | number) => ['/', H2TrustRoutes.UNITS, id] as const,
  UNIT_EDIT: (id: string | number) => ['/', H2TrustRoutes.UNITS, id, 'edit'] as const,
  UNIT_CREATE: ['/', H2TrustRoutes.UNITS, 'create'] as const,
  BOTTLING: ['/', H2TrustRoutes.BOTTLING] as const,
  BATCH_DETAILS: (id: string | number) => ['/', H2TrustRoutes.BOTTLING, id] as const,
  BATCH_EDIT: (id: string | number) => ['/', H2TrustRoutes.BOTTLING, id, 'edit'] as const,
  BATCH_CREATE: ['/', H2TrustRoutes.BOTTLING, 'create'] as const,
  PPA_REQUESTS: ['/', H2TrustRoutes.PPA_REQUESTS] as const,
  PRODUCTION: ['/', H2TrustRoutes.PRODUCTION] as const,
  PRODUCTION_FILES: splitRoute(H2TrustRoutes.PRODUCTION_FILES),
  PRODUCTION_DATA: splitRoute(H2TrustRoutes.PRODUCTION_DATA),
  PRODUCTION_DATA_SELECT: splitRoute(H2TrustRoutes.PRODUCTION_DATA, 'select'),
  PRODUCTION_ADD: splitRoute(H2TrustRoutes.PRODUCTION_ADD),
} as const;
