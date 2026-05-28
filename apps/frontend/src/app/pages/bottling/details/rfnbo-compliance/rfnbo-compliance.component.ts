/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { GridEnergyRfnboDto, RenewableEnergyRfnboDto, RfnboBaseDto } from '@h2-trust/contracts/dtos';
import { RfnboChipComponent } from '../../../../layout/chips/rfnbo-chip.component';
import { getRfnboComplianceStatus } from '../../../../shared/constants/icons';
import { RFNBO_CRITERIA } from '../../../../shared/constants/rfnbo-criteria';
import { EnumPipe } from '../../../../shared/pipes/enum.pipe';
import { RfnboCheckCardComponent } from './rfnbo-check-card/rfnbo-check-card.component';

@Component({
  selector: 'app-rfnbo-compliance',
  imports: [CommonModule, RfnboCheckCardComponent, RfnboChipComponent, EnumPipe],
  templateUrl: './rfnbo-compliance.component.html',
})
export class RfnboComplianceComponent {
  protected readonly RFNBO_CRITERIA = RFNBO_CRITERIA;

  redCompliance = input.required<RfnboBaseDto>();
  showComplianceInfo = false;

  isGridDto(dto: RfnboBaseDto): dto is GridEnergyRfnboDto {
    return dto.gridPowerUsed === true;
  }

  isRenewableDto(dto: RfnboBaseDto): dto is RenewableEnergyRfnboDto {
    return dto.gridPowerUsed === false;
  }

  rfnboStatus = computed(() => getRfnboComplianceStatus(Boolean(this.redCompliance()?.rfnboType)));
}
