import { ProcessStep } from '@prisma/client';
import { HydrogenBatchesProducedSeed } from '../batches/hydrogen-batches-produced.seed';
import { HydrogenProductionUnitsSeed } from '../units/hydrogen-production-units.seed';
import { UsersSeed } from '../users.seed';
import { getElementOrThrowError } from '../utils';
import { ProcessTypesSeed } from './process-types.seed';

export const ProcessStepsHydrogenProductionSeed = <ProcessStep[]>[
  {
    id: 'process-step-hydrogen-production-1',
    startedAt: new Date('2025-01-20T00:00:00.001Z'),
    endedAt: new Date('2025-01-20T00:00:00.001Z'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 1, 'Process Type').name,
    batchId: getElementOrThrowError(HydrogenBatchesProducedSeed, 0, 'Hydrogen Batch Produced').id,
    userId: getElementOrThrowError(UsersSeed, 1, 'User').id,
    unitId: getElementOrThrowError(HydrogenProductionUnitsSeed, 0, 'Hydrogen Production Unit').id,
  },
  {
    id: 'process-step-hydrogen-production-2',
    startedAt: new Date('2025-01-20T00:00:00.002Z'),
    endedAt: new Date('2025-01-20T00:00:00.002Z'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 1, 'Process Type').name,
    batchId: getElementOrThrowError(HydrogenBatchesProducedSeed, 1, 'Hydrogen Batch Produced').id,
    userId: getElementOrThrowError(UsersSeed, 1, 'User').id,
    unitId: getElementOrThrowError(HydrogenProductionUnitsSeed, 0, 'Hydrogen Production Unit').id,
  },
  {
    id: 'process-step-hydrogen-production-3',
    startedAt: new Date('2025-01-20T00:00:00.003Z'),
    endedAt: new Date('2025-01-20T00:00:00.003Z'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 1, 'Process Type').name,
    batchId: getElementOrThrowError(HydrogenBatchesProducedSeed, 2, 'Hydrogen Batch Produced').id,
    userId: getElementOrThrowError(UsersSeed, 1, 'User').id,
    unitId: getElementOrThrowError(HydrogenProductionUnitsSeed, 0, 'Hydrogen Production Unit').id,
  },
  {
    id: 'process-step-hydrogen-production-4',
    startedAt: new Date('2025-01-20T00:00:00.004Z'),
    endedAt: new Date('2025-01-20T00:00:00.004Z'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 1, 'Process Type').name,
    batchId: getElementOrThrowError(HydrogenBatchesProducedSeed, 3, 'Hydrogen Batch Produced').id,
    userId: getElementOrThrowError(UsersSeed, 1, 'User').id,
    unitId: getElementOrThrowError(HydrogenProductionUnitsSeed, 0, 'Hydrogen Production Unit').id,
  },
];
