import { ProcessStep } from '@prisma/client';

export const PowerProductionProcessSteps = <ProcessStep[]>[
  {
    id: 'process-step-power-production-1',
    startedAt: new Date('2025-01-20'),
    endedAt: new Date('2025-01-20'),
    processTypeName: 'POWER_PRODUCTION',
    batchId: 'batch-produced-power-1',
    userId: 'user-power-1',
    unitId: 'power-production-unit-1',
  },
];
