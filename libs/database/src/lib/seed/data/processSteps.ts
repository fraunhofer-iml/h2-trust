import { ProcessStep } from '@prisma/client';

export const ProcessSteps = <ProcessStep[]>[
  {
    id: 'processstep-power-generation',
    timestamp: new Date('2025-01-20'),
    processName: 'POWER_GENERATION',
    batchId: 'batch-generated-power',
    userId: 'user-power',
    assetId: 'asset-power-onshore-wind-turbine',
  },
  {
    id: 'processstep-hydrogen-generation',
    timestamp: new Date('2025-01-20'),
    processName: 'H2_GENERATION',
    batchId: 'batch-generated-hydrogen',
    userId: 'user-hydrogen',
    assetId: 'asset-hydrogen-generator',
  },
  {
    id: 'processstep-hydrogen-transportation',
    timestamp: new Date(),
    processName: 'BOTTLING',
    batchId: 'batch-transported-hydrogen',
    userId: 'user-hydrogen',
    assetId: 'asset-transported-hydrogen',
  },
];
