import { HydrogenStorageUnitDbType } from '..';
import { Batches, HydrogenProductionUnits, HydrogenStorageUnits, Units } from '../../../seed';
import { BaseUnitDbTypeMock } from './base-unit-db-type.mock';

export const HydrogenStorageUnitDbTypeMock = <HydrogenStorageUnitDbType[]>[
  {
    ...BaseUnitDbTypeMock[0],
    hydrogenStorageUnit: {
      ...HydrogenStorageUnits[0],
      filling: [Batches[1]],
      hydrogenProductionUnits: [
        {
          ...HydrogenProductionUnits[0],
          generalInfo: Units[1],
        },
      ],
    },
  },
];
