/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route } from '@angular/router';
import { canActivateAuth } from './guards/auth.guard';
import { H2TrustRoutes } from './shared/constants/routes';

export const appRoutes: Route[] = [
  {
    path: '',
    canActivate: [canActivateAuth],
    loadChildren: () => import('./pages/account/routes').then((m) => m.ACCOUNT_ROUTES),
  },
  {
    path: H2TrustRoutes.UNITS,
    canActivate: [canActivateAuth],
    loadChildren: () => import('./pages/units/routes').then((m) => m.HYDROGEN_ASSETS_ROUTES),
  },
  {
    path: H2TrustRoutes.PRODUCTION,
    canActivate: [canActivateAuth],
    loadChildren: () => import('./pages/production/routes').then((m) => m.PRODUCTION_ROUTES),
  },
  {
    path: H2TrustRoutes.BATCHES,
    canActivate: [canActivateAuth],
    loadChildren: () => import('./pages/batches/routes').then((m) => m.BATCH_ROUTES),
  },
];
