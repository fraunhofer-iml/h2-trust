/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route } from '@angular/router';
import { AUTH_GUARD } from '../../guards/auth.guard';
import { AddBottleComponent } from './add-bottle/add-bottle.component';
import { ProductPassComponent } from './details/product-pass.component';
import { BottlingOverviewComponent } from './overview/bottling-overview.component';

export const BOTTLING_ROUTES: Route[] = [
  {
    path: '',
    canActivate: [AUTH_GUARD],
    component: BottlingOverviewComponent,
  },
  {
    path: 'create',
    canActivate: [AUTH_GUARD],
    component: AddBottleComponent,
  },
  {
    path: ':id',
    component: ProductPassComponent,
  },
];
