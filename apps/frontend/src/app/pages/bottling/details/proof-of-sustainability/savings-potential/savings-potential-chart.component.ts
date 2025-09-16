import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-savings-potential-chart',
  imports: [CommonModule],
  templateUrl: './savings-potential-chart.component.html',
})
export class SavingsPotentialChartComponent {
  percentage = input<number>(0);
}
