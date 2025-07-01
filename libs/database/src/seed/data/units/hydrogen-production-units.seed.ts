import { HydrogenProductionUnit, Prisma } from '@prisma/client';
import { getElementOrThrowError } from '../utils';
import { ElectrolysisTypesSeed } from './electrolysis-types.seed';
import { HydrogenStorageUnitsSeed } from './hydrogen-storage-units.seed';
import { UnitsSeed } from './units.seed';

export const HydrogenProductionUnitsSeed = <HydrogenProductionUnit[]>[
  {
    id: getElementOrThrowError(UnitsSeed, 4, 'Unit').id,
    ratedPower: new Prisma.Decimal(1000),
    typeName: getElementOrThrowError(ElectrolysisTypesSeed, 0, 'Electrolysis Type').name,
    hydrogenStorageUnitId: getElementOrThrowError(HydrogenStorageUnitsSeed, 0, 'Hydrogen Storage Unit').id,
  },
];
