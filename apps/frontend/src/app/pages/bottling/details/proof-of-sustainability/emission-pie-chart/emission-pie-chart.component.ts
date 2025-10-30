/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as echarts from 'echarts';
import { EChartsOption, PieSeriesOption } from 'echarts';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { CommonModule, PercentPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmissionForProcessStepDto } from '@h2-trust/api';
import { FormattedUnits } from '../../../../../shared/constants/formatted-units';

@Component({
  selector: 'app-emission-pie-chart',
  imports: [CommonModule, NgxEchartsDirective, MatProgressSpinnerModule],
  providers: [provideEchartsCore({ echarts }), PercentPipe],

  templateUrl: './emission-pie-chart.component.html',
})
export class EmissionPieChartComponent {
  percentPipe = inject(PercentPipe);
  data = input<EmissionForProcessStepDto[]>([]);
  chartData$ = computed(() => this.toChartData(this.data()));

  private toChartData(emissionItems: EmissionForProcessStepDto[]): EChartsOption {
    const applicationItems = emissionItems.filter((i) => i.processStepType === 'APPLICATION');
    const regulatoryItems = emissionItems.filter((i) => i.processStepType === 'REGULATORY');

    const chartOption: EChartsOption = this.getChartOption(regulatoryItems, applicationItems);

    if (applicationItems.length === 0) chartOption.title = { text: 'Keine Daten' };
    else {
      const outerColors = ['#7a7aad', '#9e9ed8', '#b6b6ff', '#c2c2ff', '#d1d1ff', '#eeeeff', '#e0e0ff'];
      const innerColors = ['#004D40', '#00796B', '#009688', '#4DB6AC', '#80CBC4', '#B2DFDB', '#E0F2F1'];

      const outerPie = this.createPieSeries(
        ['50%', '80%'],
        'outer',
        regulatoryItems,
        outerColors,
        regulatoryItems,
        applicationItems,
      );
      const innerPie = this.createPieSeries(
        ['15%', '45%'],
        'inner',
        applicationItems,
        innerColors,
        regulatoryItems,
        applicationItems,
      );

      chartOption.series = [outerPie, innerPie];
    }

    return chartOption;
  }

  private getDefaultPieSeries(radius: [string | number, string]): PieSeriesOption {
    return {
      type: 'pie',
      radius: radius,
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 1,
      },
      center: ['30%', '50%'],
      label: {
        alignTo: 'labelLine',
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
      data: [{ value: 0, name: '' }],
    };
  }

  private readonly tooltipFormatter = (
    params: any,
    dataByItems: EmissionForProcessStepDto[],
    dataTotal: EmissionForProcessStepDto[],
  ): string => {
    const percent = this.percentPipe.transform((params.percent ?? 0) / 100, '1.0-1');
    const description = [...dataByItems, ...dataTotal].find((item) => item.name === params.name)?.description;
    return `${params.marker} ${params.name} (${description}): ${params.value} ${FormattedUnits.CO2_PER_KG_H2} (${percent})`;
  };

  private readonly getChartOption = (
    regulatoryItems: EmissionForProcessStepDto[],
    applicationItems: EmissionForProcessStepDto[],
  ): EChartsOption => ({
    title: { text: '' },
    tooltip: {},
    legend: {
      right: 30,
      top: 'center',
      show: true,
      selectedMode: false,
      orient: 'vertical',
      textStyle: {
        color: '#ababab',
      },
      data: [...applicationItems.map((i) => i.name), ...regulatoryItems.map((i) => i.name)],
      formatter: function (name) {
        const description = [...regulatoryItems, ...applicationItems].find((item) => item.name === name)?.description;
        return name + ` (${description})`;
      },
    },
    series: [],
  });

  private createPieSeries(
    radius: [string, string],
    position: 'inner' | 'outer',
    data: { amount: number; name: string }[],
    colors: string[],
    dataByItems: EmissionForProcessStepDto[],
    dataTotal: EmissionForProcessStepDto[],
  ): PieSeriesOption {
    const pieSeries = this.getDefaultPieSeries(radius);
    pieSeries.label = {
      position: position,
      formatter: (params) => this.percentPipe.transform((params.percent ?? 0) / 100, '1.0-1') ?? '',
    };
    pieSeries.data = data.map((item, index) => ({
      value: +item.amount.toFixed(2),
      name: item.name,
      itemStyle: { color: colors[index] },
    }));
    pieSeries.tooltip = { formatter: (params) => this.tooltipFormatter(params, dataByItems, dataTotal) };
    return pieSeries;
  }
}
