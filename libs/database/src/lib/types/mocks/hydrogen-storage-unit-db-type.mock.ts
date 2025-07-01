import { HydrogenStorageUnitDbType } from '..';
import { BatchesSeed, HydrogenProductionUnitsSeed, HydrogenStorageUnitsSeed, UnitsSeed } from '../../../seed';
import { BaseUnitDbTypeMock } from './base-unit-db-type.mock';

export const HydrogenStorageUnitDbTypeMock = <HydrogenStorageUnitDbType[]>[
  {
    ...BaseUnitDbTypeMock[0],
    hydrogenStorageUnit: {
      ...HydrogenStorageUnitsSeed[0],
      filling: [BatchesSeed[1]],
      hydrogenProductionUnits: [
        {
          ...HydrogenProductionUnitsSeed[0],
          generalInfo: UnitsSeed[4],
        },
      ],
    },
  },
];
