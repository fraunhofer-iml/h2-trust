/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, inject, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { HydrogenProductionUnitDto, HydrogenProductionUnitInputDto } from '@h2-trust/contracts/dtos';
import { BiddingZone, HydrogenProductionMethod, HydrogenProductionTechnology } from '@h2-trust/domain';
import { UnitTypeChipComponent } from '../../../layout/unit-type-chip/unit-type-chip.component';
import { QUERY_KEYS } from '../../../shared/queries/shared-query-keys';
import { UnitsService } from '../../../shared/services/units/units.service';
import { BaseUnitFormComponent } from '../forms/base-unit/base-unit-form-component';
import {
  addValidatorsToFormGroup,
  HydrogenProductionFormGroup,
  newH2ProductionForm,
  newUnitForm,
  UnitFormGroup,
} from '../forms/forms';
import { HydrogenProductionUnitFormComponent } from '../forms/hydrogen-production/hydrogen-production-unit-form.component';

@Component({
  selector: 'app-hydrogen-production-unit-update',
  imports: [
    RouterModule,
    MatButtonModule,
    UnitTypeChipComponent,
    BaseUnitFormComponent,
    HydrogenProductionUnitFormComponent,
  ],
  templateUrl: './hydrogen-production-unit-update.component.html',
})
export class HydrogenProductionUnitUpdateComponent {
  unitForm: FormGroup<UnitFormGroup> = newUnitForm();
  hydrogenProductionForm: FormGroup<HydrogenProductionFormGroup> = newH2ProductionForm();

  id = input<string>();

  unitsService = inject(UnitsService);
  router = inject(Router);
  queryClient = inject(QueryClient);

  unitQuery = injectQuery(() => ({
    queryKey: ['hydrogen-production-unit', this.id()],
    queryFn: async () => {
      const unit = await this.unitsService.getHydrogenProductionUnit(this.id() ?? '');
      this.setFormData(unit);
      return unit;
    },
    enabled: !!this.id(),
  }));

  unitMutation = injectMutation(() => ({
    mutationFn: (dto: HydrogenProductionUnitInputDto) =>
      this.unitsService.updateHydrogenProductionUnit(this.id() ?? '', dto),
    onSuccess: () => this.onSuccess(),
    onError: () => toast.error('Failed to update unit.'),
  }));

  onSave() {
    const dto = {
      ...this.unitForm.value,
      ...this.hydrogenProductionForm.value,
    } as HydrogenProductionUnitInputDto;
    this.unitMutation.mutate(dto);
  }

  private onSuccess() {
    this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HYDROGEN_PRODUCTION_UNITS });
    this.navigateToDetailsView();
  }

  protected navigateToDetailsView() {
    this.router.navigateByUrl(`units/hydrogen-production/${this.id()}`);
  }

  private setFormData(unit: HydrogenProductionUnitDto) {
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
