import { HydrogenStorageUnit, Prisma } from '@prisma/client';
import { getElementOrThrowError } from '../utils';
import { UnitsSeed } from './units.seed';

export const HydrogenStorageUnitsSeed = <HydrogenStorageUnit[]>[
  {
    id: getElementOrThrowError(UnitsSeed, 5, 'Unit').id,
    capacity: new Prisma.Decimal(800),
  },
];
