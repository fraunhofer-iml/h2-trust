import { ProcessStep } from '@prisma/client';
import { HydrogenBatchesProducedSeed } from '../batches/hydrogen-batches-produced.seed';
import { HydrogenProductionUnitsSeed } from '../units/hydrogen-production-units.seed';
import { UsersSeed } from '../users.seed';
import { ProcessTypesSeed } from './process-types.seed';

export const ProcessStepsHydrogenProductionSeed = <ProcessStep[]>[
  {
    id: 'process-step-hydrogen-production-1',
    startedAt: new Date('2025-01-20T00:00:00.001Z'),
    endedAt: new Date('2025-01-20T00:00:00.001Z'),
    processTypeName: ProcessTypesSeed[1].name,
    batchId: HydrogenBatchesProducedSeed[0].id,
    userId: UsersSeed[1].id,
    unitId: HydrogenProductionUnitsSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-2',
    startedAt: new Date('2025-01-20T00:00:00.002Z'),
    endedAt: new Date('2025-01-20T00:00:00.002Z'),
    processTypeName: ProcessTypesSeed[1].name,
    batchId: HydrogenBatchesProducedSeed[1].id,
    userId: UsersSeed[1].id,
    unitId: HydrogenProductionUnitsSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-3',
    startedAt: new Date('2025-01-20T00:00:00.003Z'),
    endedAt: new Date('2025-01-20T00:00:00.003Z'),
    processTypeName: ProcessTypesSeed[1].name,
    batchId: HydrogenBatchesProducedSeed[2].id,
    userId: UsersSeed[1].id,
    unitId: HydrogenProductionUnitsSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-production-4',
    startedAt: new Date('2025-01-20T00:00:00.004Z'),
    endedAt: new Date('2025-01-20T00:00:00.004Z'),
    processTypeName: ProcessTypesSeed[1].name,
    batchId: HydrogenBatchesProducedSeed[3].id,
    userId: UsersSeed[1].id,
    unitId: HydrogenProductionUnitsSeed[0].id,
  },
];
