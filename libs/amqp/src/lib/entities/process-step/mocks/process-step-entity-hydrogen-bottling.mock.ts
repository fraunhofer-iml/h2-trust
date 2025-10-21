/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepHydrogenBottlingSeed } from 'libs/database/src/seed';
import { BatchEntityHydrogenBottledMock } from '../../batch/mocks';
import { DocumentEntityMock } from '../../document/mocks';
import { HydrogenStorageUnitEntityMock } from '../../unit/mocks';
import { UserEntityHydrogenMock } from '../../user/mocks';
import { ProcessStepEntity } from '../process-step.entity';

export const ProcessStepEntityHydrogenBottlingMock: ProcessStepEntity[] = ProcessStepHydrogenBottlingSeed.map(
  (seed, index) =>
    new ProcessStepEntity(
      seed.id,
      seed.startedAt,
      seed.endedAt,
      seed.type,
      BatchEntityHydrogenBottledMock[index],
      UserEntityHydrogenMock,
      HydrogenStorageUnitEntityMock[0],
      DocumentEntityMock,
    ),
);
