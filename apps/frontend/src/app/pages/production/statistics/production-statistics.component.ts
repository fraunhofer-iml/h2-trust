/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { MeasurementUnit } from '@h2-trust/domain';
import { ICONS } from '../../../shared/constants/icons';
import { ProductionService } from '../../../shared/services/production/production.service';
import { FilterModel } from '../model/generated-productions-filter.model';
import { StatisticsCardComponent } from './statistics-card.component';

@Component({
  templateUrl: './production-statistics.component.html',
  selector: 'app-production-statistics',
  imports: [CommonModule, StatisticsCardComponent],
})
export class ProductionStatisticsComponent {
  readonly MeasurementUnit = MeasurementUnit;
  readonly ICONS = ICONS;

  productionService = inject(ProductionService);

  filterValue = input.required<FilterModel>();

  productionQuery = injectQuery(() => ({
    queryKey: ['production-statistics', this.filterValue()],
    queryFn: async () => this.productionService.getStatistics(this.filterValue()),
  }));
}
