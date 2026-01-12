/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route } from '@angular/router';
import { CreateUnitComponent } from './create/create-unit.component';
import { HydrogenProductionDetailsComponent } from './details/hydrogen-production/hydrogen-production-details.component';
import { HydrogenStorageDetailsComponent } from './details/hydrogen-storage/hydrogen-storage-details.component';
import { PowerProductionDetailsComponent } from './details/power-production/power-production-details.component';
import { HydrogenAssetsComponent } from './hydrogen-assets.component';
import { HydrogenProductionTableComponent } from './tables/hydrogen-production-table/hydrogen-production-table.component';
import { HydrogenStorageTableComponent } from './tables/hydrogen-storage-table/hydrogen-storage-table.component';
import { PowerProductionTableComponent } from './tables/power-production-table/power-production-table.component';

export const HYDROGEN_ASSETS_ROUTES: Route[] = [
  {
    path: '',
    component: HydrogenAssetsComponent,
    children: [
      {
        path: 'power-production',
        children: [
          { path: '', component: PowerProductionTableComponent },
          { path: ':id', component: PowerProductionDetailsComponent },
        ],
      },
      {
        path: 'hydrogen-production',
        children: [
          { path: '', component: HydrogenProductionTableComponent },
          { path: ':id', component: HydrogenProductionDetailsComponent },
        ],
      },
      {
        path: 'hydrogen-storage',
        children: [
          { path: '', component: HydrogenStorageTableComponent },
          { path: ':id', component: HydrogenStorageDetailsComponent },
        ],
      },
    ],
  },
  { path: 'create', component: CreateUnitComponent },
];
