/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { PowerAccessApprovalService } from './power-access-approvals.service';

describe('UnitsService', () => {
  let service: PowerAccessApprovalService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PowerAccessApprovalService, provideHttpClient()] });
    service = TestBed.inject(PowerAccessApprovalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
