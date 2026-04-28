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
import { HydrogenProductionUnitDto, HydrogenProductionUnitInputDto } from '@h2-trust/contracts/dtos';
import { BiddingZone, HydrogenProductionMethod, HydrogenProductionTechnology } from '@h2-trust/domain';
import { UnitTypeChipComponent } from '../../../layout/chips/unit-type-chip.component';
import { QueryKeyPrefix } from '../../../shared/queries/shared-query-keys';
import { BaseUnitFormComponent } from '../forms/base-unit/base-unit-form-component';
import { addValidatorsToFormGroup, HydrogenProductionFormGroup, newH2ProductionForm } from '../forms/forms';
import { HydrogenProductionUnitFormComponent } from '../forms/hydrogen-production/hydrogen-production-unit-form.component';
import { AbstractUnitUpdateComponent } from './abstract-unit-update.component';

@Component({
  selector: 'app-hydrogen-production-unit-update',
  imports: [
    RouterModule,
    MatButtonModule,
    BaseUnitFormComponent,
    HydrogenProductionUnitFormComponent,
    UnitTypeChipComponent,
  ],
  templateUrl: './hydrogen-production-unit-update.component.html',
})
export class HydrogenProductionUnitUpdateComponent extends AbstractUnitUpdateComponent<
  HydrogenProductionUnitDto,
  HydrogenProductionUnitInputDto
> {
  id = input<string>();

  queryPrefix = QueryKeyPrefix.HYDROGEN_PRODUCTION_UNITS;

  hydrogenProductionForm: FormGroup<HydrogenProductionFormGroup> = newH2ProductionForm();

  fetchUnit(id: string): Promise<HydrogenProductionUnitDto> {
    return this.unitsService.getHydrogenProductionUnit(id);
  }
  updateUnit(id: string, dto: HydrogenProductionUnitInputDto): Promise<HydrogenProductionUnitDto> {
    return this.unitsService.updateHydrogenProductionUnit(id, dto);
  }

  buildDto() {
    return {
      ...this.unitForm.value,
      ...this.hydrogenProductionForm.value,
    } as HydrogenProductionUnitInputDto;
  }

  protected navigateToDetailsView() {
    this.router.navigateByUrl(`units/hydrogen-production/${this.id()}`);
  }

  protected setFormData(unit: HydrogenProductionUnitDto) {
    this.unitForm.patchValue({ ...unit, owner: unit.owner.id, operator: unit.operator.id });
    this.hydrogenProductionForm.patchValue({
      ...unit,
      biddingZone: unit.biddingZone as BiddingZone,
      method: unit.method as HydrogenProductionMethod,
      technology: unit.technology as HydrogenProductionTechnology,
    });
    addValidatorsToFormGroup(this.hydrogenProductionForm);
  }
}
