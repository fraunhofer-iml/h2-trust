/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStep } from '@prisma/client';
import { ProcessType } from '@h2-trust/domain';
import { HydrogenTransportationBatchSeed } from '../batch';
import { HydrogenStorageUnitSeed } from '../unit';
import { UserSeed } from '../user.seed';

export const HydrogenTransportationProcessStepSeed = <ProcessStep[]>[
  {
    id: 'process-step-hydrogen-transportation-0',
    type: ProcessType.HYDROGEN_TRANSPORTATION,
    startedAt: new Date('2025-10-01T20:01:02.000Z'),
    endedAt: new Date('2025-10-01T20:01:02.000Z'),
    batchId: HydrogenTransportationBatchSeed[0].id,
    userId: UserSeed[1].id,
    unitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-transportation-1',
    type: ProcessType.HYDROGEN_TRANSPORTATION,
    startedAt: new Date('2025-10-03T13:11:41.000Z'),
    endedAt: new Date('2025-10-03T13:11:41.000Z'),
    batchId: HydrogenTransportationBatchSeed[1].id,
    userId: UserSeed[1].id,
    unitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-transportation-2',
    type: ProcessType.HYDROGEN_TRANSPORTATION,
    startedAt: new Date('2025-10-03T14:12:13.000Z'),
    endedAt: new Date('2025-10-03T14:12:13.000Z'),
    batchId: HydrogenTransportationBatchSeed[2].id,
    userId: UserSeed[1].id,
    unitId: HydrogenStorageUnitSeed[0].id,
  },
];
