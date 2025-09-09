import { ProcessStep } from '@prisma/client';
import { BatchHydrogenProducedSeed } from '../batch';
import { HydrogenProductionUnitSeed } from '../unit';
import { UserSeed } from '../user.seed';
import { ProcessTypeSeed } from './process-type.seed';

export const ProcessStepHydrogenProductionSeed = <ProcessStep[]>[
  {
    id: 'process-step-hydrogen-production-1',
    startedAt: new Date('2025-07-01T01:00:00.000Z'),
    endedAt: new Date('2025-07-01T01:13:00.000Z'),
    processTypeName: ProcessTypeSeed[1].name,
    batchId: BatchHydrogenProducedSeed[0].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-2',
    startedAt: new Date('2025-07-01T01:33:00.000Z'),
    endedAt: new Date('2025-07-01T01:38:00.000Z'),
    processTypeName: ProcessTypeSeed[1].name,
    batchId: BatchHydrogenProducedSeed[1].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-3',
    startedAt: new Date('2025-07-01T02:16:00.000Z'),
    endedAt: new Date('2025-07-01T02:22:00.000Z'),
    processTypeName: ProcessTypeSeed[1].name,
    batchId: BatchHydrogenProducedSeed[2].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-4',
    startedAt: new Date('2025-07-01T02:51:00.000Z'),
    endedAt: new Date('2025-07-01T02:55:00.000Z'),
    processTypeName: ProcessTypeSeed[1].name,
    batchId: BatchHydrogenProducedSeed[3].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-5',
    startedAt: new Date('2025-07-01T02:55:00.000Z'),
    endedAt: new Date('2025-07-01T02:59:00.000Z'),
    processTypeName: ProcessTypeSeed[1].name,
    batchId: BatchHydrogenProducedSeed[4].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-6',
    startedAt: new Date('2025-07-01T03:01:00.000Z'),
    endedAt: new Date('2025-07-01T03:02:00.000Z'),
    processTypeName: ProcessTypeSeed[1].name,
    batchId: BatchHydrogenProducedSeed[5].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-7',
    startedAt: new Date('2025-07-01T03:03:00.000Z'),
    endedAt: new Date('2025-07-01T03:04:00.000Z'),
    processTypeName: ProcessTypeSeed[1].name,
    batchId: BatchHydrogenProducedSeed[6].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-8',
    startedAt: new Date('2025-07-01T03:04:00.000Z'),
    endedAt: new Date('2025-07-01T03:05:00.000Z'),
    processTypeName: ProcessTypeSeed[1].name,
    batchId: BatchHydrogenProducedSeed[7].id,
    userId: UserSeed[1].id,
    unitId: HydrogenProductionUnitSeed[0].id,
  },
];
