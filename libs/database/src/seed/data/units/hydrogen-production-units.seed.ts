import { HydrogenProductionUnit, Prisma } from '@prisma/client';
import { ElectrolysisTypesSeed } from './electrolysis-types.seed';
import { HydrogenStorageUnitsSeed } from './hydrogen-storage-units.seed';
import { UnitsSeed } from './units.seed';

export const HydrogenProductionUnitsSeed = <HydrogenProductionUnit[]>[
  {
    id: UnitsSeed[1].id,
    ratedPower: new Prisma.Decimal(1000),
    typeName: ElectrolysisTypesSeed[0].name,
    hydrogenStorageUnitId: HydrogenStorageUnitsSeed[0].id,
  },
];
