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
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { PowerProductionUnitDto, PowerProductionUnitInputDto } from '@h2-trust/api';
import { PowerProductionType } from '@h2-trust/domain';
import { UnitTypeChipComponent } from '../../../layout/unit-type-chip/unit-type-chip.component';
import { UnitsService } from '../../../shared/services/units/units.service';
import { BaseUnitFormComponent } from '../forms/base-unit/base-unit-form-component';
import { newPowerProductionForm, newUnitForm, PowerProductionFormGroup, UnitFormGroup } from '../forms/forms';
import { PowerProductionUnitFormComponent } from '../forms/power-production/power-production-unit-form.component';

@Component({
  selector: 'app-power-production-unit-update',
  imports: [
    BaseUnitFormComponent,
    PowerProductionUnitFormComponent,
    RouterModule,
    UnitTypeChipComponent,
    MatAnchor,
    MatButtonModule,
  ],
  templateUrl: './power-production-unit-update.component.html',
})
export class PowerProductionUnitUpdateComponent {
  unitForm: FormGroup<UnitFormGroup> = newUnitForm();
  powerProductionForm: FormGroup<PowerProductionFormGroup> = newPowerProductionForm();

  id = input<string>();

  unitsService = inject(UnitsService);
  router = inject(Router);

  unitQuery = injectQuery(() => ({
    queryKey: ['power-production-unit', this.id()],
    queryFn: async () => {
      const unit = await this.unitsService.getPowerProductionUnit(this.id() ?? '');
      this.setFormData(unit);
      return unit;
    },
    enabled: !!this.id(),
  }));

  unitMutation = injectMutation(() => ({
    mutationFn: (dto: PowerProductionUnitInputDto) => this.unitsService.updatePowerProductionUnit(dto),
    onSuccess: () => this.navigateToDetailsView(),
    onError: () => toast.error('Failed to update unit.'),
  }));

  onSave() {
    const dto = {
      ...this.unitForm.value,
      ...this.powerProductionForm.value,
    } as PowerProductionUnitInputDto;

    this.unitMutation.mutate(dto);
  }

  protected navigateToDetailsView() {
    this.router.navigateByUrl(`units/power-production/${this.id()}`);
  }

  private setFormData(unit: PowerProductionUnitDto) {
    this.unitForm.patchValue({ ...unit, owner: unit.owner.id, operator: unit.operator.id });
    this.powerProductionForm.patchValue({
      ...unit,
      biddingZone: unit.biddingZone,
      powerProductionType: unit.type.name as PowerProductionType,
    });
  }
}
