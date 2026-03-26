/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { StatCardConfig } from '../model/statistics-card-config.model';

@Component({
  template: `<div class="flex flex-col justify-between p-4" [ngClass]="themes[config().theme].bg">
    <span class="material-symbols-outlined mb-4 w-fit rounded-full border p-2" [ngClass]="themes[config().theme].icon">
      {{ config().icon }}
    </span>
    <span class="flex flex-row items-end justify-between">
      <div>
        <p>{{ config().value | unit: config().unit }}</p>
        <p class="text-xs text-neutral-600">{{ config().label }}</p>
      </div>

      @if (config().percentage) {
        <div class="relative h-14 w-14 min-w-14 rounded-full" [ngStyle]="chartStyle()">
          <div class="absolute left-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <p class="text-sm">{{ config().percentage | percent }}</p>
          </div>
        </div>
      }
    </span>
  </div>`,
  selector: 'app-statistics-card',
  imports: [CommonModule, UnitPipe],
})
export class StatisticsCardComponent {
  config = input.required<StatCardConfig>();

  chartStyle = computed(() => {
    const percent = (this.config().percentage ?? 0) * 100;
    const color = this.themes[this.config().theme].chart;
    return {
      background: `conic-gradient(${color} ${percent}%, #efefef 0)`,
    };
  });

  themes = {
    'power-total': {
      bg: 'bg-secondary-100 rounded-xl h-full',
      icon: 'border-secondary-200 bg-white text-secondary-500',
      chart: '',
    },
    'power-fraction': {
      bg: 'bg-white',
      icon: 'border-secondary-200 bg-secondary-100 text-secondary-500',
      chart: '#85b8a6',
    },
    'hydrogen-total': {
      bg: 'bg-primary-100 rounded-xl h-full',
      icon: 'border-primary-200 bg-white text-primary-500',
      chart: '',
    },
    'hydrogen-fraction': {
      bg: 'bg-white',
      icon: 'border-primary-200 bg-primary-100 text-primary-500 ',
      chart: '#a4c9d3 ',
    },
  };
}
