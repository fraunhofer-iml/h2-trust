/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateProcessStepQualityPayload } from '@h2-trust/contracts/payloads';
import { PowerType, RfnboType } from '@h2-trust/domain';

export const CreateProcessStepQualityPayloadFixture = {
  create: (overrides: Partial<CreateProcessStepQualityPayload> = {}): CreateProcessStepQualityPayload =>
    new CreateProcessStepQualityPayload(
      overrides.rfnboType ?? RfnboType.RFNBO_READY,
      overrides.productionPowerType ?? PowerType.RENEWABLE,
      overrides.usedRenewablePower ?? 0,
      overrides.usedGridPower ?? 0,
      overrides.distance ?? 1000,
      overrides.wasteWater ?? 0,
      overrides.resinConsumption ?? 0,
      overrides.compressedAir ?? 0,
      overrides.nitrogenConsumption ?? 0,
    ),
} as const;
