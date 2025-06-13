import { ProcessStep } from '@prisma/client';
import { PowerBatchesProducedSeed } from '../batches/power-batches-produced.seed';
import { PowerProductionUnitsSeed } from '../units/power-production-units.seed';
import { UsersSeed } from '../users.seed';
import { getElementOrThrowError } from '../utils';
import { ProcessTypesSeed } from './process-types.seed';

export const ProcessStepsPowerProductionSeed = <ProcessStep[]>[
  {
    id: 'process-step-power-production-1',
    startedAt: new Date('2025-01-20'),
    endedAt: new Date('2025-01-20'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 0, 'Process Type').name,
    batchId: getElementOrThrowError(PowerBatchesProducedSeed, 0, 'Power Batch Produced').id,
    userId: getElementOrThrowError(UsersSeed, 0, 'User').id,
    unitId: getElementOrThrowError(PowerProductionUnitsSeed, 0, 'Power Production Unit').id,
  },
  {
    id: 'process-step-power-production-2',
    startedAt: new Date('2025-01-20'),
    endedAt: new Date('2025-01-20'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 0, 'Process Type').name,
    batchId: getElementOrThrowError(PowerBatchesProducedSeed, 1, 'Power Batch Produced').id,
    userId: getElementOrThrowError(UsersSeed, 0, 'User').id,
    unitId: getElementOrThrowError(PowerProductionUnitsSeed, 0, 'Power Production Unit').id,
  },
  {
    id: 'process-step-power-production-3',
    startedAt: new Date('2025-01-20'),
    endedAt: new Date('2025-01-20'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 0, 'Process Type').name,
    batchId: getElementOrThrowError(PowerBatchesProducedSeed, 2, 'Power Batch Produced').id,
    userId: getElementOrThrowError(UsersSeed, 0, 'User').id,
    unitId: getElementOrThrowError(PowerProductionUnitsSeed, 0, 'Power Production Unit').id,
  },
  {
    id: 'process-step-power-production-4',
    startedAt: new Date('2025-01-20'),
    endedAt: new Date('2025-01-20'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 0, 'Process Type').name,
    batchId: getElementOrThrowError(PowerBatchesProducedSeed, 3, 'Power Batch Produced').id,
    userId: getElementOrThrowError(UsersSeed, 0, 'User').id,
    unitId: getElementOrThrowError(PowerProductionUnitsSeed, 0, 'Power Production Unit').id,
  },
];
