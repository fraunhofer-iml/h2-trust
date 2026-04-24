/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Router, RouterModule } from '@angular/router';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { AccountingPeriodMatchingResultDto } from '@h2-trust/contracts/dtos';
import { BatchType, CsvContentType } from '@h2-trust/domain';
import { FileDragAndDropComponent } from '../../../../layout/drag-and-drop/file-drag-and-drop.component';
import { FileTypes } from '../../../../shared/constants/file-types';
import { ICONS } from '../../../../shared/constants/icons';
import { UploadFlowAction } from '../../../../shared/constants/upload-flow-action.enum';
import { ModalData } from '../../../../shared/model/modal-data.model';
import { EnumPipe } from '../../../../shared/pipes/enum.pipe';
import { FileSizePipe } from '../../../../shared/pipes/file-size.pipe';
import {
  hydrogenProductionUnitsQueryOptions,
  powerProductionUnitsQueryOptions,
} from '../../../../shared/queries/units.query';
import { CompaniesService } from '../../../../shared/services/companies/companies.service';
import { PowerPurchaseAgreementService } from '../../../../shared/services/power-purchase-agreement/power-purchase-agreement.service';
import { ProductionService } from '../../../../shared/services/production/production.service';
import { UnitsService } from '../../../../shared/services/units/units.service';
import { UserRolesStore } from '../../../../shared/store/user-role.store';
import { minFormArrayLength } from '../../../../shared/util/form-array-length.validator';
import { FileForm } from './file-upload.form';
import { LoadingModalComponent } from './loading-modal/loading-modal.component';

@Component({
  selector: 'app-add-production-data',
  providers: [provideNativeDateAdapter(), CompaniesService, ProductionService, PowerPurchaseAgreementService],
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
    EnumPipe,
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
  loadingModal = inject(MatDialog);

  hydrogenProductionUnitsQuery = injectQuery(() => hydrogenProductionUnitsQueryOptions(this.unitsService));
  powerProductionUnitsQuery = injectQuery(() => powerProductionUnitsQueryOptions(this.unitsService));
  queries = {
    [BatchType.POWER]: this.powerProductionUnitsQuery,
    [BatchType.HYDROGEN]: this.hydrogenProductionUnitsQuery,
  };

  selectedTypeControl = new FormControl<CsvContentType | undefined>(undefined);
  selectedType$ = toSignal(this.selectedTypeControl.valueChanges);

  type = computed(() => {
    if (this.roles.isPowerProducer() && !this.roles.isHydrogenProducer()) return CsvContentType.POWER;
    if (!this.roles.isPowerProducer() && this.roles.isHydrogenProducer()) return CsvContentType.HYDROGEN;
    return this.selectedType$();
  });

  form = new FormGroup({
    files: new FormArray<FileForm>([], [minFormArrayLength(1), Validators.required]),
  });

  modalRef: MatDialogRef<LoadingModalComponent> | undefined;

  mutation = injectMutation<AccountingPeriodMatchingResultDto, HttpErrorResponse, FormData>(() => ({
    mutationFn: (data: FormData) => this.productionService.uploadCsv(data),
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

    const data = this.createFormData(type);

    this.mutation.reset();

    this.openDialog(type);

    this.mutation.mutate(data);
  }

  removeFile(index: number, formArray: FormArray<FileForm> | FormArray<FormGroup<{ file: FormControl<File | null> }>>) {
    formArray.controls.splice(index, 1);
    formArray.updateValueAndValidity();
  }

  addFileFormWithUnit(file: File, formArray: FormArray<FileForm>) {
    formArray.push(
      new FormGroup<{ file: FormControl<File | null>; unitId: FormControl<string | null> }>({
        file: new FormControl<File | null>(file),
        unitId: new FormControl<string | null>(null, Validators.required),
      }),
    );
  }

  private createFormData(type: CsvContentType) {
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

    return data;
  }

  private openDialog(type: CsvContentType) {
    const data: ModalData = { err: this.mutation.error, data: this.mutation.data, type };

    this.modalRef = this.loadingModal.open(LoadingModalComponent, {
      disableClose: true,
      data,
    });

    this.modalRef.afterClosed().subscribe((action: UploadFlowAction) => this.onDialogClosed(action));
  }

  private onDialogClosed(action: UploadFlowAction) {
    switch (action) {
      case UploadFlowAction.NEXT_UPLOAD:
        this.mutation.reset();
        this.form.controls.files.clear();
        this.selectedTypeControl.reset();
        break;

      case UploadFlowAction.FIX_REQUIRED:
        this.mutation.reset();
        break;

      case UploadFlowAction.EXIT:
        this.router.navigate(['/production/files']);
        break;
    }
  }
}
