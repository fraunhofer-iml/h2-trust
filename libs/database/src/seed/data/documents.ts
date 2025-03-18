import { Document } from '@prisma/client';

export const Documents = <Document[]>[
  {
    id: 'document-hydrogen-production-1',
    description: 'Certificate for green hydrogen production',
    location: '/dead-path/green-h2-certificate.pdf',
    unitId: 'hydrogen-production-unit-1',
    processStepId: 'process-step-hydrogen-production-1',
  },
];
