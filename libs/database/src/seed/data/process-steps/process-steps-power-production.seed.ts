import { ProcessStep } from '@prisma/client';
import { PowerBatchesProducedSeed } from '../batches/power-batches-produced.seed';
import { PowerProductionUnitsSeed } from '../units/power-production-units.seed';
import { UsersSeed } from '../users.seed';
import { ProcessTypesSeed } from './process-types.seed';

export const ProcessStepsPowerProductionSeed = <ProcessStep[]>[
  {
    id: 'process-step-power-production-1',
    startedAt: new Date('2025-01-20'),
    endedAt: new Date('2025-01-20'),
    processTypeName: ProcessTypesSeed[0].name,
    batchId: PowerBatchesProducedSeed[0].id,
    userId: UsersSeed[0].id,
    unitId: PowerProductionUnitsSeed[0].id,
  },
  {
    id: 'process-step-power-production-2',
    startedAt: new Date('2025-01-20'),
    endedAt: new Date('2025-01-20'),
    processTypeName: ProcessTypesSeed[0].name,
    batchId: PowerBatchesProducedSeed[1].id,
    userId: UsersSeed[0].id,
    unitId: PowerProductionUnitsSeed[0].id,
  },
  {
    id: 'process-step-power-production-3',
    startedAt: new Date('2025-01-20'),
    endedAt: new Date('2025-01-20'),
    processTypeName: ProcessTypesSeed[0].name,
    batchId: PowerBatchesProducedSeed[2].id,
    userId: UsersSeed[0].id,
    unitId: PowerProductionUnitsSeed[0].id,
  },
  {
    id: 'process-step-power-production-4',
    startedAt: new Date('2025-01-20'),
    endedAt: new Date('2025-01-20'),
    processTypeName: ProcessTypesSeed[0].name,
    batchId: PowerBatchesProducedSeed[3].id,
    userId: UsersSeed[0].id,
    unitId: PowerProductionUnitsSeed[0].id,
  },
];
