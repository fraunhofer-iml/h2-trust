/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { GridEnergyRfnboDto, RenewableEnergyRfnboDto, RfnboBaseDto } from '@h2-trust/contracts/dtos';

export const RfnboComplianceDtoFixture = {
  createRenewableEnergy: (overrides: Partial<RenewableEnergyRfnboDto> = {}): RenewableEnergyRfnboDto => ({
    gridPowerUsed: overrides.gridPowerUsed ?? false,
    emissionReductionOver70Percent: overrides.emissionReductionOver70Percent ?? true,
    geoCorrelationValid: overrides.geoCorrelationValid ?? true,
    timeCorrelationValid: overrides.timeCorrelationValid ?? true,
    additionalityFulfilled: overrides.additionalityFulfilled ?? true,
    financialSupportReceived: overrides.financialSupportReceived ?? true,
    rfnboType: overrides.rfnboType ?? true,
  }),
  createGridEnergy: (overrides: Partial<GridEnergyRfnboDto> = {}): GridEnergyRfnboDto => ({
    gridPowerUsed: overrides.gridPowerUsed ?? true,
    emissionReductionOver70Percent: overrides.emissionReductionOver70Percent ?? true,
    highRenewableShare: overrides.highRenewableShare ?? true,
    gridGHGIntensityLow: overrides.gridGHGIntensityLow ?? true,
    curtailmentAvoided: overrides.curtailmentAvoided ?? true,
    rfnboType: overrides.rfnboType ?? true,
  }),
  create: (overrides: Partial<RfnboBaseDto> = {}): RfnboBaseDto =>
    RfnboComplianceDtoFixture.createRenewableEnergy(overrides as Partial<RenewableEnergyRfnboDto>),
} as const;