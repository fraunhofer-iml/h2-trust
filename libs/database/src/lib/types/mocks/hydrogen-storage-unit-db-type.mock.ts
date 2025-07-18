import { HydrogenStorageUnitDbType } from '..';
import {
  BatchHydrogenProducedSeed,
  HydrogenProductionUnitSeed,
  HydrogenStorageUnitSeed,
  UnitSeed,
} from '../../../seed';
import { BaseUnitDbTypeMock } from './base-unit-db-type.mock';

export const HydrogenStorageUnitDbTypeMock = <HydrogenStorageUnitDbType[]>[
  {
    ...BaseUnitDbTypeMock[0],
    hydrogenStorageUnit: {
      ...HydrogenStorageUnitSeed[0],
      filling: [BatchHydrogenProducedSeed[0]],
      hydrogenProductionUnits: [
        {
          ...HydrogenProductionUnitSeed[0],
          generalInfo: UnitSeed[4],
        },
      ],
    },
  },
];
