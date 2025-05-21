import { PowerProductionUnitDbType } from '..';
import { PowerProductionUnitsSeed } from '../../../seed';
import { BaseUnitDbTypeMock } from './base-unit-db-type.mock';

export const PowerProductionUnitDbTypeMock = <PowerProductionUnitDbType[]>[
  {
    ...BaseUnitDbTypeMock[0],
    powerProductionUnit: PowerProductionUnitsSeed[0],
  },
];
