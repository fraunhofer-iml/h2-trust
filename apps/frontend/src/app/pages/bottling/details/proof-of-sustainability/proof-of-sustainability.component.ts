/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { InfoTooltipComponent } from 'apps/frontend/src/app/layout/info-tooltip/info-tooltip.component';
import { ChemicalNames } from 'apps/frontend/src/app/shared/constants/chemical-names';
import { EMISSIONS } from 'apps/frontend/src/app/shared/constants/emissions';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { EmissionCalculationDto } from '@h2-trust/api';
import { CalculationTopic, MeasurementUnit } from '@h2-trust/domain';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';
import { BottlingService } from '../../../../shared/services/bottling/bottling.service';
import { CalculationItemComponent } from './calculation-item/calculation-item.component';
import { EmissionPieChartComponent } from './emission-pie-chart/emission-pie-chart.component';
import { SavingsPotentialChartComponent } from './savings-potential/savings-potential-chart.component';

@Component({
  selector: 'app-proof-of-sustainability',
  imports: [
    CommonModule,
    SavingsPotentialChartComponent,
    MatExpansionModule,
    MatTooltipModule,
    CalculationItemComponent,
    EmissionPieChartComponent,
    EmissionPieChartComponent,
    UnitPipe,
    InfoTooltipComponent,
  ],
  templateUrl: './proof-of-sustainability.component.html',
})
export class ProofOfSustainabilityComponent {
  protected readonly EMISSIONS = EMISSIONS;
  bottlingService = inject(BottlingService);
  id = input<string>('');
  readonly MeasurementUnit = MeasurementUnit;
  readonly CalculationTopic = CalculationTopic;
  readonly ChemicalNames = ChemicalNames;

  calculations = computed(() => this.mapCalculations(this.proofQuery.data()?.calculations ?? []));

  proofQuery = injectQuery(() => ({
    queryKey: ['proof-of-sustainability', this.id()],
    queryFn: () => {
      return this.bottlingService.getProofOfSustainability(this.id() ?? '');
    },
    enabled: !!this.id(),
  }));

  mapCalculations(calculations: EmissionCalculationDto[]) {
    const groupedObj: Record<string, EmissionCalculationDto[]> = {};

    for (const item of calculations) {
      if (!groupedObj[item.calculationTopic]) {
        groupedObj[item.calculationTopic] = [];
      }
      groupedObj[item.calculationTopic].push(item);
    }
    return Object.entries(groupedObj).map(([key, items]) => ({
      key,
      items,
    }));
  }

  get totalEmissionsTooltip() {
    return (
      EMISSIONS.TOTAL_EMISSIONS.FORMULA + '\n' + EMISSIONS.TOTAL_EMISSIONS.EU + '\n' + EMISSIONS.TOTAL_EMISSIONS.ECCS
    );
  }
}
