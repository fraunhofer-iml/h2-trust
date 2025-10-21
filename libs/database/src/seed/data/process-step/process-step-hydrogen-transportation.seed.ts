/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStep } from '@prisma/client';
import { ProcessType } from '@h2-trust/domain';
import { BatchHydrogenTransportedSeed } from '../batch';
import { HydrogenStorageUnitSeed } from '../unit';
import { UserSeed } from '../user.seed';

export const ProcessStepHydrogenTransportationSeed = <ProcessStep[]>[
  {
    id: 'process-step-hydrogen-transportation-1',
    type: ProcessType.HYDROGEN_TRANSPORTATION,
    startedAt: new Date('2025-09-17T09:01:00.000Z'),
    endedAt: new Date('2025-09-17T09:01:00.000Z'),
    batchId: BatchHydrogenTransportedSeed[0].id,
    userId: UserSeed[1].id,
    unitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-transportation-2',
    type: ProcessType.HYDROGEN_TRANSPORTATION,
    startedAt: new Date('2025-09-17T09:09:00.000Z'),
    endedAt: new Date('2025-09-17T09:09:00.000Z'),
    batchId: BatchHydrogenTransportedSeed[1].id,
    userId: UserSeed[1].id,
    unitId: HydrogenStorageUnitSeed[0].id,
  },
];
