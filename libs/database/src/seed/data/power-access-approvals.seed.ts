import { PowerAccessApproval, PowerAccessApprovalStatus } from '@prisma/client';
import { CompaniesSeed } from './companies.seed';
import { DocumentsSeed } from './documents.seed';
import { PowerProductionUnitsSeed } from './units';
import { EnergySourcesSeed } from './units/energy-sources.seed';
import { getElementOrThrowError } from './utils';

export const PowerAccessApprovalsSeed = <PowerAccessApproval[]>[
  {
    id: 'power-access-approval-1',
    decidedAt: new Date('2025-02-01'),
    powerAccessApprovalStatus: PowerAccessApprovalStatus.APPROVED,
    energySourceName: getElementOrThrowError(EnergySourcesSeed, 7, 'Energy Source').name,
    powerProducerId: getElementOrThrowError(CompaniesSeed, 0, 'Company').id,
    powerProductionUnitId: getElementOrThrowError(PowerProductionUnitsSeed, 0, 'Power Production Unit').id,
    hydrogenProducerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
    documentId: getElementOrThrowError(DocumentsSeed, 0, 'Document').id,
  },
];
