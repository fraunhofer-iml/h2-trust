/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rfnbo-chip',
  imports: [CommonModule, MatIconModule],
  templateUrl: './rfnbo-chip.component.html',
})
export class RfnboChipComponent {
  isRFNBOready = input<boolean>();
}
