import { HydrogenProductionUnitDbType } from '..';
import { HydrogenProductionUnits, HydrogenStorageUnits, Units } from '../../../seed';
import { BaseUnitDbTypeMock } from './base-unit-db-type.mock';

export const HydrogenProductionUnitDbTypeMock = <HydrogenProductionUnitDbType[]>[
  {
    ...BaseUnitDbTypeMock[0],
    hydrogenProductionUnit: {
      ...HydrogenProductionUnits[0],
      hydrogenStorageUnit: {
        ...HydrogenStorageUnits[0],
        generalInfo: Units[2],
      },
    },
  },
];
