import { ProcessStep } from '@prisma/client';

export const HydrogenProductionProcessSteps = <ProcessStep[]>[
  {
    id: 'process-step-hydrogen-production-1',
    startedAt: new Date('2025-01-20T00:00:00.001Z'),
    endedAt: new Date('2025-01-20T00:00:00.001Z'),
    processTypeName: 'HYDROGEN_PRODUCTION',
    batchId: 'batch-produced-hydrogen-1',
    userId: '6f63a1a9-6cc5-4a7a-98b2-79a0460910f4',
    unitId: 'hydrogen-production-unit-1',
  },
  {
    id: 'process-step-hydrogen-production-2',
    startedAt: new Date('2025-01-20T00:00:00.002Z'),
    endedAt: new Date('2025-01-20T00:00:00.002Z'),
    processTypeName: 'HYDROGEN_PRODUCTION',
    batchId: 'batch-produced-hydrogen-2',
    userId: '6f63a1a9-6cc5-4a7a-98b2-79a0460910f4',
    unitId: 'hydrogen-production-unit-1',
  },
  {
    id: 'process-step-hydrogen-production-3',
    startedAt: new Date('2025-01-20T00:00:00.003Z'),
    endedAt: new Date('2025-01-20T00:00:00.003Z'),
    processTypeName: 'HYDROGEN_PRODUCTION',
    batchId: 'batch-produced-hydrogen-3',
    userId: '6f63a1a9-6cc5-4a7a-98b2-79a0460910f4',
    unitId: 'hydrogen-production-unit-1',
  },
  {
    id: 'process-step-hydrogen-production-4',
    startedAt: new Date('2025-01-20T00:00:00.004Z'),
    endedAt: new Date('2025-01-20T00:00:00.004Z'),
    processTypeName: 'HYDROGEN_PRODUCTION',
    batchId: 'batch-produced-hydrogen-4',
    userId: '6f63a1a9-6cc5-4a7a-98b2-79a0460910f4',
    unitId: 'hydrogen-production-unit-1',
  },
];
