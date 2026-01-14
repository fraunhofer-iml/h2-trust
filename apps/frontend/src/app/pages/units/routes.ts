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

export const HYDROGEN_ASSETS_ROUTES: Route[] = [
  {
    path: '',
    component: HydrogenAssetsComponent,
  },
  { path: 'power-production/:id', component: PowerProductionDetailsComponent },
  { path: 'hydrogen-storage/:id', component: HydrogenStorageDetailsComponent },
  { path: 'hydrogen-production/:id', component: HydrogenProductionDetailsComponent },

  { path: 'create', component: CreateUnitComponent },
];
