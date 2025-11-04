/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileSizePipe } from '../../../../shared/pipes/file-size.pipe';

@Component({
  selector: 'app-upload-form',
  imports: [
    FileSizePipe,
    CommonModule,
    MatTooltipModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatCardModule,
    MatNativeDateModule,
    MatDatepickerModule,
  ],
  templateUrl: './upload-form.component.html',
})
export class UploadFormComponent {
  uploadedFiles = input<{ file: File; documentType?: string }[]>([]);

  uploadDocument = output<{ file: File; documentType?: string }>();
  removeDocument = output<{ file: File; documentType?: string }>();

  formGroup: FormGroup = new FormGroup({
    documentType: new FormControl(null),
    file: new FormControl(null, Validators.required),
    description: new FormControl(null),
  });

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.formGroup.patchValue({ file });
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target.files) return;
    const file = target.files[0];
    this.formGroup.patchValue({
      file: file,
      documentType: file.type,
    });
  }

  submitDocument(): void {
    if (this.formGroup.valid) {
      this.uploadDocument.emit({
        file: this.formGroup.value.file,
        documentType: this.formGroup.value.documentType ?? this.formGroup.value.description,
      });
      this.formGroup.reset();
    }
  }
}
