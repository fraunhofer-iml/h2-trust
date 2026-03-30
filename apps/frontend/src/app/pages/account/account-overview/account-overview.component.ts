/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { PpaRequestRole } from '@h2-trust/domain';
import {
  hydrogenProductionUnitsQueryOptions,
  powerProductionUnitsQueryOptions,
} from '../../../shared/queries/hydrogen-production-units.query';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { UsersService } from '../../../shared/services/users/users.service';
import { PpaRequestsOverviewComponent } from '../ppa-requests-overview/ppa-requests-overview.component';

@Component({
  selector: 'app-account-overview',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    CommonModule,
    MatTabsModule,
    PpaRequestsOverviewComponent,
  ],
  templateUrl: './account-overview.component.html',
})
export class AccountOverviewComponent implements OnInit {
  protected readonly PpaRequestRole = PpaRequestRole;
  protected readonly unitsService = inject(UnitsService);

  constructor(
    private readonly authService: AuthService,
    private readonly accountService: UsersService,
  ) {}

  userId$ = signal<string | undefined>(undefined);

  hydrogenProductionUnitsQuery = injectQuery(() => hydrogenProductionUnitsQueryOptions(this.unitsService));
  powerProductionUnitsQuery = injectQuery(() => powerProductionUnitsQueryOptions(this.unitsService));

  isPowerProducer = computed(() => (this.powerProductionUnitsQuery.data()?.length ?? 0) > 0);
  isHydrogenProducer = computed(() => (this.hydrogenProductionUnitsQuery.data()?.length ?? 0) > 0);

  accountQuery = injectQuery(() => ({
    queryKey: ['account-info', this.userId$()],
    queryFn: () => this.accountService.getUserAccountInformation(this.userId$() ?? ''),
    enabled: !!this.userId$(),
  }));

  async ngOnInit() {
    const userId = await this.authService.getUserId();
    this.userId$.set(userId);
  }
}
