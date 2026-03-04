import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MeasurementUnit } from '@h2-trust/domain';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';

export interface StatCardConfig {
  icon: string;
  value: number | undefined;
  unit: MeasurementUnit;
  label: string;
  theme: 'power-primary' | 'power-secondary' | 'hydrogen-primary' | 'hydrogen-secondary';
}

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule, UnitPipe],
  template: `
    <div class="flex grow flex-col rounded-lg p-4" [ngClass]="themes[config.theme].bg">
      <span class="material-symbols-outlined mb-4 w-fit rounded-full border p-2" [ngClass]="themes[config.theme].icon">
        {{ config.icon }}
      </span>
      <span class="text-base">{{ config.value | unit: config.unit }}</span>
      <span class="text-xs text-neutral-600">{{ config.label }}</span>
    </div>
  `,
})
export class StatCardComponent {
  @Input() config!: StatCardConfig;

  themes = {
    'power-primary': {
      bg: 'bg-secondary-100',
      icon: 'border-secondary-200 bg-white text-secondary-400',
    },
    'power-secondary': {
      bg: 'bg-white',
      icon: 'border-secondary-200 bg-secondary-100 text-secondary-500',
    },
    'hydrogen-primary': {
      bg: 'bg-primary-100',
      icon: 'border-primary-200 bg-white text-primary-400',
    },
    'hydrogen-secondary': {
      bg: 'bg-white',
      icon: 'border-primary-200 bg-primary-100 text-primary-500',
    },
  };
}
