import { HydrogenStorageUnit, Prisma } from '@prisma/client';
import { HydrogenStorageTypeSeed } from './hydrogen-storage-type.seed';
import { UnitSeed } from './unit.seed';

export const HydrogenStorageUnitSeed = <HydrogenStorageUnit[]>[
  {
    id: UnitSeed[5].id,
    capacity: new Prisma.Decimal(800),
    pressure: new Prisma.Decimal(5),
    typeName: HydrogenStorageTypeSeed[0].name,
  },
];
