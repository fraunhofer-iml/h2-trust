/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ComponentsOverviewDto } from '@h2-trust/contracts/dtos';
import { MeasurementUnit, RfnboType } from '@h2-trust/domain';
import { UnitPipe } from '../../../../../shared/pipes/unit.pipe';

@Component({
  selector: 'app-storage-filling-levels',
  templateUrl: './storage-filling-levels.component.html',
  imports: [CommonModule, UnitPipe],
})
export class StorageFillingLevelsComponent {
  protected readonly MeasurementUnit = MeasurementUnit;
  plannedAmount = input<number | null | undefined>(undefined);
  protected readonly Math = Math;
  chartData = input<ComponentsOverviewDto[]>();

  protected readonly availabilityStats = computed(() => {
    const data = this.chartData() ?? [];
    const hydrogenComposition = data.flatMap((unit) => unit.hydrogenComposition ?? []);

    const total = hydrogenComposition.reduce((sum, component) => sum + component.amount, 0);

    const rfnboReady = hydrogenComposition
      .filter((component) => component.rfnboType === RfnboType.RFNBO_READY)
      .reduce((sum, component) => sum + component.amount, 0);

    const nonCertifiable = hydrogenComposition
      .filter((component) => component.rfnboType === RfnboType.NON_CERTIFIABLE)
      .reduce((sum, component) => sum + component.amount, 0);

    const plannedAmount = this.plannedAmount() ?? 0;
    const remainingAmount = total - plannedAmount;
    const exceedsAvailableAmount = plannedAmount > total;
    const reachesLimit = plannedAmount >= total && total > 0;

    return {
      unitName: data[0]?.name,
      total,
      rfnboReady,
      nonCertifiable,
      plannedAmount,
      remainingAmount,
      exceedsAvailableAmount,
      reachesLimit,
      rfnboReadyPercentage: total > 0 ? rfnboReady / total : 0,
      nonCertifiablePercentage: total > 0 ? nonCertifiable / total : 0,
    };
  });

  protected getProgressBackground(value: number): string {
    const percentage = Math.round(value * 100);

    return `conic-gradient(#93c5d1 ${percentage}%, #f1f1f1 ${percentage}% 100%)`;
  }
}
