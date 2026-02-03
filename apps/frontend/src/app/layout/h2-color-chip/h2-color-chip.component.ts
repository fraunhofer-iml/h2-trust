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
import { CsvContentType } from '@h2-trust/api';

@Component({
  selector: 'app-h2-color-chip',
  imports: [CommonModule, MatIconModule],
  templateUrl: './h2-color-chip.component.html',
})
export class H2ColorChipComponent {
  color = input<string>();
  fileType = input<CsvContentType>();

  getChipColor(): string {
    switch (this.color()) {
      case 'GREEN':
        return 'text-h2-green-text bg-h2-green/20 border-h2-green/10';
      case 'YELLOW':
        return 'text-h2-yellow-text bg-h2-yellow/20 border-h2-yellow/10';
      default:
        return ' text-neutral-600 bg-neutral-600/20 border-neutral-600/10';
    }
  }

  getFileChipColor(): string {
    switch (this.fileType()) {
      case 'HYDROGEN':
        return 'text-primary-700 bg-primary-100 border-primary-200';
      case 'POWER':
        return 'text-secondary-700 bg-secondary-100 border-secondary-200';
      default:
        return ' text-neutral-600 bg-neutral-600/20 border-neutral-600/10';
    }
  }

  getFileDotColor() {
    switch (this.fileType()) {
      case 'HYDROGEN':
        return 'bg-primary-700';
      case 'POWER':
        return 'bg-secondary-700';
      default:
        return 'bg-neutral-600';
    }
  }

  getDotColor() {
    switch (this.color()) {
      case 'GREEN':
        return 'bg-h2-green-text';
      case 'YELLOW':
        return 'bg-h2-yellow-text';
      default:
        return 'bg-neutral-600';
    }
  }
}
