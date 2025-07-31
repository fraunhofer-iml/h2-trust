import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ClassificationDto } from '@h2-trust/api';
import { VerifiedChartComponent } from '../../../../../layout/verified-chart/verified-chart.component';

@Component({
  selector: 'app-classification',
  imports: [CommonModule, VerifiedChartComponent],
  templateUrl: './classification.component.html',
})
export class ClassificationComponent {
  classification = input.required<ClassificationDto>();

  getIcon(key: string): string {
    switch (key) {
      case 'HYDROGEN':
        return 'bubble_chart';
      case 'POWER':
        return 'charger';
      case 'WATER':
        return 'water_drop';
      default:
        return '';
    }
  }
}
