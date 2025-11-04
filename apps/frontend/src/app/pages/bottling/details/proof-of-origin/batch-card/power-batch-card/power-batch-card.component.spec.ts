/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PowerBatchDto } from '@h2-trust/api';
import { PowerBatchCardComponent } from './power-batch-card.component';

describe('BatchCardComponent', () => {
  let component: PowerBatchCardComponent;
  let fixture: ComponentFixture<PowerBatchCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PowerBatchCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PowerBatchCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('batch', { amount: 12, emission: { amount: 20 } } as PowerBatchDto);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
