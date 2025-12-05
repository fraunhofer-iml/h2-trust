/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';

@Component({
  selector: 'app-info-tooltip',
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './info-tooltip.component.html',
})
export class InfoTooltipComponent {
  tooltip = input.required<string>();
  style = input<'primary' | 'neutral'>('neutral');
  position = input<TooltipPosition>('below');
}
