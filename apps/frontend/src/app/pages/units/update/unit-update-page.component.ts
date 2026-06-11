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
  HydrogenBottlingUnitInputDto,
  HydrogenCompressorUnitInputDto,
  HydrogenEndUseUnitInputDto,
  HydrogenProductionUnitInputDto,
  HydrogenStorageUnitInputDto,
  PowerProductionUnitInputDto,
  UnitDto,
} from '@h2-trust/contracts/dtos';
import {
  BiddingZone,
  HydrogenProductionTechnology,
  HydrogenProductionType,
  HydrogenStorageType,
} from '@h2-trust/domain';
import { ErrorCardComponent } from '../../../layout/error-card/error-card.component';
import { LoadingCardComponent } from '../../../layout/loading-card/loading-card.component';
import { UnitCardComponent } from '../../../layout/unit-card/unit-card.component';
import { H2TrustRouterLinks } from '../../../shared/constants/router-links';
import { H2TrustRoutes } from '../../../shared/constants/routes';
import { QueryKeyPrefix } from '../../../shared/queries/shared-query-keys';
import { UnitsService } from '../../../shared/services/units/units.service';
import { toastQueryError } from '../../../shared/util/query-error-handler';
import {
  isHydrogenBottlingUnitDetails,
  isHydrogenCompressorUnitDetails,
  isHydrogenEndUseUnitDetails,
  isHydrogenProductionUnitDetails,
  isHydrogenStorageUnitDetails,
  isHydrogenTransportUnitDetails,
  isPowerProductionUnitDetails,
} from '../../../shared/util/unit-type-guards';
import { BaseUnitFormComponent } from '../forms/base-unit/base-unit-form-component';
import {
  addValidatorsToFormGroup,
  HydrogenProductionFormGroup,
  HydrogenStorageFormGroup,
  HydrogenTransportFormGroup,
  newHydrogenProductionForm,
  newHydrogenStorageForm,
  newHydrogenTransportForm,
  newPowerProductionForm,
  newUnitForm,
  PowerProductionFormGroup,
  UnitFormGroup,
} from '../forms/forms';
import { HydrogenProductionUnitFormComponent } from '../forms/hydrogen-production/hydrogen-production-unit-form.component';
import { HydrogenUnitFormComponent } from '../forms/hydrogen-storage/hydrogen-storage-unit-form.component';
import { HydrogenTransportComponent } from '../forms/hydrogen-transport/hydrogen-transport.component';
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
    LoadingCardComponent,
    ErrorCardComponent,
    UnitCardComponent,
    HydrogenTransportComponent,
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
  protected isTransportUnit = isHydrogenTransportUnitDetails;
  protected readonly H2TrustRouterLinks = H2TrustRouterLinks;

  unitForm: FormGroup<UnitFormGroup> = newUnitForm();
  hydrogenProductionForm: FormGroup<HydrogenProductionFormGroup> = newHydrogenProductionForm();
  hydrogenStorageUnitForm: FormGroup<HydrogenStorageFormGroup> = newHydrogenStorageForm();
  powerProductionForm: FormGroup<PowerProductionFormGroup> = newPowerProductionForm();
  transportUnitForm: FormGroup<HydrogenTransportFormGroup> = newHydrogenTransportForm();

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
      await this.queryClient.invalidateQueries({ queryKey: [QueryKeyPrefix.UNITS] });
      toast.success('Unit updated successfully');
      this.router.navigate([H2TrustRoutes.UNITS, this.id()]);
    },
    onError: (err: HttpErrorResponse) => toastQueryError(err),
    enabled: !!this.id(),
  }));

  onSave(unit: UnitDto) {
    this.unitMutation.mutate(unit);
  }

  private async updateUnit(unit: UnitDto) {
    const unitType = unit.unitType;

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

    if (this.isTransportUnit(unit)) {
      const dto = this.buildHydrogenTransportDto();
      return this.unitsService.updateHydrogenTransportUnit(unit.id, dto);
    }

    if (isHydrogenBottlingUnitDetails(unit)) {
      const dto = {
        ...this.unitForm.value,
      } as HydrogenBottlingUnitInputDto;
      return this.unitsService.updateHydrogenBottlingUnit(unit.id, dto);
    }

    if (isHydrogenCompressorUnitDetails(unit)) {
      const dto = {
        ...this.unitForm.value,
      } as HydrogenCompressorUnitInputDto;
      return this.unitsService.updateHydrogenCompressorUnit(unit.id, dto);
    }

    if (isHydrogenEndUseUnitDetails(unit)) {
      const dto = {
        ...this.unitForm.value,
      } as HydrogenEndUseUnitInputDto;
      return this.unitsService.updateHydrogenEndUseUnit(unit.id, dto);
    }

    throw new Error(`Fetched unit has unexpected type "${unitType}" for update page.`);
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

  private buildHydrogenTransportDto(): HydrogenProductionUnitInputDto {
    return {
      ...this.unitForm.value,
      ...this.transportUnitForm.value,
    } as HydrogenProductionUnitInputDto;
  }

  private setFormData(unit: UnitDto) {
    this.unitForm.patchValue({ ...unit, owner: unit.owner.id, operator: unit.operator.id });

    if (this.isHydrogenProductionUnit(unit)) {
      this.hydrogenProductionForm.patchValue({
        ...unit,
        biddingZone: unit.biddingZone as BiddingZone,
        method: unit.method as HydrogenProductionType,
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
        powerProductionType: unit.type,
      });
    }
  }
}
