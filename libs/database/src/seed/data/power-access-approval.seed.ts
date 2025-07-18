import { PowerAccessApproval, PowerAccessApprovalStatus } from '@prisma/client';
import { CompanySeed } from './company.seed';
import { DocumentSeed } from './document.seed';
import { PowerProductionUnitSeed } from './unit';

export const PowerAccessApprovalSeed = <PowerAccessApproval[]>[
  {
    id: 'power-access-approval-1',
    decidedAt: new Date('2025-02-01'),
    powerAccessApprovalStatus: PowerAccessApprovalStatus.APPROVED,
    powerProducerId: CompanySeed[0].id,
    powerProductionUnitId: PowerProductionUnitSeed[0].id,
    hydrogenProducerId: CompanySeed[1].id,
    documentId: DocumentSeed[0].id,
  },
];
