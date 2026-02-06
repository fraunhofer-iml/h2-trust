/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-proof-of-origin-card',
  imports: [],
  templateUrl: './proof-of-origin-card.component.html',
})
export class ProofOfOriginCardComponent {
  icon = input.required<string>();
}
