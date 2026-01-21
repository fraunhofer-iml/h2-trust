/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { RFNBO_CRITERIA } from 'apps/frontend/src/app/shared/constants/financial-support-info';
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { GridEnergyRfnboDto, RenewableEnergyRfnboDto, RfnboBaseDto } from '@h2-trust/api';
import { RedCheckCardComponent } from './red-check-card/red-check-card.component';

@Component({
  selector: 'app-red-compliance',
  imports: [CommonModule, RedCheckCardComponent],
  templateUrl: './red-compliance.component.html',
})
export class RedComplianceComponent {
  protected readonly RED_III_CRITERIA = RFNBO_CRITERIA;

  redCompliance = input<RfnboBaseDto>();
  showComplianceInfo = false;

  isGridDto(dto: RfnboBaseDto): dto is GridEnergyRfnboDto {
    return dto.gridPowerUsed === true;
  }

  isRenewableDto(dto: RfnboBaseDto): dto is RenewableEnergyRfnboDto {
    return dto.gridPowerUsed === false;
  }
}
