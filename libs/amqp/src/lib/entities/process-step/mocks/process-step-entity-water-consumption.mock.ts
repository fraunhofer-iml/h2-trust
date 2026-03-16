/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { WaterConsumptionProcessStepSeed } from 'libs/database/src/seed';
import { ProcessType } from '@h2-trust/domain';
import { BatchEntityWaterConsumedMock } from '../../batch/mocks';
import { DocumentEntityMock } from '../../document/mocks';
import { HydrogenProductionUnitEntityMock } from '../../unit/mocks';
import { UserEntityHydrogenMock } from '../../user/mocks';
import { ProcessStepEntity } from '../process-step.entity';

export const ProcessStepEntityWaterConsumptionMock: ProcessStepEntity[] = WaterConsumptionProcessStepSeed.map(
  (seed, index) =>
    new ProcessStepEntity(
      seed.id,
      seed.startedAt,
      seed.endedAt,
      seed.type as ProcessType,
      BatchEntityWaterConsumedMock[index],
      UserEntityHydrogenMock,
      HydrogenProductionUnitEntityMock[0],
      DocumentEntityMock,
    ),
);
