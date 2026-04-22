/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStep } from '@prisma/client';
import { ProcessType } from '@h2-trust/domain';
import { auditTimestamp } from '../audit-timestamp.constant';
import { PowerProductionBatchSeed } from '../batch';
import { PowerProductionUnitSeed } from '../unit';
import { UserSeed } from '../user.seed';

export const PowerProductionProcessStepSeed: readonly ProcessStep[] = Object.freeze([
  {
    id: 'process-step-power-production-0',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: ProcessType.POWER_PRODUCTION,
    startedAt: new Date('2025-10-01T01:00:02.000Z'),
    endedAt: new Date('2025-10-01T01:06:09.000Z'),
    batchId: PowerProductionBatchSeed[0].id,
    userId: UserSeed[1].id,
    unitId: PowerProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-power-production-1',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: ProcessType.POWER_PRODUCTION,
    startedAt: new Date('2025-10-01T01:31:14.000Z'),
    endedAt: new Date('2025-10-01T01:33:08.000Z'),
    batchId: PowerProductionBatchSeed[1].id,
    userId: UserSeed[1].id,
    unitId: PowerProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-power-production-2',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: ProcessType.POWER_PRODUCTION,
    startedAt: new Date('2025-10-01T08:52:23.000Z'),
    endedAt: new Date('2025-10-01T08:59:01.000Z'),
    batchId: PowerProductionBatchSeed[2].id,
    userId: UserSeed[1].id,
    unitId: PowerProductionUnitSeed[1].id,
  },
  {
    id: 'process-step-power-production-3',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: ProcessType.POWER_PRODUCTION,
    startedAt: new Date('2025-10-01T11:11:08.000Z'),
    endedAt: new Date('2025-10-01T11:12:00.000Z'),
    batchId: PowerProductionBatchSeed[3].id,
    userId: UserSeed[1].id,
    unitId: PowerProductionUnitSeed[1].id,
  },
  {
    id: 'process-step-power-production-4',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: ProcessType.POWER_PRODUCTION,
    startedAt: new Date('2025-10-01T19:54:05.000Z'),
    endedAt: new Date('2025-10-01T19:56:33.000Z'),
    batchId: PowerProductionBatchSeed[4].id,
    userId: UserSeed[1].id,
    unitId: PowerProductionUnitSeed[2].id,
  },
  {
    id: 'process-step-power-production-5',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: ProcessType.POWER_PRODUCTION,
    startedAt: new Date('2025-10-02T10:09:17.000Z'),
    endedAt: new Date('2025-10-02T10:14:59.000Z'),
    batchId: PowerProductionBatchSeed[5].id,
    userId: UserSeed[1].id,
    unitId: PowerProductionUnitSeed[2].id,
  },
  {
    id: 'process-step-power-production-6',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: ProcessType.POWER_PRODUCTION,
    startedAt: new Date('2025-10-02T15:00:30.000Z'),
    endedAt: new Date('2025-10-02T15:02:03.000Z'),
    batchId: PowerProductionBatchSeed[6].id,
    userId: UserSeed[1].id,
    unitId: PowerProductionUnitSeed[3].id,
  },
  {
    id: 'process-step-power-production-7',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: ProcessType.POWER_PRODUCTION,
    startedAt: new Date('2025-10-03T13:02:54.000Z'),
    endedAt: new Date('2025-10-03T13:09:42.000Z'),
    batchId: PowerProductionBatchSeed[7].id,
    userId: UserSeed[1].id,
    unitId: PowerProductionUnitSeed[3].id,
  },
  {
    id: 'process-step-power-production-8',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: ProcessType.POWER_PRODUCTION,
    startedAt: new Date('2025-10-03T13:10:23.000Z'),
    endedAt: new Date('2025-10-03T13:13:49.000Z'),
    batchId: PowerProductionBatchSeed[8].id,
    userId: UserSeed[1].id,
    unitId: PowerProductionUnitSeed[3].id,
  },
  {
    id: 'process-step-power-production-9',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: ProcessType.POWER_PRODUCTION,
    startedAt: new Date('2025-10-03T17:05:35.000Z'),
    endedAt: new Date('2025-10-03T17:09:48.000Z'),
    batchId: PowerProductionBatchSeed[9].id,
    userId: UserSeed[1].id,
    unitId: PowerProductionUnitSeed[2].id,
  },
]);
