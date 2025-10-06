/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStep } from '@prisma/client';
import { BatchHydrogenTransportedSeed } from '../batch';
import { HydrogenStorageUnitSeed } from '../unit';
import { UserSeed } from '../user.seed';
import { ProcessTypeSeed } from './process-type.seed';

export const ProcessStepHydrogenTransportationSeed = <ProcessStep[]>[
  {
    id: 'process-step-hydrogen-transportation-1',
    startedAt: new Date('2025-09-17T09:01:00.000Z'),
    endedAt: new Date('2025-09-17T09:01:00.000Z'),
    processTypeName: ProcessTypeSeed[3].name,
    batchId: BatchHydrogenTransportedSeed[0].id,
    userId: UserSeed[1].id,
    unitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-transportation-2',
    startedAt: new Date('2025-09-17T09:09:00.000Z'),
    endedAt: new Date('2025-09-17T09:09:00.000Z'),
    processTypeName: ProcessTypeSeed[3].name,
    batchId: BatchHydrogenTransportedSeed[1].id,
    userId: UserSeed[1].id,
    unitId: HydrogenStorageUnitSeed[0].id,
  },
];
