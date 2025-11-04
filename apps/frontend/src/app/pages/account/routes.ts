/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route } from '@angular/router';
import { AccountOverviewComponent } from './account-overview/account-overview.component';

export const ACCOUNT_ROUTES: Route[] = [
  {
    path: '',
    component: AccountOverviewComponent,
  },
];
