import { ProcessStep } from '@prisma/client';
import { BatchPowerProducedSeed } from '../batch';
import { PowerProductionUnitSeed } from '../unit';
import { UserSeed } from '../user.seed';
import { ProcessTypeSeed } from './process-type.seed';

export const ProcessStepPowerProductionSeed = <ProcessStep[]>[
  {
    id: 'process-step-power-production-1',
    startedAt: new Date('2025-07-01T01:00:00.000Z'),
    endedAt: new Date('2025-07-01T01:13:00.000Z'),
    processTypeName: ProcessTypeSeed[0].name,
    batchId: BatchPowerProducedSeed[0].id,
    userId: UserSeed[0].id,
    unitId: PowerProductionUnitSeed[3].id,
  },
  {
    id: 'process-step-power-production-2',
    startedAt: new Date('2025-07-01T01:33:00.000Z'),
    endedAt: new Date('2025-07-01T01:38:00.000Z'),
    processTypeName: ProcessTypeSeed[0].name,
    batchId: BatchPowerProducedSeed[1].id,
    userId: UserSeed[0].id,
    unitId: PowerProductionUnitSeed[2].id,
  },
  {
    id: 'process-step-power-production-3',
    startedAt: new Date('2025-07-01T02:16:00.000Z'),
    endedAt: new Date('2025-07-01T02:22:00.000Z'),
    processTypeName: ProcessTypeSeed[0].name,
    batchId: BatchPowerProducedSeed[2].id,
    userId: UserSeed[0].id,
    unitId: PowerProductionUnitSeed[1].id,
  },
  {
    id: 'process-step-power-production-4',
    startedAt: new Date('2025-07-01T02:51:00.000Z'),
    endedAt: new Date('2025-07-01T02:55:00.000Z'),
    processTypeName: ProcessTypeSeed[0].name,
    batchId: BatchPowerProducedSeed[3].id,
    userId: UserSeed[0].id,
    unitId: PowerProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-power-production-5',
    startedAt: new Date('2025-07-01T02:55:00.000Z'),
    endedAt: new Date('2025-07-01T02:59:00.000Z'),
    processTypeName: ProcessTypeSeed[0].name,
    batchId: BatchPowerProducedSeed[4].id,
    userId: UserSeed[0].id,
    unitId: PowerProductionUnitSeed[0].id,
  },
  {
    id: 'process-step-power-production-6',
    startedAt: new Date('2025-07-01T03:01:00.000Z'),
    endedAt: new Date('2025-07-01T03:02:00.000Z'),
    processTypeName: ProcessTypeSeed[0].name,
    batchId: BatchPowerProducedSeed[5].id,
    userId: UserSeed[0].id,
    unitId: PowerProductionUnitSeed[1].id,
  },
  {
    id: 'process-step-power-production-7',
    startedAt: new Date('2025-07-01T03:03:00.000Z'),
    endedAt: new Date('2025-07-01T03:04:00.000Z'),
    processTypeName: ProcessTypeSeed[0].name,
    batchId: BatchPowerProducedSeed[6].id,
    userId: UserSeed[0].id,
    unitId: PowerProductionUnitSeed[2].id,
  },
  {
    id: 'process-step-power-production-8',
    startedAt: new Date('2025-07-01T03:04:00.000Z'),
    endedAt: new Date('2025-07-01T03:05:00.000Z'),
    processTypeName: ProcessTypeSeed[0].name,
    batchId: BatchPowerProducedSeed[7].id,
    userId: UserSeed[0].id,
    unitId: PowerProductionUnitSeed[3].id,
  },
];
