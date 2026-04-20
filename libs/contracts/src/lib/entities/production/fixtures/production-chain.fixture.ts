/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnitEntity, PowerProductionUnitEntity, ProductionChainEntity } from '@h2-trust/contracts';
import { ProcessStepEntityFixture } from '../../process-step/fixtures/process-step.fixture';

export const ProductionChainEntityFixture = {
  create: (): ProductionChainEntity =>
    new ProductionChainEntity(
      ProcessStepEntityFixture.createHydrogenProduction(),
      ProcessStepEntityFixture.createHydrogenProduction(),
      ProcessStepEntityFixture.createPowerProduction(),
      ProcessStepEntityFixture.createWaterConsumption(),
      ProcessStepEntityFixture.createPowerProduction().executedBy as PowerProductionUnitEntity,
      ProcessStepEntityFixture.createWaterConsumption().executedBy as HydrogenProductionUnitEntity,
    ),
} as const;
