import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { HydrogenComponentDto } from '@h2-trust/api';
import { CHART_COLORS } from '../../../../shared/constants/chart-colors';
import { formatNumberForChart } from '../../../../shared/util/number-format.util';

@Component({
  selector: 'app-h2-composition-chart',
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './h2-composition-chart.component.html',
})
export class H2CompositionChartComponent {
  chartData = input<HydrogenComponentDto[]>();

  chartOption$ = computed(() => this.getOption(this.chartData() ?? []));

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
}
