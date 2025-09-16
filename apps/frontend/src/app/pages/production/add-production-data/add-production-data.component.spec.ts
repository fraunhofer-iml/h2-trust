/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { KeycloakService } from 'keycloak-angular';
import { provideEchartsCore } from 'ngx-echarts';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { UsersService } from '../../../shared/services/users/users.service';
import { AddProductionDataComponent } from './add-production-data.component';

describe('AddProductionDataComponent', () => {
  let component: AddProductionDataComponent;
  let fixture: ComponentFixture<AddProductionDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProductionDataComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        AuthService,
        UnitsService,
        UsersService,
        provideHttpClient(),
        {
          provide: KeycloakService,
          useValue: {
            getUserRoles: () => [],
          },
        },
        provideQueryClient(new QueryClient()),
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddProductionDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
