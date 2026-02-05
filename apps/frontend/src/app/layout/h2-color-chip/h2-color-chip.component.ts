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

  private readonly chipColorByColor: Record<string, string> = {
    GREEN: 'text-h2-green-text bg-h2-green/20 border-h2-green/10',
    YELLOW: 'text-h2-yellow-text bg-h2-yellow/20 border-h2-yellow/10',
  };

  private readonly chipColorByFileType: Record<CsvContentType, string> = {
    HYDROGEN: 'text-primary-700 bg-primary-100 border-primary-200',
    POWER: 'text-secondary-700 bg-secondary-100 border-secondary-200',
  };

  private readonly dotColorByColor: Record<string, string> = {
    GREEN: 'bg-h2-green-text',
    YELLOW: 'bg-h2-yellow-text',
  };

  private readonly dotColorByFileType: Record<CsvContentType, string> = {
    HYDROGEN: 'bg-primary-700',
    POWER: 'bg-secondary-700',
  };

  private readonly defaultChipColor = 'text-neutral-600 bg-neutral-600/20 border-neutral-600/10';
  private readonly defaultDotColor = 'bg-neutral-600';

  get resolvedChipClasses(): string {
    const color = this.color();
    const fileType = this.fileType();

    if (color) {
      return this.chipColorByColor[color] ?? this.defaultChipColor;
    }
    if (fileType) {
      return this.chipColorByFileType[fileType] ?? this.defaultChipColor;
    }
    return this.defaultChipColor;
  }

  get resolvedDotClasses(): string {
    const color = this.color();
    const fileType = this.fileType();

    if (color) {
      return this.dotColorByColor[color] ?? this.defaultDotColor;
    }
    if (fileType) {
      return this.dotColorByFileType[fileType] ?? this.defaultDotColor;
    }
    return this.defaultDotColor;
  }

  get label(): string {
    const color = this.color();
    const fileType = this.fileType();

    if (color) {
      return color;
    }

    if (fileType) {
      return `${fileType} production`;
    }

    return 'unknown';
  }
}
