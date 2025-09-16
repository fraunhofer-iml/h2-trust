/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route } from '@angular/router';
import { CreateUnitComponent } from './create/create-unit.component';
import { HydrogenAssetsComponent } from './hydrogen-assets.component';

export const HYDROGEN_ASSETS_ROUTES: Route[] = [
  {
    path: '',
    component: HydrogenAssetsComponent,
  },
  { path: 'create', component: CreateUnitComponent },
];
