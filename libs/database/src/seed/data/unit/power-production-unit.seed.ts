import { PowerProductionUnit, Prisma } from '@prisma/client';
import { PowerProductionUnitTypeSeed } from './power-production-unit-type.seed';
import { UnitSeed } from './unit.seed';
import { CompanySeed } from '../company.seed';

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
  {
    id: UnitSeed[7].id,
    ratedPower: new Prisma.Decimal(100000),
    gridOperator: CompanySeed[3].name,
    gridLevel: 'High Voltage',
    gridConnectionNumber: 'GRID-2025-01',
    typeName: PowerProductionUnitTypeSeed[11].name,
  },
];
