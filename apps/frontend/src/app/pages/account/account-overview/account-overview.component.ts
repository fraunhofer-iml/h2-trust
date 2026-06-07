/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { PpaRequestRole } from '@h2-trust/domain';
import { ErrorCardComponent } from '../../../layout/error-card/error-card.component';
import { LoadingCardComponent } from '../../../layout/loading-card/loading-card.component';
import { H2TrustRoutes } from '../../../shared/constants/routes';
import { QueryKeyPrefix } from '../../../shared/queries/shared-query-keys';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { UsersService } from '../../../shared/services/users/users.service';
import { UserRolesStore } from '../../../shared/store/user-role.store';
import { CreatePpaRequestComponent } from '../create-ppa-request/create-ppa-request.component';
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
    ErrorCardComponent,
    LoadingCardComponent,
  ],
  templateUrl: './account-overview.component.html',
})
export class AccountOverviewComponent implements OnInit {
  protected readonly H2TrustRoutes = H2TrustRoutes;
  protected readonly PpaRequestRole = PpaRequestRole;
  protected readonly unitsService = inject(UnitsService);
  protected readonly authService = inject(AuthService);
  protected readonly accountService = inject(UsersService);
  protected readonly roles = inject(UserRolesStore);
  readonly dialog = inject(MatDialog);

  userId = signal<string | undefined>(undefined);

  accountQuery = injectQuery(() => ({
    queryKey: [QueryKeyPrefix.USERS, this.userId()],
    queryFn: () => this.accountService.getUserAccountInformation(this.userId() ?? ''),
    enabled: !!this.userId(),
  }));

  async ngOnInit() {
    const userId = await this.authService.getUserId();
    this.userId.set(userId);
  }

  openDialog() {
    this.dialog.open(CreatePpaRequestComponent);
  }
}
