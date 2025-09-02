import { HydrogenProductionUnit, Prisma } from '@prisma/client';
import { HydrogenProductionTypeSeed } from './hydrogen-production-type.seed';
import { HydrogenStorageUnitSeed } from './hydrogen-storage-unit.seed';
import { UnitSeed } from './unit.seed';
import { BiddingZoneSeed } from './bidding-zone.seed';

export const HydrogenProductionUnitSeed = <HydrogenProductionUnit[]>[
  {
    id: UnitSeed[4].id,
    ratedPower: new Prisma.Decimal(1000),
    pressure: new Prisma.Decimal(10),
    typeId: HydrogenProductionTypeSeed[0].id,
    biddingZoneName: BiddingZoneSeed[0].name,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
];
