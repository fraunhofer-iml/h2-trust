import { ProcessStep } from '@prisma/client';
import { UserSeed } from '../user.seed';
import { ProcessTypeSeed } from './process-type.seed';
import { BatchHydrogenBottledSeed } from '../batch';
import { HydrogenStorageUnitSeed } from '../unit';

export const ProcessStepHydrogenBottlingSeed = <ProcessStep[]>[
  {
    id: 'process-step-hydrogen-bottling-1',
    startedAt: new Date('2025-07-02T02:05:33.001Z'),
    endedAt: new Date('2025-07-02T02:05:33.001Z'),
    processTypeName: ProcessTypeSeed[2].name,
    batchId: BatchHydrogenBottledSeed[0].id,
    userId: UserSeed[1].id,
    unitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-bottling-2',
    startedAt: new Date('2025-07-02T02:13:12.002Z'),
    endedAt: new Date('2025-07-02T02:13:12.002Z'),
    processTypeName: ProcessTypeSeed[2].name,
    batchId: BatchHydrogenBottledSeed[1].id,
    userId: UserSeed[1].id,
    unitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'process-step-hydrogen-bottling-3',
    startedAt: new Date('2025-07-02T02:22:59.001Z'),
    endedAt: new Date('2025-07-02T02:22:59.001Z'),
    processTypeName: ProcessTypeSeed[2].name,
    batchId: BatchHydrogenBottledSeed[2].id,
    userId: UserSeed[1].id,
    unitId: HydrogenStorageUnitSeed[0].id,
  },
];
