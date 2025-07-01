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
    typeName: getElementOrThrowError(PowerProductionUnitTypesSeed, 1, 'Power Production Unit Type').name,
  },
  {
    id: getElementOrThrowError(UnitsSeed, 1, 'Unit').id,
    ratedPower: new Prisma.Decimal(3000),
    gridOperator: 'FluxDirect Energy Networks',
    gridLevel: 'Medium Voltage',
    gridConnectionNumber: 'GCN-2025-002',
    typeName: getElementOrThrowError(PowerProductionUnitTypesSeed, 3, 'Power Production Unit Type').name,
  },
  {
    id: getElementOrThrowError(UnitsSeed, 2, 'Unit').id,
    ratedPower: new Prisma.Decimal(3000),
    gridOperator: 'FluxDirect Energy Networks',
    gridLevel: 'Medium Voltage',
    gridConnectionNumber: 'GCN-2025-003',
    typeName: getElementOrThrowError(PowerProductionUnitTypesSeed, 5, 'Power Production Unit Type').name,
  },
  {
    id: getElementOrThrowError(UnitsSeed, 3, 'Unit').id,
    ratedPower: new Prisma.Decimal(3000),
    gridOperator: 'FluxDirect Energy Networks',
    gridLevel: 'Medium Voltage',
    gridConnectionNumber: 'GCN-2025-004',
    typeName: getElementOrThrowError(PowerProductionUnitTypesSeed, 6, 'Power Production Unit Type').name,
  },
];
