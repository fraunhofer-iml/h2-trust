/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FINANCIAL_SUPPORT_INFO } from 'apps/frontend/src/app/shared/constants/financial-support-info';
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RedComplianceDto } from '@h2-trust/api';

@Component({
  selector: 'app-red-compliance',
  imports: [CommonModule],
  templateUrl: './red-compliance.component.html',
})
export class RedComplianceComponent {
  protected readonly FFINANCIAL_SUPPORT_INFOI = FINANCIAL_SUPPORT_INFO;
  redCompliance = input<RedComplianceDto>();
  showOverlay = false;

  onCLick(show: boolean) {
    this.showOverlay = show;
  }
}
