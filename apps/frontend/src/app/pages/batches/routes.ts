/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route } from '@angular/router';
import { canActivateAuth } from '../../guards/auth.guard';
import { CreateBatchPageComponent } from './create/create-batch-page.component';
import { ProductPassComponent } from './dpp/product-pass.component';
import { BatchPageComponent } from './overview/batch-page.component';

export const BATCH_ROUTES: Route[] = [
  {
    path: '',
    canActivate: [canActivateAuth],
    component: BatchPageComponent,
  },
  {
    path: 'create',
    canActivate: [canActivateAuth],
    component: CreateBatchPageComponent,
    data: { breadcrumb: 'Create' },
  },
  {
    path: ':id',
    canActivate: [canActivateAuth],
    component: ProductPassComponent,
    data: { breadcrumb: 'Digital Product Passport' },
  },
];
