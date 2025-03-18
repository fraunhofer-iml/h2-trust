import { ProcessStep } from '@prisma/client';

export const ProcessSteps = <ProcessStep[]>[
  {
    id: 'process-step-power-production-1',
    timestamp: new Date('2025-01-20'),
    processName: 'POWER_PRODUCTION',
    batchId: 'batch-produced-power-1',
    userId: 'user-power-1',
    unitId: 'power-production-unit-1',
  },
  {
    id: 'process-step-hydrogen-production-1',
    timestamp: new Date('2025-01-20'),
    processName: 'HYDROGEN_PRODUCTION',
    batchId: 'batch-produced-hydrogen-1',
    userId: 'user-hydrogen-1',
    unitId: 'hydrogen-production-unit-1',
  },
  {
    id: 'process-step-hydrogen-transportation-1',
    timestamp: new Date(),
    processName: 'BOTTLING',
    batchId: 'batch-transported-hydrogen-1',
    userId: 'user-hydrogen-1',
    unitId: 'hydrogen-production-unit-2',
  },
];
