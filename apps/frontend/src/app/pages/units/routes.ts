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
import { HydrogenProductionUnitUpdateComponent } from './update/hydrogen-production-unit-update.component';
import { HydrogenStorageUnitUpdateComponent } from './update/hydrogen-storage-unit-update.component';
import { PowerProductionUnitUpdateComponent } from './update/power-production-unit-update.component';

export const HYDROGEN_ASSETS_ROUTES: Route[] = [
  {
    path: '',
    component: HydrogenAssetsComponent,
  },
  { path: 'power-production/:id', component: UnitDetailsPageComponent },
  { path: 'hydrogen-storage/:id', component: UnitDetailsPageComponent },
  { path: 'hydrogen-production/:id', component: UnitDetailsPageComponent },
  { path: 'create', component: CreateUnitComponent },
  { path: 'power-production/:id/edit', component: PowerProductionUnitUpdateComponent },
  { path: 'hydrogen-production/:id/edit', component: HydrogenProductionUnitUpdateComponent },
  { path: 'hydrogen-storage/:id/edit', component: HydrogenStorageUnitUpdateComponent },
];
