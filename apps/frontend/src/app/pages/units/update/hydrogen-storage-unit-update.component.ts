/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { HydrogenStorageUnitDto, HydrogenStorageUnitInputDto } from '@h2-trust/contracts/dtos';
import { HydrogenStorageType } from '@h2-trust/domain';
import { UnitTypeChipComponent } from '../../../layout/chips/unit-type-chip.component';
import { QueryKeyPrefix } from '../../../shared/queries/shared-query-keys';
import { BaseUnitFormComponent } from '../forms/base-unit/base-unit-form-component';
import { addValidatorsToFormGroup, HydrogenStorageFormGroup, newH2StorageForm } from '../forms/forms';
import { HydrogenUnitFormComponent } from '../forms/hydrogen-storage/hydrogen-storage-unit-form.component';
import { AbstractUnitUpdateComponent } from './abstract-unit-update.component';

@Component({
  selector: 'app-hydrogen-storage-unit-update',
  imports: [BaseUnitFormComponent, HydrogenUnitFormComponent, RouterModule, MatButtonModule, UnitTypeChipComponent],
  templateUrl: './hydrogen-storage-unit-update.component.html',
})
export class HydrogenStorageUnitUpdateComponent extends AbstractUnitUpdateComponent<
  HydrogenStorageUnitDto,
  HydrogenStorageUnitInputDto
> {
  override id = input<string>('');

  protected override queryPrefix = QueryKeyPrefix.HYDROGEN_STORAGE_UNITS;
  hydrogenStorageUnitForm: FormGroup<HydrogenStorageFormGroup> = newH2StorageForm();

  override buildDto(): HydrogenStorageUnitInputDto {
    return {
      ...this.unitForm.value,
      ...this.hydrogenStorageUnitForm.value,
      storageType: this.hydrogenStorageUnitForm.value.hydrogenStorageType,
    } as HydrogenStorageUnitInputDto;
  }

  protected override navigateToDetailsView() {
    this.router.navigateByUrl(`units/hydrogen-storage/${this.id()}`);
  }

  protected override setFormData(unit: HydrogenStorageUnitDto) {
    this.unitForm.patchValue({ ...unit, owner: unit.owner.id, operator: unit.operator.id });
    this.hydrogenStorageUnitForm.patchValue({
      ...unit,
      hydrogenStorageType: unit.storageType as HydrogenStorageType,
    });
    addValidatorsToFormGroup(this.hydrogenStorageUnitForm);
  }

  override fetchUnit(id: string): Promise<HydrogenStorageUnitDto> {
    return this.unitsService.getHydrogenStorageUnit(id);
  }

  override updateUnit(id: string, dto: HydrogenStorageUnitInputDto): Promise<HydrogenStorageUnitDto> {
    return this.unitsService.updateHydrogenStorageUnit(id, dto);
  }
}
