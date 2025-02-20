import { HydrogenGenerationUnit, Prisma } from '@prisma/client';

export const HydrogenGenerationUnits = <HydrogenGenerationUnit[]>[
  {
    id: 'hydrogen-generation-unit-production-site',
    ratedPower: new Prisma.Decimal(1000),
    electrolysisTypeName: 'AEL',
    generalInfoId: 'asset-hydrogen-generator',
  },
];
