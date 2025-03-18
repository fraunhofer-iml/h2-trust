import { PowerProductionUnit, Prisma } from '@prisma/client';

export const PowerProductionUnits = <PowerProductionUnit[]>[
  {
    id: 'power-production-unit-1',
    ratedPower: new Prisma.Decimal(3000),
    gridOperator: 'GreenGrid Operator Inc.',
    gridLevel: 'Medium Voltage',
    gridConnectionNumber: 'GCN-2025-001',
    typeName: 'WIND_TURBINE',
  },
];
