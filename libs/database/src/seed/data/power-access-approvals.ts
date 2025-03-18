import { PowerAccessApproval, PowerAccessApprovalStatus } from '@prisma/client';

export const PowerAccessApprovals = <PowerAccessApproval[]>[
  {
    id: 'power-access-approval-1',
    decidedAt: new Date('2025-02-01'),
    powerAccessApprovalStatus: PowerAccessApprovalStatus.APPROVED,
    energySourceName: 'WIND_ENERGY',
    powerProducerId: 'company-power-1',
    hydrogenProducerId: 'company-hydrogen-1',
    documentId: 'document-hydrogen-production-1',
  },
];
