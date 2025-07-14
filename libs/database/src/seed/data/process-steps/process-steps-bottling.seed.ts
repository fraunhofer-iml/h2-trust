import { ProcessStep } from '@prisma/client';
import { HydrogenBatchesBottledSeed } from '../batches/hydrogen-batches-bottled.seed';
import { HydrogenStorageUnitsSeed } from '../units/hydrogen-storage-units.seed';
import { UsersSeed } from '../users.seed';
import { getElementOrThrowError } from '../utils';
import { ProcessTypesSeed } from './process-types.seed';

export const ProcessStepsBottlingSeed = <ProcessStep[]>[
  {
    id: 'process-step-hydrogen-bottling-1',
    startedAt: new Date('2025-07-02T02:05:33.001Z'),
    endedAt: new Date('2025-07-02T02:05:33.001Z'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 2, 'Process Type').name,
    batchId: getElementOrThrowError(HydrogenBatchesBottledSeed, 0, 'Hydrogen Batch Bottled').id,
    userId: getElementOrThrowError(UsersSeed, 1, 'User').id,
    unitId: getElementOrThrowError(HydrogenStorageUnitsSeed, 0, 'Hydrogen Storage Unit').id,
  },
  {
    id: 'process-step-hydrogen-bottling-2',
    startedAt: new Date('2025-07-02T02:13:12.002Z'),
    endedAt: new Date('2025-07-02T02:13:12.002Z'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 2, 'Process Type').name,
    batchId: getElementOrThrowError(HydrogenBatchesBottledSeed, 1, 'Hydrogen Batch Bottled').id,
    userId: getElementOrThrowError(UsersSeed, 1, 'User').id,
    unitId: getElementOrThrowError(HydrogenStorageUnitsSeed, 0, 'Hydrogen Storage Unit').id,
  },
  {
    id: 'process-step-hydrogen-bottling-3',
    startedAt: new Date('2025-07-02T02:22:59.001Z'),
    endedAt: new Date('2025-07-02T02:22:59.001Z'),
    processTypeName: getElementOrThrowError(ProcessTypesSeed, 2, 'Process Type').name,
    batchId: getElementOrThrowError(HydrogenBatchesBottledSeed, 2, 'Hydrogen Batch Bottled').id,
    userId: getElementOrThrowError(UsersSeed, 1, 'User').id,
    unitId: getElementOrThrowError(HydrogenStorageUnitsSeed, 0, 'Hydrogen Storage Unit').id,
  },
];
