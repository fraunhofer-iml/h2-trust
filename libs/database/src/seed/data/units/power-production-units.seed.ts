import { PowerProductionUnit, Prisma } from '@prisma/client';
import { getElementOrThrowError } from '../utils';
import { PowerProductionUnitTypesSeed } from './power-production-unit-types.seed';
import { UnitsSeed } from './units.seed';

export const PowerProductionUnitsSeed = <PowerProductionUnit[]>[
  {
    id: getElementOrThrowError(UnitsSeed, 0, 'Unit').id,
    ratedPower: new Prisma.Decimal(3000),
    gridOperator: 'GreenGrid Operator Inc.',
    gridLevel: 'Medium Voltage',
    gridConnectionNumber: 'GCN-2025-001',
    typeName: getElementOrThrowError(PowerProductionUnitTypesSeed, 0, 'Power Production Unit Type').name,
  },
];
