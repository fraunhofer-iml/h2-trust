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
import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { EmissionForProcessStepDto } from '@h2-trust/api';
import { FormattedUnits } from '../../../../../shared/constants/formatted-units';

@Component({
  selector: 'app-emission-pie-chart',
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],

  templateUrl: './emission-pie-chart.component.html',
})
export class EmissionPieChartComponent {
  data = input<EmissionForProcessStepDto[]>([]);
  chartData$ = computed(() => this.getChartData(this.data()));
  getChartData(emissionItems: EmissionForProcessStepDto[]) {
    return this.createChartOption(
      emissionItems.filter((i) => i.processStepType === 'APPLICATION'),
      emissionItems.filter((i) => i.processStepType === 'REGULATORY'),
    );
  }

  private createChartOption(
    dataTotal: EmissionForProcessStepDto[],
    dataByItems: EmissionForProcessStepDto[],
  ): EChartsOption {
    const chartOption: EChartsOption = this.getDefaultOption(true);
    chartOption.title = { text: '' };
    chartOption.legend = {
      orient: 'vertical',
      right: 30,
      top: 'center',
      textStyle: {
        color: '#ababab',
      },
      selectedMode: false,
      data: [
        ...dataTotal.map((i) => {
          return i.name;
        }),
        ...dataByItems.map((i) => i.name),
      ],
      formatter: function (name) {
        const description = [...dataByItems, ...dataTotal].find((item) => item.name === name)?.description;
        return name + ` (${description})`;
      },
    };

    if (dataTotal.length === 0) chartOption.title.subtext = 'Keine Daten';
    else {
      const outerPie: PieSeriesOption = this.getDefaultPieSeries(['60%', '90%']);
      outerPie.label = {
        position: 'outer',
        formatter: function (params) {
          const percent = params.percent?.toFixed(1);
          return `${percent}%`;
        },
      };
      outerPie.center = ['30%', '50%'];
      outerPie.data = dataByItems.map((item, index) => {
        return {
          value: +item.amount.toFixed(2),
          name: item.name,
          itemStyle: { color: ['#7a7aad', '#9e9ed8', '#b6b6ff', '#c2c2ff', '#d1d1ff', '#eeeeff', '#e0e0ff'][index] },
        };
      });
      outerPie.tooltip = {
        formatter: function (params) {
          const percent = params.percent?.toFixed(1);
          const description = [...dataByItems, ...dataTotal].find((item) => item.name === params.name)?.description;
          return `${params.marker} ${params.name} (${description}): ${params.value} ${FormattedUnits.CO2_PER_KG_H2} (${percent}%)`;
        },
      };

      const innerPie: PieSeriesOption = this.getDefaultPieSeries(['20%', '55%']);
      innerPie.label = {
        position: 'inner',
        formatter: function (params) {
          const percent = params.percent?.toFixed(1);
          return `${percent}%`;
        },
      };
      innerPie.center = ['30%', '50%'];
      innerPie.data = dataTotal.map((item, index) => {
        return {
          value: +item.amount.toFixed(2),
          name: item.name,
          itemStyle: { color: ['#0a947f', '#045c60', '#077d6a', '#045c5090'][index] },
        };
      });

      innerPie.tooltip = {
        formatter: function (params) {
          const percent = params.percent?.toFixed(1);
          const description = [...dataByItems, ...dataTotal].find((item) => item.name === params.name)?.description;
          return `${params.marker} ${params.name} (${description}): ${params.value} ${FormattedUnits.CO2_PER_KG_H2} (${percent}%)`;
        },
      };

      chartOption.series = [outerPie, innerPie];
    }

    return chartOption;
  }

  getDefaultPieSeries(radius?: [string | number, string]): PieSeriesOption {
    return {
      type: 'pie',
      radius: radius ?? ['40%', '90%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 1,
      },
      label: {
        alignTo: 'labelLine',
        formatter: '{name|{b}}\n{amount|{c} kg ({d} %)}',
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

  getDefaultOption = (legendItemsSelectable: boolean): EChartsOption => {
    return {
      title: {},
      tooltip: {},
      legend: {
        bottom: '0',
        left: '0',
        show: true,
        textStyle: {
          color: '#fff',
        },
        selectedMode: legendItemsSelectable,
      },
      series: [],
    };
  };
}
