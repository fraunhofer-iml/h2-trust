/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-card',
  template: `<div class="h-full w-full animate-pulse rounded-md bg-white"></div>`,
})
export class LoadingCardComponent {}
