import { Document } from '@prisma/client';

export const Documents = <Document[]>[
  {
    id: 'document-hydrogen-generation',
    description: 'Certificate for green hydrogen production',
    location: '/dead-path/green-h2-certificate.pdf',
    assetId: 'asset-hydrogen-generator',
    processStepId: 'processstep-hydrogen-generation',
  }
];
