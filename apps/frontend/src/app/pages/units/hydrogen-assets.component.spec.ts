/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { KeycloakService } from 'keycloak-angular';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../shared/services/auth/auth.service';
import { UnitsService } from '../../shared/services/units/units.service';
import { UsersService } from '../../shared/services/users/users.service';
import { HydrogenAssetsComponent } from './hydrogen-assets.component';

describe('HydrogenAssetsComponent', () => {
  let component: HydrogenAssetsComponent;
  let fixture: ComponentFixture<HydrogenAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HydrogenAssetsComponent],
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
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 123 }),
          },
        },
        provideQueryClient(new QueryClient()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HydrogenAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
