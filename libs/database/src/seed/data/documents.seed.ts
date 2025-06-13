import { Document } from '@prisma/client';
import { ProcessStepsHydrogenProductionSeed } from './process-steps/process-steps-hydrogen-production.seed';
import { UnitsSeed } from './units/units.seed';
import { getElementOrThrowError } from './utils';

export const DocumentsSeed = <Document[]>[
  {
    id: 'document-hydrogen-production-1',
    description: 'Certificate for green hydrogen production',
    location: '/dead-path/green-h2-certificate.pdf',
    unitId: getElementOrThrowError(UnitsSeed, 0, 'Unit').id,
    processStepId: getElementOrThrowError(ProcessStepsHydrogenProductionSeed, 0, 'Process Step').id,
  },
];
