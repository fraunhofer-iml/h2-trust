import { PowerProductionUnitDbType } from '..';
import { PowerProductionUnits } from '../../../seed';
import { BaseUnitDbTypeMock } from './base-unit-db-type.mock';

export const PowerProductionUnitDbTypeMock = <PowerProductionUnitDbType[]>[
  {
    ...BaseUnitDbTypeMock[0],
    powerProductionUnit: PowerProductionUnits[0],
  },
];
