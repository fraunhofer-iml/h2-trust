/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route } from '@angular/router';
import { FileSelectionComponent } from './add-production-data/file-selection/file-selection.component';
import { AddProductionDataComponent } from './add-production-data/file-upload/add-production-data.component';
import { ProductionViewComponent } from './generated-productions/production-view.component';
import { ProductionFilesComponent } from './uploaded-production-files/production-files.component';

export const PRODUCTION_ROUTES: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'data',
  },
  {
    path: 'data',
    data: { breadcrumb: 'Data' },
    children: [
      {
        path: '',
        component: ProductionViewComponent,
      },
      {
        path: 'select',
        component: FileSelectionComponent,
        data: { breadcrumb: 'Select File' },
      },
    ],
  },
  {
    path: 'files',
    component: ProductionFilesComponent,
    data: { breadcrumb: 'Uploads' },
  },
  {
    path: 'add',
    component: AddProductionDataComponent,
    data: { breadcrumb: 'Add Data' },
  },
];
