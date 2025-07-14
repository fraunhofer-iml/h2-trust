import { ProcessStep } from '@prisma/client';
import { PowerBatchesProducedSeed } from '../batches/power-batches-produced.seed';
import { PowerProductionUnitsSeed } from '../units/power-production-units.seed';
import { UsersSeed } from '../users.seed';
import { getElementOrThrowError } from '../utils';
import { ProcessTypesSeed } from './process-types.seed';

export const ProcessStepsPowerProductionSeed = <ProcessStep[]>[
  {
    id: 'process-step-power-production-1',
    startedAt: new Date('2025-07-01T01:00:00.001Z'),
    endedAt: new Date('2025-07-01T01:13:00.001Z'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 0, 'Process Type').name,
    batchId: getElementOrThrowError(PowerBatchesProducedSeed, 0, 'Power Batch Produced').id,
    userId: getElementOrThrowError(UsersSeed, 0, 'User').id,
    unitId: getElementOrThrowError(PowerProductionUnitsSeed, 0, 'Power Production Unit').id,
  },
  {
    id: 'process-step-power-production-2',
    startedAt: new Date('2025-07-01T01:33:00.002Z'),
    endedAt: new Date('2025-07-01T01:38:00.002Z'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 0, 'Process Type').name,
    batchId: getElementOrThrowError(PowerBatchesProducedSeed, 1, 'Power Batch Produced').id,
    userId: getElementOrThrowError(UsersSeed, 0, 'User').id,
    unitId: getElementOrThrowError(PowerProductionUnitsSeed, 0, 'Power Production Unit').id,
  },
  {
    id: 'process-step-power-production-3',
    startedAt: new Date('2025-07-01T02:16:00.003Z'),
    endedAt: new Date('2025-07-01T02:22:00.003Z'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 0, 'Process Type').name,
    batchId: getElementOrThrowError(PowerBatchesProducedSeed, 2, 'Power Batch Produced').id,
    userId: getElementOrThrowError(UsersSeed, 0, 'User').id,
    unitId: getElementOrThrowError(PowerProductionUnitsSeed, 0, 'Power Production Unit').id,
  },
  {
    id: 'process-step-power-production-4',
    startedAt: new Date('2025-07-01T02:51:00.004Z'),
    endedAt: new Date('2025-07-01T02:55:00.004Z'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 0, 'Process Type').name,
    batchId: getElementOrThrowError(PowerBatchesProducedSeed, 3, 'Power Batch Produced').id,
    userId: getElementOrThrowError(UsersSeed, 0, 'User').id,
    unitId: getElementOrThrowError(PowerProductionUnitsSeed, 0, 'Power Production Unit').id,
  },
  {
    id: 'process-step-power-production-5',
    startedAt: new Date('2025-07-01T02:55:00.004Z'),
    endedAt: new Date('2025-07-01T02:59:00.004Z'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 0, 'Process Type').name,
    batchId: getElementOrThrowError(PowerBatchesProducedSeed, 4, 'Power Batch Produced').id,
    userId: getElementOrThrowError(UsersSeed, 0, 'User').id,
    unitId: getElementOrThrowError(PowerProductionUnitsSeed, 0, 'Power Production Unit').id,
  },
];
