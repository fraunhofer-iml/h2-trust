/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { StatCardConfig } from '../model/statistics-card-config.model';

@Component({
  template: `<div class="flex flex-col p-4" [ngClass]="themes[config().theme].bg">
    <span class="material-symbols-outlined mb-4 w-fit rounded-full border p-2" [ngClass]="themes[config().theme].icon">
      {{ config().icon }}
    </span>
    <span class="text-base">{{ config().value | unit: config().unit }}</span>
    <span class="text-xs text-neutral-600">{{ config().label }}</span>
  </div>`,
  selector: 'app-statistics-card',
  imports: [CommonModule, UnitPipe],
})
export class StatisticsCardComponent {
  config = input.required<StatCardConfig>();

  themes = {
    'power-total': {
      bg: 'bg-secondary-100 rounded-xl h-full',
      icon: 'border-secondary-200 bg-white text-secondary-500',
    },
    'power-fraction': {
      bg: 'bg-white',
      icon: 'border-secondary-200 bg-secondary-100 text-secondary-500',
    },
    'hydrogen-total': {
      bg: 'bg-primary-100 rounded-xl h-full',
      icon: 'border-primary-200 bg-white text-primary-500',
    },
    'hydrogen-fraction': {
      bg: 'bg-white',
      icon: 'border-primary-200 bg-primary-100 text-primary-500 ',
    },
  };
}
