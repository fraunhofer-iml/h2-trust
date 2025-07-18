import { PowerProductionUnit, Prisma } from '@prisma/client';
import { PowerProductionUnitTypeSeed } from './power-production-unit-type.seed';
import { UnitSeed } from './unit.seed';

export const PowerProductionUnitSeed = <PowerProductionUnit[]>[
  {
    id: UnitSeed[0].id,
    ratedPower: new Prisma.Decimal(3000),
    gridOperator: 'GreenGrid Operator Inc.',
    gridLevel: 'Medium Voltage',
    gridConnectionNumber: 'GCN-2025-001',
    typeName: PowerProductionUnitTypeSeed[1].name,
  },
  {
    id: UnitSeed[1].id,
    ratedPower: new Prisma.Decimal(3000),
    gridOperator: 'FluxDirect Energy Networks',
    gridLevel: 'Medium Voltage',
    gridConnectionNumber: 'GCN-2025-002',
    typeName: PowerProductionUnitTypeSeed[3].name,
  },
  {
    id: UnitSeed[2].id,
    ratedPower: new Prisma.Decimal(3000),
    gridOperator: 'FluxDirect Energy Networks',
    gridLevel: 'Medium Voltage',
    gridConnectionNumber: 'GCN-2025-003',
    typeName: PowerProductionUnitTypeSeed[5].name,
  },
  {
    id: UnitSeed[3].id,
    ratedPower: new Prisma.Decimal(3000),
    gridOperator: 'FluxDirect Energy Networks',
    gridLevel: 'Medium Voltage',
    gridConnectionNumber: 'GCN-2025-004',
    typeName: PowerProductionUnitTypeSeed[6].name,
  },
];
