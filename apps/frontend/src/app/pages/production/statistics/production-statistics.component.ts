/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, Signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { MeasurementUnit } from '@h2-trust/domain';
import { ICONS } from '../../../shared/constants/icons';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { ProductionService } from '../../../shared/services/production/production.service';
import { FilterModel } from '../model/generated-productions-filter.model';

interface StatCardConfig {
  icon: string;
  value: number | undefined;
  unit: MeasurementUnit;
  label: string;
  theme: 'power-total' | 'power-fraction' | 'hydrogen-total' | 'hydrogen-fraction';
}

@Component({
  templateUrl: './production-statistics.component.html',
  selector: 'app-production-statistics',
  imports: [CommonModule, UnitPipe],
})
export class ProductionStatisticsComponent {
  readonly MeasurementUnit = MeasurementUnit;
  readonly ICONS = ICONS.UNITS;

  productionService = inject(ProductionService);

  filterValue = input.required<FilterModel>();

  productionQuery = injectQuery(() => ({
    queryKey: ['production-statistics', this.filterValue()],
    queryFn: () => this.productionService.getStatistics(this.filterValue()),
  }));

  data: Signal<StatCardConfig[]> = computed(() => {
    return [
      {
        icon: ICONS.POWER.BASE,
        value: this.productionQuery.data()?.power?.total,
        unit: MeasurementUnit.KWH,
        label: 'Total power used',
        theme: 'power-total',
      },
      {
        icon: ICONS.POWER.RENEWABLE,
        value: this.productionQuery.data()?.power?.renewable,
        unit: MeasurementUnit.KWH,
        label: 'Renewable power',
        theme: 'power-fraction',
      },
      {
        icon: ICONS.POWER.PARTLY_RENEWABLE,
        value: this.productionQuery.data()?.power?.partlyRenewable,
        unit: MeasurementUnit.KWH,
        label: 'Partly-renewable power',
        theme: 'power-fraction',
      },
      {
        icon: ICONS.POWER.NOT_RENEWABLE,
        value: this.productionQuery.data()?.power?.nonRenewable,
        unit: MeasurementUnit.KWH,
        label: 'Non-renewable power',
        theme: 'power-fraction',
      },
      {
        icon: ICONS.HYDROGEN.BASE,
        value: this.productionQuery.data()?.hydrogen?.total,
        unit: MeasurementUnit.KG_H2,
        label: 'Total hydrogen used',
        theme: 'hydrogen-total',
      },
      {
        icon: ICONS.HYDROGEN.RFNBO_READY,
        value: this.productionQuery.data()?.hydrogen?.rfnboReady,
        unit: MeasurementUnit.KG_H2,
        label: 'Hydrogen RFNBO-ready',
        theme: 'hydrogen-fraction',
      },
      {
        icon: ICONS.HYDROGEN.NON_CERTIFIABLE,
        value: this.productionQuery.data()?.hydrogen?.nonCertifiable,
        unit: MeasurementUnit.KG_H2,
        label: 'Non-certifiable Hydrogen',
        theme: 'hydrogen-fraction',
      },
    ];
  });

  themes = {
    'power-total': {
      bg: 'bg-secondary-100',
      icon: 'border-secondary-200 bg-white text-secondary-500',
    },
    'power-fraction': {
      bg: 'bg-white',
      icon: 'border-secondary-200 bg-secondary-100 text-secondary-500',
    },
    'hydrogen-total': {
      bg: 'bg-primary-100',
      icon: 'border-primary-200 bg-white text-primary-500',
    },
    'hydrogen-fraction': {
      bg: 'bg-white',
      icon: 'border-primary-200 bg-primary-100 text-primary-500',
    },
  };
}
