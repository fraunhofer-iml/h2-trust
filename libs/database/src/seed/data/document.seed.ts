import { Document } from '@prisma/client';
import { UnitSeed } from './unit';
import { ProcessStepHydrogenProductionSeed } from './process-step';

export const DocumentSeed = <Document[]>[
  {
    id: 'document-hydrogen-production-1',
    description: 'Certificate for green hydrogen production',
    location: '/dead-path/green-h2-certificate.pdf',
    unitId: UnitSeed[0].id,
    processStepId: ProcessStepHydrogenProductionSeed[0].id,
  },
];
