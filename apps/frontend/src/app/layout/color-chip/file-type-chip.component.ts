/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { CsvContentType } from '@h2-trust/api';
import { BaseChipComponent } from './base-chip/base-chip.comopnent';

@Component({
  selector: 'app-file-type-color-chip',
  imports: [CommonModule],
  templateUrl: './base-chip/base-chip.comonent.html',
})
export class FileTypeChipComponent extends BaseChipComponent {
  fileType = input<CsvContentType>();

  private readonly chipColorByFileType = {
    HYDROGEN: 'text-primary-700 bg-primary-100 border-primary-200',
    POWER: 'text-secondary-700 bg-secondary-100 border-secondary-200',
  };
  private readonly dotColorByFileType = { HYDROGEN: 'bg-primary-700', POWER: 'bg-secondary-700' };

  get chipColor(): string | undefined {
    const fileType = this.fileType();
    return fileType ? this.chipColorByFileType[fileType] : undefined;
  }
  get dotColor(): string | undefined {
    const fileType = this.fileType();
    return fileType ? this.dotColorByFileType[fileType] : undefined;
  }
  get label(): string {
    const fileType = this.fileType();
    return fileType ? `${fileType} production` : 'unknown';
  }
}
