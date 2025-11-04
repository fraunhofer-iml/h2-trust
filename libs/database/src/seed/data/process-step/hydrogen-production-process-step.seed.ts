/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStep } from '@prisma/client';
import { ProcessType } from '@h2-trust/domain';
import { HydrogenProductionBatchSeed } from '../batch';
import { HydrogenProductionUnitSeed } from '../unit';
import { UserSeed } from '../user.seed';

export const HydrogenProductionProcessStepSeed = <ProcessStep[]>[
  {
    id: 'process-step-hydrogen-production-0',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-10-01T01:00:02.000Z'),
    endedAt: new Date('2025-10-01T01:06:09.000Z'),
    batchId: HydrogenProductionBatchSeed[0].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-1',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-10-01T01:31:14.000Z'),
    endedAt: new Date('2025-10-01T01:33:08.000Z'),
    batchId: HydrogenProductionBatchSeed[1].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-2',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-10-01T08:52:23.000Z'),
    endedAt: new Date('2025-10-01T08:59:01.000Z'),
    batchId: HydrogenProductionBatchSeed[2].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-3',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-10-01T11:11:08.000Z'),
    endedAt: new Date('2025-10-01T11:12:00.000Z'),
    batchId: HydrogenProductionBatchSeed[3].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-4',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-10-01T19:54:05.000Z'),
    endedAt: new Date('2025-10-01T19:56:33.000Z'),
    batchId: HydrogenProductionBatchSeed[4].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-5',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-10-02T10:09:17.000Z'),
    endedAt: new Date('2025-10-02T10:14:59.000Z'),
    batchId: HydrogenProductionBatchSeed[5].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-6',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-10-02T15:00:30.000Z'),
    endedAt: new Date('2025-10-02T15:02:03.000Z'),
    batchId: HydrogenProductionBatchSeed[6].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-7',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-10-03T13:02:54.000Z'),
    endedAt: new Date('2025-10-03T13:09:42.000Z'),
    batchId: HydrogenProductionBatchSeed[7].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-8',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-10-03T13:10:23.000Z'),
    endedAt: new Date('2025-10-03T13:13:49.000Z'),
    batchId: HydrogenProductionBatchSeed[8].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-9',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-10-03T17:05:35.000Z'),
    endedAt: new Date('2025-10-03T17:09:48.000Z'),
    batchId: HydrogenProductionBatchSeed[9].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
];
