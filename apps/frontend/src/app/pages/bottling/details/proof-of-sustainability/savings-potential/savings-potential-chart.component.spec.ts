/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SavingsPotentialChartComponent } from './savings-potential-chart.component';

describe('SavingsPotentialChartComponent', () => {
  let component: SavingsPotentialChartComponent;
  let fixture: ComponentFixture<SavingsPotentialChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingsPotentialChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SavingsPotentialChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
