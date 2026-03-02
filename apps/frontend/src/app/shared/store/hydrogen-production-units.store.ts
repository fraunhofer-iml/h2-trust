/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { inject, Injectable, signal } from '@angular/core';
import { HydrogenProductionOverviewDto } from '@h2-trust/api';
import { UnitsService } from '../services/units/units.service';

@Injectable()
export class HydrogenProductionUnitsStore {
  unitsService = inject(UnitsService);

  readonly hydrogenProductionUnits$ = signal<HydrogenProductionOverviewDto[]>([]);

  async loadUnits(): Promise<void> {
    const units = await this.unitsService.getHydrogenProductionUnits();
    this.hydrogenProductionUnits$.set(units);
  }
}
