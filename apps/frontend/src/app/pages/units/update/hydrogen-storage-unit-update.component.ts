/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { toast } from 'ngx-sonner';
import { Component, inject, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { HydrogenStorageUnitDto, HydrogenStorageUnitInputDto } from '@h2-trust/api';
import { HydrogenStorageType } from '@h2-trust/domain';
import { UnitTypeChipComponent } from '../../../layout/unit-type-chip/unit-type-chip.component';
import { UnitsService } from '../../../shared/services/units/units.service';
import { BaseUnitFormComponent } from '../forms/base-unit/base-unit-form-component';
import {
  addValidatorsToFormGroup,
  HydrogenStorageFormGroup,
  newH2StorageForm,
  newUnitForm,
  UnitFormGroup,
} from '../forms/forms';
import { HydrogenUnitFormComponent } from '../forms/hydrogen-storage/hydrogen-storage-unit-form.component';

@Component({
  selector: 'app-hydrogen-storage-unit-update',
  imports: [BaseUnitFormComponent, HydrogenUnitFormComponent, RouterModule, UnitTypeChipComponent, MatButtonModule],
  templateUrl: './hydrogen-storage-unit-update.component.html',
})
export class HydrogenStorageUnitUpdateComponent {
  unitForm: FormGroup<UnitFormGroup> = newUnitForm();
  hydrogenStorageUnitForm: FormGroup<HydrogenStorageFormGroup> = newH2StorageForm();

  id = input<string>();

  unitsService = inject(UnitsService);
  router = inject(Router);

  unitQuery = injectQuery(() => ({
    queryKey: ['power-production-unit', this.id()],
    queryFn: async () => {
      const unit = await this.unitsService.getHydrogenStorageUnit(this.id() ?? '');
      this.setFormData(unit);
      return unit;
    },
    enabled: !!this.id(),
  }));

  unitMutation = injectMutation(() => ({
    mutationFn: (dto: HydrogenStorageUnitInputDto) => this.unitsService.updateHydrogenStorageUnit(this.id() ?? '', dto),
    onSuccess: () => this.navigateToDetailsView(),
    onError: () => toast.error('Failed to update unit.'),
  }));

  onSave() {
    const dto = {
      ...this.unitForm.value,
      ...this.hydrogenStorageUnitForm.value,
      storageType: this.hydrogenStorageUnitForm.value.hydrogenStorageType,
    } as HydrogenStorageUnitInputDto;
    this.unitMutation.mutate(dto);
  }

  protected navigateToDetailsView() {
    this.router.navigateByUrl(`units/hydrogen-storage/${this.id()}`);
  }

  private setFormData(unit: HydrogenStorageUnitDto) {
    this.unitForm.patchValue({ ...unit, owner: unit.owner.id, operator: unit.operator.id });
    this.hydrogenStorageUnitForm.patchValue({
      ...unit,
      hydrogenStorageType: unit.storageType as HydrogenStorageType,
    });
    addValidatorsToFormGroup(this.hydrogenStorageUnitForm);
  }
}
