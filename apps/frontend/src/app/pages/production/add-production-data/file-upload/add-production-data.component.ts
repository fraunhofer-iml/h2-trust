/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileDragAndDropComponent } from 'apps/frontend/src/app/layout/drag-and-drop/file-drag-and-drop.component';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Router, RouterModule } from '@angular/router';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { BatchType, CsvContentType } from '@h2-trust/domain';
import { FileTypes } from '../../../../shared/constants/file-types';
import { ICONS } from '../../../../shared/constants/icons';
import { FileSizePipe } from '../../../../shared/pipes/file-size.pipe';
import { PrettyEnumPipe } from '../../../../shared/pipes/format-enum.pipe';
import {
  hydrogenProductionUnitsQueryOptions,
  powerProductionUnitsQueryOptions,
} from '../../../../shared/queries/units.query';
import { CompaniesService } from '../../../../shared/services/companies/companies.service';
import { PowerAccessApprovalService } from '../../../../shared/services/power-access-approvals/power-access-approvals.service';
import { ProductionService } from '../../../../shared/services/production/production.service';
import { UnitsService } from '../../../../shared/services/units/units.service';
import { UserRolesStore } from '../../../../shared/store/user-role.store';
import { minFormArrayLength } from '../../../../shared/util/form-array-length.validator';
import { FileForm } from './file-upload.form';

@Component({
  selector: 'app-add-production-data',
  providers: [provideNativeDateAdapter(), CompaniesService, ProductionService, PowerAccessApprovalService],
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatTimepickerModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    FileDragAndDropComponent,
    CommonModule,
    FileSizePipe,
    PrettyEnumPipe,
  ],
  templateUrl: './add-production-data.component.html',
})
export class AddProductionDataComponent {
  protected readonly FileTypes = FileTypes;
  protected readonly CsvContentType = CsvContentType;
  protected readonly ICONS = ICONS.UNITS;

  availableUnitTypes: CsvContentType[] = [CsvContentType.HYDROGEN, CsvContentType.POWER];

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
