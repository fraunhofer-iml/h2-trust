/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FileTypes } from '../../shared/constants/file-types';

@Component({
  selector: 'app-file-drag-and-drop',
  imports: [CommonModule],
  templateUrl: './file-drag-and-drop.component.html',
})
export class FileDragAndDropComponent {
  acceptedFileTypes = input<FileTypes>();
  fileSelected = output<File>();

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target.files) return;
    const file = target.files[0];
    this.fileSelected.emit(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    this.fileSelected.emit(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }
}
