/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route } from '@angular/router';
import { CreateUnitComponent } from './create/create-unit.component';
import { UnitDetailsPageComponent } from './details/unit-details-page.component';
import { HydrogenAssetsComponent } from './overview/hydrogen-assets.component';
import { UnitUpdatePageComponent } from './update/unit-update-page.component';

export const HYDROGEN_ASSETS_ROUTES: Route[] = [
  {
    path: '',
    component: HydrogenAssetsComponent,
  },
  { path: 'create', component: CreateUnitComponent, data: { breadcrumb: 'Create' } },
  {
    path: ':id',
    data: { breadcrumb: 'Details' },
    children: [
      {
        path: '',
        component: UnitDetailsPageComponent,
      },
      {
        path: 'edit',
        component: UnitUpdatePageComponent,
        data: { breadcrumb: 'Edit' },
      },
    ],
  },
];
