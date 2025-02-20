import { PowerGenerationUnit, Prisma } from '@prisma/client';

export const PowerGenerationUnits = <PowerGenerationUnit[]>[
  {
    id: 'power-generation-unit-onshore-wind_turbine',
    ratedPower: new Prisma.Decimal(3000),
    gridOperator: 'GreenGrid Operator Inc.',
    gridLevel: 'Medium Voltage',
    gridConnectionNumber: 'GCN-2025-001',
    energyTypeName: 'ONSHORE_WIND_TURBINE',
    generalInfoId: 'asset-power-onshore-wind-turbine',
  },
];
