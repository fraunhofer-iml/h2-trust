/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStep } from '@prisma/client';
import { ProcessType } from '@h2-trust/domain';
import { BatchHydrogenBottledSeed } from '../batch';
import { HydrogenStorageUnitSeed } from '../unit';
import { UserSeed } from '../user.seed';

export const ProcessStepHydrogenBottlingSeed = <ProcessStep[]>[
  {
    id: 'process-step-hydrogen-bottling-1',
    type: ProcessType.HYDROGEN_BOTTLING,
    startedAt: new Date('2025-07-02T02:05:33.001Z'),
    endedAt: new Date('2025-07-02T02:05:33.001Z'),
    batchId: BatchHydrogenBottledSeed[0].id,
    userId: UserSeed[1].id,
    unitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-bottling-2',
    type: ProcessType.HYDROGEN_BOTTLING,
    startedAt: new Date('2025-07-02T02:13:12.002Z'),
    endedAt: new Date('2025-07-02T02:13:12.002Z'),
    batchId: BatchHydrogenBottledSeed[1].id,
    userId: UserSeed[1].id,
    unitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-bottling-3',
    type: ProcessType.HYDROGEN_BOTTLING,
    startedAt: new Date('2025-07-02T02:22:59.001Z'),
    endedAt: new Date('2025-07-02T02:22:59.001Z'),
    batchId: BatchHydrogenBottledSeed[2].id,
    userId: UserSeed[1].id,
    unitId: HydrogenStorageUnitSeed[0].id,
  },
];
