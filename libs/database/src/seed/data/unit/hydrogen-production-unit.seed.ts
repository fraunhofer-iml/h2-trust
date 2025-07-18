import { HydrogenProductionUnit, Prisma } from '@prisma/client';
import { ElectrolysisTypeSeed } from './electrolysis-type.seed';
import { HydrogenStorageUnitSeed } from './hydrogen-storage-unit.seed';
import { UnitSeed } from './unit.seed';

export const HydrogenProductionUnitSeed = <HydrogenProductionUnit[]>[
  {
    id: UnitSeed[4].id,
    ratedPower: new Prisma.Decimal(1000),
    typeName: ElectrolysisTypeSeed[0].name,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
];
