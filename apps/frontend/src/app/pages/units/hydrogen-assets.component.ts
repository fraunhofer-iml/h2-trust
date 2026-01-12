/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TabVisibilityService } from './tab-visibility.service';
import { UnitQueryService } from './unit-query.service';

@Component({
  selector: 'app-hydrogen-assets',
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatTabsModule, RouterModule, MatButtonModule],
  providers: [],
  templateUrl: './hydrogen-assets.component.html',
})
export class HydrogenAssetsComponent {
  protected readonly queryService = inject(UnitQueryService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly visibilityService = inject(TabVisibilityService);

  showTabs = this.visibilityService.showTabs;

  tabs = computed(() => {
    return [
      { label: 'Power Production', route: 'power-production', data: this.queryService.powerProductionQuery.data() },
      {
        label: 'Hydrogen Production',
        route: 'hydrogen-production',
        data: this.queryService.hydrogenProductionQuery.data(),
      },
      { label: 'Hydrogen Storage', route: 'hydrogen-storage', data: this.queryService.hydrogenStorageQuery.data() },
    ].filter((t) => !!t.data);
  });

  constructor() {
    effect(() => {
      const tabs = this.tabs();
      if (tabs.length > 0 && !this.route.firstChild) {
        this.router.navigate([tabs[0].route], { relativeTo: this.route });
      }
    });
  }
}
