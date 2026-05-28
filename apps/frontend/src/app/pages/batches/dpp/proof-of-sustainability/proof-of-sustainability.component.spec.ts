/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { BottlingService } from '../../../../shared/services/bottling/bottling.service';
import { ProofOfSustainabilityComponent } from './proof-of-sustainability.component';

describe('ProofOfSustainabilityComponent', () => {
  let component: ProofOfSustainabilityComponent;
  let fixture: ComponentFixture<ProofOfSustainabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProofOfSustainabilityComponent],
      providers: [BottlingService, provideHttpClient(), provideQueryClient(new QueryClient())],
    }).compileComponents();

    fixture = TestBed.createComponent(ProofOfSustainabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
