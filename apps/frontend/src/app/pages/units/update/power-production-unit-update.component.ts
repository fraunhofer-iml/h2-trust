/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { PowerProductionUnitDto, PowerProductionUnitInputDto } from '@h2-trust/contracts/dtos';
import { PowerProductionType } from '@h2-trust/domain';
import { UnitTypeChipComponent } from '../../../layout/chips/unit-type-chip.component';
import { QueryKeyPrefix } from '../../../shared/queries/shared-query-keys';
import { BaseUnitFormComponent } from '../forms/base-unit/base-unit-form-component';
import { newPowerProductionForm, PowerProductionFormGroup } from '../forms/forms';
import { PowerProductionUnitFormComponent } from '../forms/power-production/power-production-unit-form.component';
import { AbstractUnitUpdateComponent } from './abstract-unit-update.component';

@Component({
  selector: 'app-power-production-unit-update',
  imports: [
    BaseUnitFormComponent,
    PowerProductionUnitFormComponent,
    RouterModule,
    MatAnchor,
    MatButtonModule,
    UnitTypeChipComponent,
  ],
  templateUrl: './power-production-unit-update.component.html',
})
export class PowerProductionUnitUpdateComponent extends AbstractUnitUpdateComponent<
  PowerProductionUnitDto,
  PowerProductionUnitInputDto
> {
  id = input<string>();

  queryPrefix = QueryKeyPrefix.POWER_PRODUCTION_UNITS;
  powerProductionForm: FormGroup<PowerProductionFormGroup> = newPowerProductionForm();

  override fetchUnit(id: string): Promise<PowerProductionUnitDto> {
    return this.unitsService.getPowerProductionUnit(id);
  }

  override updateUnit(id: string, dto: PowerProductionUnitInputDto): Promise<PowerProductionUnitDto> {
    return this.unitsService.updatePowerProductionUnit(id, dto);
  }

  buildDto(): PowerProductionUnitInputDto {
    return {
      ...this.unitForm.value,
      ...this.powerProductionForm.value,
    } as PowerProductionUnitInputDto;
  }

  protected navigateToDetailsView() {
    this.router.navigateByUrl(`units/power-production/${this.id()}`);
  }

  protected override setFormData(unit: PowerProductionUnitDto) {
    this.unitForm.patchValue({ ...unit, owner: unit.owner.id, operator: unit.operator.id });
    this.powerProductionForm.patchValue({
      ...unit,
      biddingZone: unit.biddingZone,
      powerProductionType: unit.type.name as PowerProductionType,
    });
  }
}
