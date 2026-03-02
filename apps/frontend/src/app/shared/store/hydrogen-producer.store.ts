/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { computed, inject, Injectable, signal } from '@angular/core';
import { HydrogenProductionOverviewDto } from '@h2-trust/api';
import { UnitsService } from '../services/units/units.service';

@Injectable()
export class HydrogenProducerStore {
  unitsService = inject(UnitsService);

  private readonly hydrogenProductionUnits$ = signal<HydrogenProductionOverviewDto[]>([]);

  private isHydrogenProducer$ = computed(() => this.hydrogenProductionUnits$().length > 0);

  get isHydrogenProducer() {
    return this.isHydrogenProducer$;
  }

  get units() {
    return this.hydrogenProductionUnits$;
  }

  async loadUnits(): Promise<void> {
    const units = await this.unitsService.getHydrogenProductionUnits();
    this.hydrogenProductionUnits$.set(units);
  }

  setUnits(units: HydrogenProductionOverviewDto[]) {
    this.hydrogenProductionUnits$.set(units);
  }
}
