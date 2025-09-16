/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { KeycloakService } from 'keycloak-angular';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { UnitsService } from '../../../../shared/services/units/units.service';
import { UsersService } from '../../../../shared/services/users/users.service';
import { PowerProductionTableComponent } from './power-production-table.component';

describe('HydrogenStorageTableComponent', () => {
  let component: PowerProductionTableComponent;
  let fixture: ComponentFixture<PowerProductionTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PowerProductionTableComponent],
      providers: [
        provideHttpClient(),
        provideAnimations(),
        AuthService,
        UnitsService,
        UsersService,
        {
          provide: KeycloakService,
          useValue: {
            getUserRoles: () => [],
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PowerProductionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
