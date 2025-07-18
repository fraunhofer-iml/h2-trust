import { PowerProductionUnitDbType } from '..';
import { PowerProductionUnitSeed } from '../../../seed';
import { BaseUnitDbTypeMock } from './base-unit-db-type.mock';

export const PowerProductionUnitDbTypeMock = <PowerProductionUnitDbType[]>[
  {
    ...BaseUnitDbTypeMock[0],
    powerProductionUnit: PowerProductionUnitSeed[0],
  },
];
