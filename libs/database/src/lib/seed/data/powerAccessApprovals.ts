import { PowerAccessApproval } from '@prisma/client';

export const PowerAccessApprovals = <PowerAccessApproval[]>[
  {
    id: 'power-access-approval-wind-h2-generation',
    decidedAt: new Date('2025-02-01'),
    powerAccessApprovalStatus: 'APPROVED',
    energySourceName: 'WIND_ENERGY',
    hydrogenProducerId: 'company-hydrogen',
    powerProducerId: 'company-power',
    documentId: 'document-hydrogen-generation',
  },
];
