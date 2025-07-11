import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { HydrogenCompositionDto } from '@h2-trust/api';

@Component({
  selector: 'app-h2-composition-chart',
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './h2-composition-chart.component.html',
})
export class H2CompositionChartComponent {
  chartData = input<HydrogenCompositionDto[]>();

  chartOption$ = computed(() => this.getOption(this.chartData() ?? []));

  colors = new Map<string, string>([
    ['GREEN', '#4F9C83'],
    ['ORANGE', '#CF9153'],
    ['PINK', '#BD608B'],
    ['YELLOW', '#F0D354'],
  ]);

  private getOption(chartData: HydrogenCompositionDto[]): EChartsOption {
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
            value: composition.amount,
            name: composition.color,
            itemStyle: {
              color: this.colors.get(composition.color),
              borderColor: '#fff',
              opacity: 20,
            },
          })),
        },
      ],
    };
  }
}
