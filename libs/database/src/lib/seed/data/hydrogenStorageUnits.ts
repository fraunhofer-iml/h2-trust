import { HydrogenStorageUnit, Prisma } from '@prisma/client';

export const HydrogenStorageUnits = <HydrogenStorageUnit[]>[
  {
    id: 'hydrogen-storage-unit-production-site',
    capacity: new Prisma.Decimal(10000),
    generalInfoId: 'asset-hydrogen-storage-unit',
  },
];
