/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route } from '@angular/router';
import { AddProductionDataComponent } from './add-production-data/add-production-data.component';
import { ProductionViewComponent } from './generated-productions/production-view.component';
import { ProductionFilesComponent } from './uploaded-production-files/production-files.component';

export const PRODUCTION_ROUTES: Route[] = [
  {
    path: 'data',
    component: ProductionViewComponent,
  },
  {
    path: 'files',
    component: ProductionFilesComponent,
  },
  {
    path: 'add',
    component: AddProductionDataComponent,
  },
];
