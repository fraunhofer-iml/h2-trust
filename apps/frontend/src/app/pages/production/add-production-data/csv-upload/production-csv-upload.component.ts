/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileDragAndDropComponent } from 'apps/frontend/src/app/layout/drag-and-drop/file-drag-and-drop.component';
import { FileTypes } from 'apps/frontend/src/app/shared/constants/file-types';
import { ICONS } from 'apps/frontend/src/app/shared/constants/icons';
import { FileSizePipe } from 'apps/frontend/src/app/shared/pipes/file-size.pipe';
import {
  hydrogenProductionUnitsQueryOptions,
  powerProductionUnitsQueryOptions,
} from 'apps/frontend/src/app/shared/queries/units.query';
import { ProductionService } from 'apps/frontend/src/app/shared/services/production/production.service';
import { UnitsService } from 'apps/frontend/src/app/shared/services/units/units.service';
import { UserRolesStore } from 'apps/frontend/src/app/shared/store/user-role.store';
import { minFormArrayLength } from 'apps/frontend/src/app/shared/util/form-array-lengh.validator';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { CsvContentType } from '@h2-trust/contracts/dtos';
import { BatchType } from '@h2-trust/domain';
import { PrettyEnumPipe } from '../../../../shared/pipes/format-enum.pipe';
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
    MatProgressBarModule,
    PrettyEnumPipe,
  ],
  templateUrl: './production-csv-upload.component.html',
})
export class ProductionCsvUploadComponent {
  protected readonly FileTypes = FileTypes;
  protected readonly BatchType = BatchType;
  protected readonly ICONS = ICONS.UNITS;

  availableUnitTypes: CsvContentType[] = [BatchType.HYDROGEN, BatchType.POWER];

  productionService = inject(ProductionService);
  router = inject(Router);
  unitsService = inject(UnitsService);
  roles = inject(UserRolesStore);

  hydrogenProductionUnitsQuery = injectQuery(() => hydrogenProductionUnitsQueryOptions(this.unitsService));
  powerProductionQuery = injectQuery(() => powerProductionUnitsQueryOptions(this.unitsService));
  queries = {
    [BatchType.POWER]: this.powerProductionQuery,
    [BatchType.HYDROGEN]: this.hydrogenProductionUnitsQuery,
  };

  selectedTypeControl = new FormControl<CsvContentType | undefined>(undefined);
  selectedTypeValue = toSignal(this.selectedTypeControl.valueChanges);

  type = computed(() => {
    if (this.roles.isPowerProducer() && !this.roles.isHydrogenProducer()) return BatchType.POWER;
    if (!this.roles.isPowerProducer() && this.roles.isHydrogenProducer()) return BatchType.HYDROGEN;
    return this.selectedTypeValue();
  });

  form = new FormGroup({
    files: new FormArray<FileForm>([], minFormArrayLength(1)),
  });

  mutation = injectMutation(() => ({
    mutationFn: (data: FormData) => {
      return this.productionService.uploadCsv(data);
    },
    onError: (e: HttpErrorResponse) => {
      toast.error(e.error.message);
    },
  }));

  constructor() {
    this.form.updateValueAndValidity();
    this.selectedTypeControl.valueChanges.subscribe(() => {
      this.form.controls.files.controls.forEach((control) => {
        control.controls.unitId.setValue(null);
      });
    });
  }

  get files() {
    return this.form.get('files') as FormArray<FileForm>;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  submit() {
    const type = this.type();
    if (!type) return;

    const data = new FormData();
    data.append('csvContentType', type);

    this.form.controls.files.controls.forEach((control) => {
      const file: File | null = control.controls.file.value;
      const unitId = control.value.unitId;

      if (file && unitId) {
        data.append('files', file);
        data.append('unitIds', unitId);
      }
    });

    this.mutation.mutate(data);
  }

  removeFile(index: number, form: FormArray<FileForm> | FormArray<FormGroup<{ file: FormControl<File | null> }>>) {
    form.controls.splice(index, 1);
    form.updateValueAndValidity();
  }

  addFileFormWithUnit(file: File, form: FormArray<FileForm>) {
    form.push(
      new FormGroup<{ file: FormControl<File | null>; unitId: FormControl<string | null> }>({
        file: new FormControl<File | null>(file),
        unitId: new FormControl<string | null>(null, Validators.required),
      }),
    );
  }
}
