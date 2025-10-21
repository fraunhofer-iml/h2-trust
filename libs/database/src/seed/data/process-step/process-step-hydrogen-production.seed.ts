/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStep } from '@prisma/client';
import { ProcessType } from '@h2-trust/domain';
import { BatchHydrogenProducedSeed } from '../batch';
import { HydrogenProductionUnitSeed } from '../unit';
import { UserSeed } from '../user.seed';

export const ProcessStepHydrogenProductionSeed = <ProcessStep[]>[
  {
    id: 'process-step-hydrogen-production-1',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-07-01T01:00:00.000Z'),
    endedAt: new Date('2025-07-01T01:13:00.000Z'),
    batchId: BatchHydrogenProducedSeed[0].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-2',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-07-01T01:33:00.000Z'),
    endedAt: new Date('2025-07-01T01:38:00.000Z'),
    batchId: BatchHydrogenProducedSeed[1].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-3',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-07-01T02:16:00.000Z'),
    endedAt: new Date('2025-07-01T02:22:00.000Z'),
    batchId: BatchHydrogenProducedSeed[2].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-4',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-07-01T02:51:00.000Z'),
    endedAt: new Date('2025-07-01T02:55:00.000Z'),
    batchId: BatchHydrogenProducedSeed[3].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-5',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-07-01T02:55:00.000Z'),
    endedAt: new Date('2025-07-01T02:59:00.000Z'),
    batchId: BatchHydrogenProducedSeed[4].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-6',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-07-01T03:01:00.000Z'),
    endedAt: new Date('2025-07-01T03:02:00.000Z'),
    batchId: BatchHydrogenProducedSeed[5].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-7',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-07-01T03:03:00.000Z'),
    endedAt: new Date('2025-07-01T03:04:00.000Z'),
    batchId: BatchHydrogenProducedSeed[6].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-8',
    type: ProcessType.HYDROGEN_PRODUCTION,
    startedAt: new Date('2025-07-01T03:04:00.000Z'),
    endedAt: new Date('2025-07-01T03:05:00.000Z'),
    batchId: BatchHydrogenProducedSeed[7].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
];
