import { HydrogenStorageUnit, Prisma } from '@prisma/client';
import { UnitSeed } from './unit.seed';

export const HydrogenStorageUnitSeed = <HydrogenStorageUnit[]>[
  {
    id: UnitSeed[5].id,
    capacity: new Prisma.Decimal(800),
  },
];
