/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { UnitOverviewDto } from '@h2-trust/contracts/dtos';
import { ICONS } from '../../shared/constants/icons';
import { EnumPipe } from '../../shared/pipes/enum.pipe';
import { UnitStatusComponent } from '../chips/unit-status-chip.component';

type PartialUnitOverviewDto = Pick<UnitOverviewDto, 'id' | 'name' | 'unitType' | 'active'>;

@Component({
  selector: 'app-unit-card',
  imports: [
    EnumPipe,
    MatChipsModule,
    CommonModule,
    RouterModule,
    UnitStatusComponent,
    MatButtonModule,
    MatMenuModule,
    MatTooltip,
  ],
  templateUrl: './unit-card.component.html',
})
export class UnitCardComponent {
  unit = input.required<PartialUnitOverviewDto>();
  showActions = input<boolean>(true);
  protected readonly ICONS = ICONS;

  icon$ = computed(() => {
    const type = this.unit().unitType;
    return ICONS.UNITS[type];
  });
}
