import { HydrogenStorageUnit, Prisma } from '@prisma/client';
import { UnitsSeed } from './units.seed';

export const HydrogenStorageUnitsSeed = <HydrogenStorageUnit[]>[
  {
    id: UnitsSeed[2].id,
    capacity: new Prisma.Decimal(10000),
  },
];
