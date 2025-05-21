import { Document } from '@prisma/client';
import { ProcessStepsHydrogenProductionSeed } from './process-steps/process-steps-hydrogen-production.seed';
import { UnitsSeed } from './units/units.seed';

export const DocumentsSeed = <Document[]>[
  {
    id: 'document-hydrogen-production-1',
    description: 'Certificate for green hydrogen production',
    location: '/dead-path/green-h2-certificate.pdf',
    unitId: UnitsSeed[0].id,
    processStepId: ProcessStepsHydrogenProductionSeed[0].id,
  },
];
