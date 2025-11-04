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
import { ProofOfOriginComponent } from './proof-of-origin.component';

describe('ProofOfOriginComponent', () => {
  let component: ProofOfOriginComponent;
  let fixture: ComponentFixture<ProofOfOriginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProofOfOriginComponent],
      providers: [BottlingService, provideHttpClient(), provideQueryClient(new QueryClient())],
    }).compileComponents();

    fixture = TestBed.createComponent(ProofOfOriginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
