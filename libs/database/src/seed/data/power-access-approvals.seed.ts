import { PowerAccessApproval, PowerAccessApprovalStatus } from '@prisma/client';
import { CompaniesSeed } from './companies.seed';
import { DocumentsSeed } from './documents.seed';
import { EnergySourcesSeed } from './units/energy-sources.seed';
import { PowerProductionUnitsSeed } from './units';

export const PowerAccessApprovalsSeed = <PowerAccessApproval[]>[
  {
    id: 'power-access-approval-1',
    decidedAt: new Date('2025-02-01'),
    powerAccessApprovalStatus: PowerAccessApprovalStatus.APPROVED,
    energySourceName: EnergySourcesSeed[7].name,
    powerProducerId: CompaniesSeed[0].id,
    powerProductionUnitId: PowerProductionUnitsSeed[0].id,
    hydrogenProducerId: CompaniesSeed[1].id,
    documentId: DocumentsSeed[0].id,
  },
];
