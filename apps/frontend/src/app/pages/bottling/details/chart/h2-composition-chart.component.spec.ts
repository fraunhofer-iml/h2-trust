/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { H2CompositionChartComponent } from './h2-composition-chart.component';

describe('H2CompositionChartComponent', () => {
  let component: H2CompositionChartComponent;
  let fixture: ComponentFixture<H2CompositionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [H2CompositionChartComponent],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(H2CompositionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
