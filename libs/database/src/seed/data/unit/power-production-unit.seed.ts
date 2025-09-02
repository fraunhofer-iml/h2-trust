import { PowerProductionUnit, Prisma } from '@prisma/client';
import { PowerProductionTypeSeed } from './power-production-type.seed';
import { UnitSeed } from './unit.seed';
import { CompanySeed } from '../company.seed';
import { GridLevelSeed } from './grid-level.seed';
import { BiddingZoneSeed } from './bidding-zone.seed';

export const PowerProductionUnitSeed = <PowerProductionUnit[]>[
  {
    id: UnitSeed[0].id,
    decommissioningPlannedOn: new Date('2045-04-01'),
    electricityMeterNumber: "EMN-2025-001",
    ratedPower: new Prisma.Decimal(3000),
    gridOperator: 'GreenGrid Operator Inc.',
    gridLevelName: GridLevelSeed[1].name,
    biddingZoneName: BiddingZoneSeed[1].name,
    gridConnectionNumber: 'GCN-2025-001',
    typeName: PowerProductionTypeSeed[1].name,
  },
  {
    id: UnitSeed[1].id,
    decommissioningPlannedOn: new Date('2043-06-15'),
    electricityMeterNumber: "EMN-2025-002",
    ratedPower: new Prisma.Decimal(3000),
    gridOperator: 'FluxDirect Energy Networks',
    gridLevelName: GridLevelSeed[2].name,
    biddingZoneName: BiddingZoneSeed[2].name,
    gridConnectionNumber: 'GCN-2025-002',
    typeName: PowerProductionTypeSeed[3].name,
  },
  {
    id: UnitSeed[2].id,
    decommissioningPlannedOn: new Date('2040-09-01'),
    electricityMeterNumber: "EMN-2025-003",
    ratedPower: new Prisma.Decimal(3000),
    gridOperator: 'FluxDirect Energy Networks',
    gridLevelName: GridLevelSeed[3].name,
    biddingZoneName: BiddingZoneSeed[3].name,
    gridConnectionNumber: 'GCN-2025-003',
    typeName: PowerProductionTypeSeed[5].name,
  },
  {
    id: UnitSeed[3].id,
    decommissioningPlannedOn: new Date('2035-03-20'),
    electricityMeterNumber: "EMN-2025-004",
    ratedPower: new Prisma.Decimal(3000),
    gridOperator: 'FluxDirect Energy Networks',
    gridLevelName: GridLevelSeed[3].name,
    biddingZoneName: BiddingZoneSeed[4].name,
    gridConnectionNumber: 'GCN-2025-004',
    typeName: PowerProductionTypeSeed[6].name,
  },
  {
    id: UnitSeed[7].id,
    decommissioningPlannedOn: new Date('2045-08-14'),
    electricityMeterNumber: "EMN-2025-005",
    ratedPower: new Prisma.Decimal(100000),
    gridOperator: CompanySeed[3].name,
    gridLevelName: GridLevelSeed[0].name,
    biddingZoneName: BiddingZoneSeed[5].name,
    gridConnectionNumber: 'GRID-2025-01',
    typeName: PowerProductionTypeSeed[11].name,
  },
];
