/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import {
  HydrogenProductionUnitDto,
  HydrogenStorageUnitDto,
  PowerProductionUnitDto,
  UnitDto,
  UnitType,
} from '@h2-trust/api';
import { UnitTypeChipComponent } from '../../../layout/unit-type-chip/unit-type-chip.component';
import { UnitsService } from '../../../shared/services/units/units.service';
import { HydrogenProductionDetailsComponent } from './hydrogen-production/hydrogen-production-details.component';
import { HydrogenStorageDetailsComponent } from './hydrogen-storage/hydrogen-storage-details.component';
import { PowerProductionDetailsComponent } from './power-production/power-production-details.component';

@Component({
  selector: 'app-unit-details',
  imports: [
    CommonModule,
    RouterModule,
    UnitTypeChipComponent,
    PowerProductionDetailsComponent,
    HydrogenStorageDetailsComponent,
    HydrogenProductionDetailsComponent,
  ],
  templateUrl: './unit-details.component.html',
})
export class UnitDetailsComponent {
  id = input<string>();

  unitsService = inject(UnitsService);

  protected readonly UnitType = UnitType;

  unitQuery = injectQuery(() => ({
    queryKey: ['unit', this.id()],
    queryFn: () => this.unitsService.getUnitById(this.id() ?? ''),
    enabled: !!this.id(),
  }));

  toInstanceOfPowerProductionUnit(unit: UnitDto): PowerProductionUnitDto | null {
    return unit.unitType === UnitType.POWER_PRODUCTION ? (unit as PowerProductionUnitDto) : null;
  }
  toInstanceOfHydrogenProductionUnit(unit: UnitDto): HydrogenProductionUnitDto | null {
    return unit.unitType === UnitType.HYDROGEN_PRODUCTION ? (unit as HydrogenProductionUnitDto) : null;
  }
  toInstanceOfHydrogenStorageUnit(unit: UnitDto): HydrogenStorageUnitDto | null {
    return unit.unitType === UnitType.HYDROGEN_STORAGE ? (unit as HydrogenStorageUnitDto) : null;
  }
}
