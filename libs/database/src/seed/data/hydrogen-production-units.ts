import { HydrogenProductionUnit, Prisma } from '@prisma/client';

export const HydrogenProductionUnits = <HydrogenProductionUnit[]>[
  {
    id: 'hydrogen-production-unit-1',
    ratedPower: new Prisma.Decimal(1000),
    typeName: 'AEL',
    hydrogenStorageUnitId: 'hydrogen-storage-unit-1',
  },
];
