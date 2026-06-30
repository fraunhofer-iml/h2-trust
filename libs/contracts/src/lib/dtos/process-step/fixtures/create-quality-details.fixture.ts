/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerType, RfnboType } from '@h2-trust/domain';
import { CreateProcessStepDetailsDto } from '../create-process-step-details.dto';

export const CreateQualityDetailsDtoFixture = {
  create: (overrides: Partial<CreateProcessStepDetailsDto> = {}): CreateProcessStepDetailsDto => ({
    rfnboType: overrides.rfnboType ?? RfnboType.RFNBO_READY,
    productionPowerType: overrides.productionPowerType ?? PowerType.RENEWABLE,
    usedRenewablePower: overrides.usedRenewablePower ?? 0,
    usedGridPower: overrides.usedGridPower ?? 0,
    distance: overrides.distance ?? 1000,
    wasteWater: overrides.wasteWater ?? 0,
    resinConsumption: overrides.resinConsumption ?? 0,
    compressedAir: overrides.compressedAir ?? 0,
    nitrogenConsumption: overrides.nitrogenConsumption ?? 0,
  }),
} as const;
