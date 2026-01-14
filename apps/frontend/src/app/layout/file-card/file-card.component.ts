/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';

@Component({
  selector: 'app-file-card',
  imports: [CommonModule, FileSizePipe],
  templateUrl: './file-card.component.html',
})
export class FileCardComponent {
  file = input.required<File | null>();
  showDeleteButton = input<boolean>(false);

  deleteEmitter = output<void>();
}
