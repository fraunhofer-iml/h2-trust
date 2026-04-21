/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RfnboChipComponent } from 'apps/frontend/src/app/layout/chips/rfnbo-chip.component';
import { ICONS } from 'apps/frontend/src/app/shared/constants/icons';
import { RFNBO_CRITERIA } from 'apps/frontend/src/app/shared/constants/rfnbo-criteria';
import { RfnboStatus } from 'apps/frontend/src/app/shared/constants/rfnbo-status';
import { GridEnergyRfnboDto, RenewableEnergyRfnboDto, RfnboBaseDto } from '@h2-trust/contracts/dtos';
import { RfnboCheckCardComponent } from './rfnbo-check-card/rfnbo-check-card.component';

@Component({
  selector: 'app-rfnbo-compliance',
  imports: [CommonModule, RfnboCheckCardComponent, RfnboChipComponent],
  templateUrl: './rfnbo-compliance.component.html',
})
export class RfnboComplianceComponent {
  protected readonly RFNBO_CRITERIA = RFNBO_CRITERIA;

  redCompliance = input<RfnboBaseDto>();
  showComplianceInfo = false;

  isGridDto(dto: RfnboBaseDto): dto is GridEnergyRfnboDto {
    return dto.gridPowerUsed === true;
  }

  isRenewableDto(dto: RfnboBaseDto): dto is RenewableEnergyRfnboDto {
    return dto.gridPowerUsed === false;
  }

  rfnboStatus = computed(() =>
    this.redCompliance()?.rfnboType
      ? { text: RfnboStatus.RFNBO_READY, icon: ICONS.HYDROGEN.RFNBO_READY }
      : { text: RfnboStatus.NON_CERTIFIABLE, icon: ICONS.HYDROGEN.NON_CERTIFIABLE },
  );
}
