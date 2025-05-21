import { PowerProductionUnit, Prisma } from '@prisma/client';
import { PowerProductionUnitTypesSeed } from './power-production-unit-types.seed';
import { UnitsSeed } from './units.seed';

export const PowerProductionUnitsSeed = <PowerProductionUnit[]>[
  {
    id: UnitsSeed[0].id,
    ratedPower: new Prisma.Decimal(3000),
    gridOperator: 'GreenGrid Operator Inc.',
    gridLevel: 'Medium Voltage',
    gridConnectionNumber: 'GCN-2025-001',
    typeName: PowerProductionUnitTypesSeed[0].name,
  },
];
