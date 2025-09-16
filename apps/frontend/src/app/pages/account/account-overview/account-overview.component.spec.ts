/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { UsersService } from '../../../shared/services/users/users.service';
import { AccountOverviewComponent } from './account-overview.component';

describe('AccountOverviewComponent', () => {
  let component: AccountOverviewComponent;
  let fixture: ComponentFixture<AccountOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountOverviewComponent],
      providers: [
        provideHttpClient(),
        AuthService,
        UnitsService,
        UsersService,
        {
          provide: KeycloakService,
          useValue: {
            getUserRoles: () => [],
            loadUserProfile: () => ({}) as KeycloakProfile,
          },
        },
        provideQueryClient(new QueryClient()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
