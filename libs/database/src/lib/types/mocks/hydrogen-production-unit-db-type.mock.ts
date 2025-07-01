import { HydrogenProductionUnitDbType } from '..';
import { HydrogenProductionUnitsSeed, HydrogenStorageUnitsSeed, UnitsSeed } from '../../../seed';
import { BaseUnitDbTypeMock } from './base-unit-db-type.mock';

export const HydrogenProductionUnitDbTypeMock = <HydrogenProductionUnitDbType[]>[
  {
    ...BaseUnitDbTypeMock[0],
    hydrogenProductionUnit: {
      ...HydrogenProductionUnitsSeed[0],
      hydrogenStorageUnit: {
        ...HydrogenStorageUnitsSeed[0],
        generalInfo: UnitsSeed[5],
      },
    },
  },
];
