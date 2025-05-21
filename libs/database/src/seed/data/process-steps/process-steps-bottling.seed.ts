import { ProcessStep } from '@prisma/client';
import { HydrogenBatchesBottledSeed } from '../batches/hydrogen-batches-bottled.seed';
import { HydrogenStorageUnitsSeed } from '../units/hydrogen-storage-units.seed';
import { UsersSeed } from '../users.seed';
import { ProcessTypesSeed } from './process-types.seed';

export const ProcessStepsBottlingSeed = <ProcessStep[]>[
  {
    id: 'process-step-hydrogen-bottling-1',
    startedAt: new Date('2025-03-11T02:36:40.001Z'),
    endedAt: new Date('2025-03-11T02:46:40.001Z'),
    processTypeName: ProcessTypesSeed[2].name,
    batchId: HydrogenBatchesBottledSeed[0].id,
    userId: UsersSeed[1].id,
    unitId: HydrogenStorageUnitsSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-bottling-2',
    startedAt: new Date('2024-11-07T03:57:43.001Z'),
    endedAt: new Date('2024-11-07T04:57:43.001Z'),
    processTypeName: ProcessTypesSeed[2].name,
    batchId: HydrogenBatchesBottledSeed[1].id,
    userId: UsersSeed[1].id,
    unitId: HydrogenStorageUnitsSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-bottling-3',
    startedAt: new Date('2024-10-17T01:41:12.001Z'),
    endedAt: new Date('2024-10-17T01:51:12.001Z'),
    processTypeName: ProcessTypesSeed[2].name,
    batchId: HydrogenBatchesBottledSeed[2].id,
    userId: UsersSeed[1].id,
    unitId: HydrogenStorageUnitsSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-bottling-4',
    startedAt: new Date('2024-12-15T06:22:33.001Z'),
    endedAt: new Date('2024-12-15T06:32:33.001Z'),
    processTypeName: ProcessTypesSeed[2].name,
    batchId: HydrogenBatchesBottledSeed[3].id,
    userId: UsersSeed[1].id,
    unitId: HydrogenStorageUnitsSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-bottling-5',
    startedAt: new Date('2024-11-25T08:12:55.001Z'),
    endedAt: new Date('2024-11-25T08:22:55.001Z'),
    processTypeName: ProcessTypesSeed[2].name,
    batchId: HydrogenBatchesBottledSeed[4].id,
    userId: UsersSeed[1].id,
    unitId: HydrogenStorageUnitsSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-bottling-6',
    startedAt: new Date('2024-12-01T04:45:22.001Z'),
    endedAt: new Date('2024-12-01T04:55:22.001Z'),
    processTypeName: ProcessTypesSeed[2].name,
    batchId: HydrogenBatchesBottledSeed[5].id,
    userId: UsersSeed[1].id,
    unitId: HydrogenStorageUnitsSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-bottling-7',
    startedAt: new Date('2024-10-21T23:45:06.001Z'),
    endedAt: new Date('2024-10-21T23:55:06.001Z'),
    processTypeName: ProcessTypesSeed[2].name,
    batchId: HydrogenBatchesBottledSeed[6].id,
    userId: UsersSeed[1].id,
    unitId: HydrogenStorageUnitsSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-bottling-8',
    startedAt: new Date('2025-02-09T06:32:41.001Z'),
    endedAt: new Date('2025-02-09T06:42:41.001Z'),
    processTypeName: ProcessTypesSeed[2].name,
    batchId: HydrogenBatchesBottledSeed[7].id,
    userId: UsersSeed[1].id,
    unitId: HydrogenStorageUnitsSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-bottling-9',
    startedAt: new Date('2025-01-12T09:08:02.001Z'),
    endedAt: new Date('2025-01-12T09:18:02.001Z'),
    processTypeName: ProcessTypesSeed[2].name,
    batchId: HydrogenBatchesBottledSeed[8].id,
    userId: UsersSeed[1].id,
    unitId: HydrogenStorageUnitsSeed[0].id,
  },
];
