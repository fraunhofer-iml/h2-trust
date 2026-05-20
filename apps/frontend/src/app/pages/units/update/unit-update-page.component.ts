/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import {
  HydrogenProductionUnitInputDto,
  HydrogenStorageUnitInputDto,
  PowerProductionUnitInputDto,
  UnitDto,
} from '@h2-trust/contracts/dtos';
import {
  BiddingZone,
  HydrogenProductionMethod,
  HydrogenProductionTechnology,
  HydrogenStorageType,
} from '@h2-trust/domain';
import { UnitTypeChipComponent } from '../../../layout/chips/unit-type-chip.component';
import { H2TrustRoutes } from '../../../shared/constants/routes';
import { QueryKeyPrefix } from '../../../shared/queries/shared-query-keys';
import { UnitsService } from '../../../shared/services/units/units.service';
import { toastQueryError } from '../../../shared/util/query-error-handler';
import {
  isHydrogenProductionUnitDetails,
  isHydrogenStorageUnitDetails,
  isPowerProductionUnitDetails,
} from '../../../shared/util/unit-type-guards';
import { BaseUnitFormComponent } from '../forms/base-unit/base-unit-form-component';
import {
  addValidatorsToFormGroup,
  HydrogenProductionFormGroup,
  HydrogenStorageFormGroup,
  newH2ProductionForm,
  newH2StorageForm,
  newPowerProductionForm,
  newUnitForm,
  PowerProductionFormGroup,
  UnitFormGroup,
} from '../forms/forms';
import { HydrogenProductionUnitFormComponent } from '../forms/hydrogen-production/hydrogen-production-unit-form.component';
import { HydrogenUnitFormComponent } from '../forms/hydrogen-storage/hydrogen-storage-unit-form.component';
import { PowerProductionUnitFormComponent } from '../forms/power-production/power-production-unit-form.component';

@Component({
  selector: 'app-unit-update-page',
  imports: [
    RouterModule,
    MatButtonModule,
    BaseUnitFormComponent,
    HydrogenProductionUnitFormComponent,
    HydrogenUnitFormComponent,
    PowerProductionUnitFormComponent,
    UnitTypeChipComponent,
  ],
  templateUrl: './unit-update-page.component.html',
})
export class UnitUpdatePageComponent {
  readonly id = input<string>('');
  readonly unitsService = inject(UnitsService);
  readonly router = inject(Router);
  readonly queryClient = inject(QueryClient);

  protected isHydrogenProductionUnit = isHydrogenProductionUnitDetails;
  protected isHydrogenStorageUnit = isHydrogenStorageUnitDetails;
  protected isPowerProductionUnit = isPowerProductionUnitDetails;

  unitForm: FormGroup<UnitFormGroup> = newUnitForm();
  hydrogenProductionForm: FormGroup<HydrogenProductionFormGroup> = newH2ProductionForm();
  hydrogenStorageUnitForm: FormGroup<HydrogenStorageFormGroup> = newH2StorageForm();
  powerProductionForm: FormGroup<PowerProductionFormGroup> = newPowerProductionForm();

  readonly unitQuery = injectQuery(() => ({
    queryKey: [QueryKeyPrefix.UNITS, this.id()],
    queryFn: (): Promise<UnitDto> => this.unitsService.getUnitById(this.id()),
    enabled: !!this.id(),
  }));

  protected readonly patchFormEffect = effect(() => {
    const id = this.id();
    const unit = this.unitQuery.data();

    if (!id || !unit) return;

    this.setFormData(unit);
  });

  readonly unitMutation = injectMutation(() => ({
    mutationFn: (unit: UnitDto) => this.updateUnit(unit),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: [QueryKeyPrefix.UNITS, this.id()] });
      toast.success('Unit updated successfully');
      this.router.navigate([H2TrustRoutes.UNITS, this.id()]);
    },

    onError: (err: HttpErrorResponse) => toastQueryError(err),
    enabled: !!this.id(),
  }));

  onSave() {
    const unit = this.unitQuery.data();
    if (!unit) return;
    this.unitMutation.mutate(unit);
  }

  private async updateUnit(unit: UnitDto) {
    if (this.isHydrogenProductionUnit(unit)) {
      const dto = this.buildHydrogenProductionDto();
      return this.unitsService.updateHydrogenProductionUnit(unit.id, dto);
    }

    if (this.isHydrogenStorageUnit(unit)) {
      const dto = this.buildHydrogenStorageDto();
      return this.unitsService.updateHydrogenStorageUnit(unit.id, dto);
    }

    if (this.isPowerProductionUnit(unit)) {
      const dto = this.buildPowerProductionDto();
      return this.unitsService.updatePowerProductionUnit(unit.id, dto);
    }

    throw new Error('Fetched unit has unexpected type for update page');
  }

  private buildHydrogenProductionDto(): HydrogenProductionUnitInputDto {
    return {
      ...this.unitForm.value,
      ...this.hydrogenProductionForm.value,
    } as HydrogenProductionUnitInputDto;
  }

  private buildHydrogenStorageDto(): HydrogenStorageUnitInputDto {
    return {
      ...this.unitForm.value,
      ...this.hydrogenStorageUnitForm.value,
      storageType: this.hydrogenStorageUnitForm.value.storageType,
    } as HydrogenStorageUnitInputDto;
  }

  private buildPowerProductionDto(): PowerProductionUnitInputDto {
    return {
      ...this.unitForm.value,
      ...this.powerProductionForm.value,
    } as PowerProductionUnitInputDto;
  }

  private setFormData(unit: UnitDto) {
    this.unitForm.patchValue({ ...unit, owner: unit.owner.id, operator: unit.operator.id });

    if (this.isHydrogenProductionUnit(unit)) {
      this.hydrogenProductionForm.patchValue({
        ...unit,
        biddingZone: unit.biddingZone as BiddingZone,
        method: unit.method as HydrogenProductionMethod,
        technology: unit.technology as HydrogenProductionTechnology,
      });
      addValidatorsToFormGroup(this.hydrogenProductionForm);
      return;
    }

    if (this.isHydrogenStorageUnit(unit)) {
      this.hydrogenStorageUnitForm.patchValue({
        ...unit,
        storageType: unit.storageType as HydrogenStorageType,
      });
      addValidatorsToFormGroup(this.hydrogenStorageUnitForm);
      return;
    }

    if (this.isPowerProductionUnit(unit)) {
      this.powerProductionForm.patchValue({
        ...unit,
        biddingZone: unit.biddingZone,
        powerProductionType: unit.type.name,
      });
    }
  }
}
