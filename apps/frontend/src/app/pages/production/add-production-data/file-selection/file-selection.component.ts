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
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule } from '@angular/router';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { map } from 'rxjs';
import { StagedProductionDto, StagingSubmissionDto } from '@h2-trust/contracts/dtos';
import {
  BatchType,
  CsvContentType,
  MeasurementUnit,
  PowerPurchaseAgreementStatus,
  StagingScope,
} from '@h2-trust/domain';
import { EmptyStateComponent } from '../../../../layout/empty-state/empty-state.component';
import { ROUTES } from '../../../../shared/constants/routes';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';
import { PowerPurchaseAgreementService } from '../../../../shared/services/power-purchase-agreement/power-purchase-agreement.service';
import { ProductionService } from '../../../../shared/services/production/production.service';
import { UnitsService } from '../../../../shared/services/units/units.service';

@Component({
  selector: 'app-file-selection',
  imports: [
    RouterModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    UnitPipe,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatChipsModule,
    MatButtonModule,
    EmptyStateComponent,
  ],
  templateUrl: './file-selection.component.html',
})
export class FileSelectionComponent {
  protected readonly productionService = inject(ProductionService);
  protected readonly powerPurchaseAgreementService = inject(PowerPurchaseAgreementService);
  protected readonly unitsService = inject(UnitsService);
  protected readonly MeasurementUnit = MeasurementUnit;
  private readonly router = inject(Router);

  form = new FormGroup({
    hydrogenProduction: new FormControl<StagedProductionDto[] | null>(null, [
      Validators.required,
      Validators.minLength(1),
    ]),
    powerProductions: new FormControl<StagedProductionDto[] | null>([], [Validators.required, Validators.minLength(1)]),
    storageUnit: new FormControl<string | null>(null, Validators.required),
  });

  selectedHydrogenFile = toSignal(
    this.form.controls.hydrogenProduction.valueChanges.pipe(map((val) => (val ? val[0] : null))),
  );

  powerProductionsQuery = injectQuery(() => ({
    queryKey: [
      'power-production',
      this.selectedHydrogenFile()?.startedAt,
      this.selectedHydrogenFile()?.endedAt,
      BatchType.POWER,
    ],
    queryFn: async () =>
      this.productionService.getStagedProductions(
        CsvContentType.POWER,
        StagingScope.RECEIVED,
        this.selectedHydrogenFile()?.startedAt,
        this.selectedHydrogenFile()?.endedAt,
      ),
  }));

  hydrogenProductionsQuery = injectQuery(() => ({
    queryKey: ['hydrogen-production'],
    queryFn: () => this.productionService.getStagedProductions(CsvContentType.HYDROGEN, StagingScope.OWN),
  }));

  powerPurchaseAgreementsQuery = injectQuery(() => ({
    queryKey: ['power-purchase-agreements'],
    queryFn: async () => {
      const approvals = await this.powerPurchaseAgreementService.getAgreements(PowerPurchaseAgreementStatus.APPROVED);
      return approvals.filter((a) => a.energySource !== 'GRID');
    },
  }));

  storageUnitsQuery = injectQuery(() => ({
    queryKey: ['hydrogen-storage-unit'],
    queryFn: () => this.unitsService.getHydrogenStorageUnits(),
  }));

  data = computed(() => {
    const uploads = this.powerProductionsQuery.data();
    const approvals = this.powerPurchaseAgreementsQuery.data();

    const result = (approvals ?? []).map((ppa) => ({
      ...ppa,
      uploads: (uploads ?? []).filter((r) => r.productionUnitId === ppa.powerProductionUnit.id),
    }));

    return result;
  });

  get totalPower() {
    return this.form.controls.powerProductions.value?.reduce((acc, item) => acc + item.amountProduced, 0);
  }

  mutation = injectMutation(() => ({
    mutationFn: (dto: StagingSubmissionDto) => this.productionService.submitCsv(dto),
    onSuccess: () => {
      toast.success('Successfully created new productions!');
      this.router.navigateByUrl(ROUTES.PRODUCTION_DATA);
    },
    onError: (e: HttpErrorResponse) => toast.error(e.error.message),
  }));

  constructor() {
    this.form.controls.hydrogenProduction.valueChanges.subscribe((val) => {
      if (val && val.length > 0) {
        this.form.controls.powerProductions.patchValue([]);
      }
    });
  }

  save() {
    const { hydrogenProduction, storageUnit, powerProductions } = this.form.value;
    if (!hydrogenProduction || !storageUnit || powerProductions?.length === 0) return;

    const dto: StagingSubmissionDto = {
      storageUnitId: storageUnit,
      stagedHydrogenProduction: hydrogenProduction[0].id,
      stagedPowerProductions: (powerProductions ?? []).map((item) => item.id),
    };

    this.mutation.mutate(dto);
  }
}
