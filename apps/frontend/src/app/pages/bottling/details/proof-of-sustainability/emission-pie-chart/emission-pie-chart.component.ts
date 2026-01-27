/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as echarts from 'echarts';
import { EChartsOption, LegendComponentOption, PieSeriesOption } from 'echarts';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { CommonModule, PercentPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmissionForProcessStepDto, EmissionProcessStepType } from '@h2-trust/api';
import { MeasurementUnit } from '@h2-trust/domain';

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

  readonly headings: Record<EmissionProcessStepType, string> = {
    APPLICATION: 'Emissions according to Proof of Origin',
    REGULATORY: 'Emissions according to RED III',
  };

  private toChartData(emissionItems: EmissionForProcessStepDto[]): EChartsOption {
    const applicationItems = emissionItems.filter((i) => i.processStepType === 'APPLICATION');
    const regulatoryItems = emissionItems.filter((i) => i.processStepType === 'REGULATORY');

    const chartOption: EChartsOption = this.getChartOption(regulatoryItems, applicationItems);

    if (applicationItems.length === 0) {
      chartOption.title = { text: 'Keine Daten' };
    } else {
      const outerColors = ['#d2e5eb', '#6aa7b4', '#1f6a79'];
      const innerColors = ['#a8d0bf', '#85b8a6', '#689f8e', '#40665b', '#3c605c'];

      const outerPie = this.createPieSeries(['40%', '60%'], 'outer', regulatoryItems, outerColors, emissionItems);
      const innerPie = this.createPieSeries(['10%', '35%'], 'inner', applicationItems, innerColors, emissionItems);

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

  private readonly tooltipFormatter = (params: any, dataTotal: EmissionForProcessStepDto[]): string => {
    const percent = this.percentPipe.transform((params.percent ?? 0) / 100, '1.0-1');
    const description = dataTotal.find((item) => item.name === params.name)?.description;
    return `${params.marker} ${params.name} (${description}): ${params.value} ${MeasurementUnit.G_CO2} (${percent})`;
  };

  private readonly getChartOption = (
    regulatoryItems: EmissionForProcessStepDto[],
    applicationItems: EmissionForProcessStepDto[],
  ): EChartsOption => ({
    title: { text: '' },
    tooltip: {},
    legend: [
      ...this.buildLegendGroup('REGULATORY', regulatoryItems, '16%'),
      ...this.buildLegendGroup('APPLICATION', applicationItems, '50%'),
    ],
    series: [],
  });

  private createPieSeries(
    radius: [string, string],
    position: 'inner' | 'outer',
    data: EmissionForProcessStepDto[],
    colors: string[],
    totalItems: EmissionForProcessStepDto[],
  ): PieSeriesOption {
    const pieSeries = this.getDefaultPieSeries(radius);
    pieSeries.name = position === 'inner' ? 'APPLICATION' : 'REGULATORY';
    pieSeries.label = {
      position: position,
      formatter: (params) => this.percentPipe.transform((params.percent ?? 0) / 100, '1.0-1') ?? '',
    };
    pieSeries.data = data.map((item, index) => ({
      value: +item.amount.toFixed(2),
      name: item.name,
      itemStyle: { color: colors[index] },
    }));
    pieSeries.tooltip = { formatter: (params) => this.tooltipFormatter(params, totalItems) };
    return pieSeries;
  }

  private buildLegendGroup(
    type: EmissionProcessStepType,
    items: EmissionForProcessStepDto[],
    top: string,
  ): LegendComponentOption[] {
    return [
      {
        data: [type],
        top: type === 'REGULATORY' ? '10%' : '44%',
        left: '56%',
        selectedMode: false,
        icon: 'none',
        itemWidth: 0,
        itemHeight: 0,
        itemGap: 0,
        textStyle: {
          color: '#787a78',
          fontSize: 12,
          fontWeight: 'bolder',
        },
        formatter: (type) => {
          return this.headings[type as EmissionProcessStepType];
        },
      },
      {
        left: '56%',
        top,
        show: true,
        selectedMode: false,
        orient: 'vertical',
        textStyle: { color: '#ababab' },
        data: items.map((i) => i.name),
        formatter: (name: string) => {
          const item = items.find((i) => i.name === name);
          return `${name} (${item?.description})`;
        },
      },
    ];
  }
}
