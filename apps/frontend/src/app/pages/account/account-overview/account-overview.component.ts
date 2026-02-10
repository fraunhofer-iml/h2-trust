/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { UsersService } from '../../../shared/services/users/users.service';

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
  ],
  templateUrl: './account-overview.component.html',
})
export class AccountOverviewComponent implements OnInit {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: UsersService,
  ) {}

  userId$ = signal<string | undefined>(undefined);

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
