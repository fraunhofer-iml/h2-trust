/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileDragAndDropComponent } from 'apps/frontend/src/app/layout/drag-and-drop/file-drag-and-drop.component';
import { FileTypes } from 'apps/frontend/src/app/shared/constants/file-types';
import { ROUTES } from 'apps/frontend/src/app/shared/constants/routes';
import { FileSizePipe } from 'apps/frontend/src/app/shared/pipes/file-size.pipe';
import { ProductionService } from 'apps/frontend/src/app/shared/services/production/production.service';
import { minFormArrayLength } from 'apps/frontend/src/app/shared/util/form-array-lengh.validator';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { injectMutation } from '@tanstack/angular-query-experimental';
import {
  HydrogenProductionOverviewDto,
  HydrogenStorageOverviewDto,
  ImportSubmissionDto,
  PowerProductionOverviewDto,
} from '@h2-trust/api';
import { FileUploadKeys, MeasurementUnit } from '@h2-trust/domain';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';
import { FileForm } from './file-upload.form';

@Component({
  selector: 'app-production-csv-upload',
  imports: [
    CommonModule,
    MatRadioModule,
    MatChipsModule,
    MatButtonModule,
    FileDragAndDropComponent,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatSelectModule,
    MatInputModule,
    FileSizePipe,
    MatButtonModule,
    UnitPipe,
    MatProgressBarModule,
  ],
  templateUrl: './production-csv-upload.component.html',
})
export class ProductionCsvUploadComponent {
  protected readonly MeasurementUnit = MeasurementUnit;
  protected readonly FileTypes = FileTypes;

  productionService: ProductionService = inject(ProductionService);
  router = inject(Router);

  powerAccessApprovals = input<{ value: PowerProductionOverviewDto; name: string }[]>([]);
  hydrogenProductionUnits = input<HydrogenProductionOverviewDto[]>([]);
  hydrogenStorageUnits = input<HydrogenStorageOverviewDto[]>([]);

  form = new FormGroup({
    hydrogenProductionFiles: new FormArray<FileForm>([], minFormArrayLength(1)),
    powerProductionFiles: new FormArray<FileForm>([], minFormArrayLength(1)),
  });

  storageUnit = new FormControl<string | null>('', Validators.required);

  mutation = injectMutation(() => ({
    mutationFn: (data: FormData) => {
      return this.productionService.uploadCsv(data);
    },
    onError: (e: HttpErrorResponse) => {
      console.error(e);
      toast.error(e.error.message);
    },
  }));

  submitMutation = injectMutation(() => ({
    mutationFn: (dto: ImportSubmissionDto) => {
      return this.productionService.submitCsv(dto);
    },
    onSuccess: () => this.router.navigateByUrl(ROUTES.PRODUCTION),
    onError: (e: HttpErrorResponse) => {
      console.error(e);
      toast.error(e.error.message);
    },
  }));

  constructor() {
    this.form.updateValueAndValidity();
  }

  get hydrogenProductionFiles() {
    return this.form.get(FileUploadKeys.HYDROGEN_PRODUCTION) as FormArray<FileForm>;
  }
  get powerProductionFiles() {
    return this.form.get(FileUploadKeys.POWER_PRODUCTION) as FormArray<FileForm>;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  submit() {
    const data = new FormData();

    this.form.controls.powerProductionFiles.controls.forEach((control) => {
      const file: File | null = control.controls.file.value;
      const unitId = control.value.unitId;
      if (file && unitId) {
        data.append(FileUploadKeys.POWER_PRODUCTION, file);
        data.append('powerProductionUnitIds', unitId);
      }
    });

    this.form.controls.hydrogenProductionFiles.controls.forEach((control) => {
      const file: File | null = control.controls.file.value;
      const unitId = control.value.unitId;
      if (file && unitId) {
        data.append(FileUploadKeys.HYDROGEN_PRODUCTION, file);
        data.append('hydrogenProductionUnitIds', unitId);
      }
    });

    this.mutation.mutate(data);
  }

  removeFile(index: number, form: FormArray<FileForm> | FormArray<FormGroup<{ file: FormControl<File | null> }>>) {
    form.controls.splice(index, 1);
    form.updateValueAndValidity();
  }

  addHydrogenProductionFileWithUnit(file: File, form: FormArray<FileForm>) {
    form.clear();
    this.addFileFormWithUnit(file, form);
  }

  addFileFormWithUnit(file: File, form: FormArray<FileForm>) {
    form.push(
      new FormGroup<{ file: FormControl<File | null>; unitId: FormControl<string | null> }>({
        file: new FormControl<File | null>(file),
        unitId: new FormControl<string | null>(null, Validators.required),
      }),
    );
  }

  save() {
    const id = this.mutation.data()?.id;
    if (!this.storageUnit.value || !id) return;
    const dto: ImportSubmissionDto = { storageUnitId: this.storageUnit.value, importId: id };
    this.submitMutation.mutate(dto);
  }

  cancel() {
    this.mutation.reset();
  }
}
