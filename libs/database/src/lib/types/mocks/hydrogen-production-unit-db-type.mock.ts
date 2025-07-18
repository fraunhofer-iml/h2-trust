import { HydrogenProductionUnitDbType } from '..';
import { HydrogenProductionUnitSeed, HydrogenStorageUnitSeed, UnitSeed } from '../../../seed';
import { BaseUnitDbTypeMock } from './base-unit-db-type.mock';

export const HydrogenProductionUnitDbTypeMock = <HydrogenProductionUnitDbType[]>[
  {
    ...BaseUnitDbTypeMock[0],
    hydrogenProductionUnit: {
      ...HydrogenProductionUnitSeed[0],
      hydrogenStorageUnit: {
        ...HydrogenStorageUnitSeed[0],
        generalInfo: UnitSeed[5],
      },
    },
  },
];
