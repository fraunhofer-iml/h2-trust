/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionProcessStepSeed } from 'libs/database/src/seed';
import { BatchEntityPowerProducedMock } from '../../batch/mocks';
import { DocumentEntityMock } from '../../document/mocks';
import { PowerProductionUnitEntityMock } from '../../unit/mocks';
import { UserEntityPowerMock } from '../../user/mocks';
import { ProcessStepEntity } from '../process-step.entity';

export const ProcessStepEntityPowerProductionMock: ProcessStepEntity[] = PowerProductionProcessStepSeed.map(
  (seed, index) =>
    new ProcessStepEntity(
      seed.id,
      seed.startedAt,
      seed.endedAt,
      seed.type,
      BatchEntityPowerProducedMock[index],
      UserEntityPowerMock,
      PowerProductionUnitEntityMock[0],
      DocumentEntityMock,
    ),
);
