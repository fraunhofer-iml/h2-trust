/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PercentPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { HydrogenStorageOverviewDto } from '@h2-trust/contracts/dtos';
import { MeasurementUnit, RfnboType } from '@h2-trust/domain';
import { CHART_COLORS } from '../../../../shared/constants/chart-colors';
import { Warnings } from '../../../../shared/constants/warnings';
import { formatNumberForChart } from '../../../../shared/formatting/chart-number-format';
import { EnumPipe } from '../../../../shared/pipes/enum.pipe';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';

@Component({
  selector: 'app-storage-filling-levels',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts }), UnitPipe, PercentPipe, EnumPipe],
  templateUrl: './storage-filling-levels.component.html',
})
export class StorageFillingLevelsComponent {
  unitPipe = inject(UnitPipe);
  percentPipe = inject(PercentPipe);
  enumPipe = inject(EnumPipe);

  chartData = input<HydrogenStorageOverviewDto[]>();
  chartOption$ = computed(() => this.getOption(this.chartData() ?? []));

  private getOption(data: HydrogenStorageOverviewDto[]): EChartsOption {
    const emptyOption: echarts.BarSeriesOption = {
      name: 'EMPTY',
      color: 'transparent',
      type: 'bar',
      stack: 'a',
      data: data.map((dto) => {
        const diff = dto.capacity - dto.hydrogenComposition.reduce((sum, portion) => sum + portion.amount, 0);
        return diff > 0 ? formatNumberForChart(diff) : 0;
      }),
      itemStyle: {
        borderRadius: 8,
        borderColor: '#ababab',
        borderWidth: 2,
        borderType: 'dashed',
      },
    };

    const series: echarts.BarSeriesOption[] = [];
    Array.from(CHART_COLORS.keys()).forEach((color) => {
      series.push(this.getSeriesForColor(color, data));
    });

    const capacityExceeded = data[0].filling > data[0].capacity;
    if (!capacityExceeded) series.push(emptyOption);
    else if (series[0]) series[0].markLine = this.getMarkLine(data[0].capacity);

    return {
      yAxis: {
        type: 'category',
        data: data.map((dto) => dto.name),
        axisLabel: {
          formatter: (value: string, index: number) => {
            return this.getLabel(data, value, index);
          },
          rich: {
            name: {
              fontSize: 12,
              fontWeight: 'bold',
              color: '#707070',
              lineHeight: 20,
            },
            filling: {
              fontSize: 12,
              color: '#8c8c8c',
              lineHeight: 20,
            },
            spacer: {
              height: 10,
            },
            err: {
              backgroundColor: '#fff9db',
              color: '#7a5a00',
              padding: [8, 9, 7, 9],
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 'bold',
              lineHeight: 18,
              borderColor: '#e8cf7a',
              borderWidth: 1,
            },
          },
        },
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: function (value: number) {
            return `${value} kg`;
          },
        },
      },
      grid: { containLabel: true, left: '2%', bottom: '2%', right: '2%', top: '2%' },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
        },
        confine: true,
        formatter: (params) => this.tooltipFormatter(params),
      },
      series: series,
    };
  }

  private getSeriesForColor(h2color: string, data: HydrogenStorageOverviewDto[]): echarts.BarSeriesOption {
    const barSeries: echarts.BarSeriesOption = {
      name: h2color,
      color: CHART_COLORS.get(h2color) + '30',
      type: 'bar',
      stack: 'a',
      barMaxWidth: 80,
      data: data.map((dto) =>
        formatNumberForChart(
          dto.hydrogenComposition.find((hydrogenComponent) => h2color == hydrogenComponent.rfnboType)?.amount,
        ),
      ),
      itemStyle: {
        borderRadius: 8,
        borderColor: CHART_COLORS.get(h2color) + '80',
        borderWidth: 2,
      },
    };
    return barSeries;
  }

  private getLabel(data: HydrogenStorageOverviewDto[], value: string, index: number) {
    const item = data[index];
    const totalH2Amount = formatNumberForChart(
      item?.hydrogenComposition.reduce((sum, portion) => sum + portion.amount, 0),
    );
    const capacity = this.unitPipe.transform(item?.capacity, MeasurementUnit.KG);
    const capacityInPercent = this.percentPipe.transform(totalH2Amount / (item?.capacity ?? 0), '1.2-2');

    const label = `{name|${value}}\n{filling|Filling: ${totalH2Amount}/${capacity} (${capacityInPercent})}`;
    const overflowMessage = `\n{spacer| }\n{err|${Warnings.MAX_CAPACITY_EXCEEDED}}`;

    return totalH2Amount > (item?.capacity ?? 0) ? label + overflowMessage : label;
  }

  private getMarkLine(capacity: number): echarts.MarkLineComponentOption {
    const markLine: echarts.MarkLineComponentOption = {
      symbol: 'none',
      label: {
        show: true,
        formatter: `Total \n Capacity `,
        position: 'insideMiddleTop',
        color: '#696565',
      },
      lineStyle: {
        color: '#696565',
        type: 'dashed',
        width: 2,
      },
      data: [{ xAxis: capacity }],
    };
    return markLine;
  }

  private readonly tooltipFormatter = (params: any) => {
    if (!Array.isArray(params)) return '';
    let tooltip = '';
    params.forEach((item) => {
      const valueWithUnit = this.unitPipe.transform(item.value, MeasurementUnit.KG);
      const marker = item.seriesName === 'EMPTY' ? this.emptyTooltipMarker : item.marker;
      tooltip += `${marker} ${this.getSeriesName(item.seriesName)}: ${valueWithUnit}<br/>`;
    });
    return tooltip;
  };

  private get emptyTooltipMarker(): string {
    return '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;border:2px dashed #ababab;background:#ffffff;"></span>';
  }

  private getSeriesName(name: string) {
    if ((Object.values(RfnboType) as string[]).includes(name)) {
      return this.enumPipe.transform(name as RfnboType, 'rfnboType').toLowerCase();
    }

    return name.toLowerCase();
  }
}
