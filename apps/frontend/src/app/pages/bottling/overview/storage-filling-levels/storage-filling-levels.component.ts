import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { HydrogenStorageOverviewDto } from '@h2-trust/api';
import { CHART_COLORS } from '../../../../shared/constants/chart-colors';
import { ERROR_MESSAGES } from '../../../../shared/constants/error.messages';

@Component({
  selector: 'app-storage-filling-levels',
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './storage-filling-levels.component.html',
})
export class StorageFillingLevelsComponent {
  chartData = input<HydrogenStorageOverviewDto[]>();
  chartOption$ = computed(() => this.getOption(this.chartData() ?? []));

  private getOption(data: HydrogenStorageOverviewDto[]): EChartsOption {
    let series: echarts.BarSeriesOption[] = [
      {
        name: 'EMPTY',
        color: 'transparent',
        type: 'bar',
        stack: 'a',
        data: data.map((dto) => {
          const diff = dto.capacity - dto.hydrogenCompositions.reduce((sum, portion) => sum + portion.amount, 0);
          return diff > 0 ? diff : 0;
        }),
        itemStyle: {
          borderRadius: 8,
          borderColor: '#ababab',
          borderWidth: 2,
          borderType: 'dashed',
        },
      },
    ];

    Array.from(CHART_COLORS.keys()).forEach((color) => {
      series = [this.getSeriesForColor(color, data), ...series];
    });

    return {
      yAxis: {
        type: 'category',
        data: data.map((dto) => dto.name),
        axisLabel: {
          formatter: (value: string, index: number) => {
            const item = data[index];
            const totalH2Amount = item?.hydrogenCompositions.reduce((sum, portion) => sum + portion.amount, 0);
            const label = `{name|${value}}\n{filling|Filling: ${totalH2Amount}/${item?.capacity} kg (${((100 * (totalH2Amount ?? 0)) / (item?.capacity ?? 0)).toFixed(2)} %)}`;
            const overflowMessage = `\n{err|${ERROR_MESSAGES.maxCapacityExceeded}}`;
            return (totalH2Amount ?? 0) > (item?.capacity ?? 0) ? label + overflowMessage : label;
          },
          rich: {
            name: {
              fontSize: 14,
              fontWeight: 'bold',
              color: '#707070',
              lineHeight: 20,
            },
            filling: {
              fontSize: 12,
              color: '#8c8c8c',
              lineHeight: 20,
            },
            err: {
              fontSize: 12,
              fontWeight: 'bold',
              color: '#BD608B',
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
        formatter: function (params) {
          if (!Array.isArray(params)) return '';
          let tooltip = '';
          params.forEach((item) => {
            tooltip += `${item.marker} ${item.seriesName}: ${item.value} kg<br/>`;
          });
          return tooltip;
        },
      },
      series: series,
    };
  }

  private getSeriesForColor(h2color: string, data: HydrogenStorageOverviewDto[]): echarts.BarSeriesOption {
    const barSeries: echarts.BarSeriesOption = {
      name: h2color,
      color: CHART_COLORS.get(h2color),
      type: 'bar',
      stack: 'a',
      barMaxWidth: 100,
      data: data.map((dto) => dto.hydrogenCompositions.find((color) => color.color === h2color)?.amount ?? 0),
      itemStyle: {
        borderRadius: 8,
        borderColor: 'transparent',
        borderWidth: 1,
      },
    };
    return barSeries;
  }
}
