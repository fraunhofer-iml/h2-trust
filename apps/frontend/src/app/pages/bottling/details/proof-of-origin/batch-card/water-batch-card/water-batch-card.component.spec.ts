/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BatchCardComponent } from '../batch-card.component';

describe('BatchCardComponent', () => {
  let component: BatchCardComponent;
  let fixture: ComponentFixture<BatchCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BatchCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('batch', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
