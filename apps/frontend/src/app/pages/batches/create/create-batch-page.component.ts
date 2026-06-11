/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddBottleComponent } from './add-bottle/add-bottle.component';

@Component({
  selector: 'app-create-batch-page',
  imports: [RouterModule, AddBottleComponent],
  templateUrl: './create-batch-page.component.html',
})
export class CreateBatchPageComponent {}
