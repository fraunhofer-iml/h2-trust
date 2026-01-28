/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitPipe } from 'apps/frontend/src/app/shared/pipes/unit.pipe';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { CommonModule, DecimalPipe, PercentPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { HydrogenComponentDto } from '@h2-trust/api';
import { MeasurementUnit } from '@h2-trust/domain';
import { CHART_COLORS } from '../../../../shared/constants/chart-colors';
import { formatNumberForChart } from '../../../../shared/util/number-format.util';

@Component({
  selector: 'app-h2-composition-chart',
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts }), PercentPipe, DecimalPipe, UnitPipe],
  templateUrl: './h2-composition-chart.component.html',
})
export class H2CompositionChartComponent {
  chartData = input<HydrogenComponentDto[]>();

  chartOption$ = computed(() => this.getOption(this.chartData() ?? []));

  percentPipe = inject(PercentPipe);
  decimalPipe = inject(DecimalPipe);
  unitPipe = inject(UnitPipe);

  private getOption(chartData: HydrogenComponentDto[]): EChartsOption {
    return {
      series: [
        {
          name: 'Hydrogen Composition',
          type: 'pie',
          radius: ['30%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 1,
          },

          label: {
            alignTo: 'labelLine',
            formatter: (params) => this.labelFormatter(params),
            lineHeight: 16,
            rich: {
              amount: {
                fontSize: 14,
                color: '#666',
              },
              name: {
                fontSize: 14,
              },
            },
          },
          data: chartData.map((composition) => ({
            value: formatNumberForChart(composition.amount),
            name: composition.color,
            itemStyle: {
              color: CHART_COLORS.get(composition.color),
              borderColor: '#fff',
            },
          })),
        },
      ],
    };
  }

  private readonly labelFormatter = (params: any) => {
    const percentage = this.percentPipe.transform((params.percent ?? 0) / 100, '1.0-1');
    return `${params.name}\n ${this.unitPipe.transform(params.value, MeasurementUnit.KG)} (${percentage})`;
  };
}
