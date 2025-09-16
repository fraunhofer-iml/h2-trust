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
  selector: 'app-h2-color-chip',
  imports: [CommonModule, MatIconModule],
  templateUrl: './h2-color-chip.component.html',
})
export class H2ColorChipComponent {
  color = input<string>();

  getChipColor(): string {
    switch (this.color()) {
      case 'GREEN':
        return 'text-h2-green-text bg-h2-green/20 border-h2-green/10';
      case 'PINK':
        return 'text-h2-pink-text bg-h2-pink/20 border-h2-pink/10';
      case 'ORANGE':
        return 'text-h2-orange-text bg-h2-orange/20 border-h2-orange/10';
      case 'YELLOW':
        return 'text-h2-yellow-text bg-h2-yellow/20 border-h2-yellow/10';
      default:
        return ' text-neutral-600 bg-neutral-600/20 border-neutral-600/10';
    }
  }

  getDotColor() {
    switch (this.color()) {
      case 'GREEN':
        return 'bg-h2-green-text';
      case 'PINK':
        return 'bg-h2-pink-text';
      case 'ORANGE':
        return 'bg-h2-orange-text';
      case 'YELLOW':
        return 'bg-h2-yellow-text';
      default:
        return 'bg-neutral-600';
    }
  }
}
