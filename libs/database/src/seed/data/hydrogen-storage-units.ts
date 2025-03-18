import { HydrogenStorageUnit, Prisma } from '@prisma/client';

export const HydrogenStorageUnits = <HydrogenStorageUnit[]>[
  {
    id: 'hydrogen-storage-unit-1',
    capacity: new Prisma.Decimal(10000),
  },
];
