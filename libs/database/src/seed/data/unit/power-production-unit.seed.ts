/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionUnit, Prisma } from '@prisma/client';
import { BiddingZone, GridLevel } from '@h2-trust/domain';
import { CompanySeed } from '../company.seed';
import { PowerProductionTypeSeed } from './power-production-type.seed';
import { UnitSeed } from './unit.seed';

export const PowerProductionUnitSeed = <PowerProductionUnit[]>[
  {
    id: UnitSeed[0].id,
    electricityMeterNumber: 'EMN-2025-001',
    gridOperator: 'GreenGrid Operator Inc.',
    gridConnectionNumber: 'GCN-2025-001',
    gridLevel: GridLevel.HIGH_VOLTAGE,
    biddingZone: BiddingZone.BE,
    ratedPower: new Prisma.Decimal(3000),
    decommissioningPlannedOn: new Date('2045-04-01'),
    typeName: PowerProductionTypeSeed[1].name,
  },
  {
    id: UnitSeed[1].id,
    electricityMeterNumber: 'EMN-2025-002',
    gridOperator: 'FluxDirect Energy Networks',
    gridConnectionNumber: 'GCN-2025-002',
    gridLevel: GridLevel.MEDIUM_VOLTAGE,
    biddingZone: BiddingZone.FR,
    ratedPower: new Prisma.Decimal(3000),
    decommissioningPlannedOn: new Date('2043-06-15'),
    typeName: PowerProductionTypeSeed[3].name,
  },
  {
    id: UnitSeed[2].id,
    electricityMeterNumber: 'EMN-2025-003',
    gridOperator: 'FluxDirect Energy Networks',
    gridConnectionNumber: 'GCN-2025-003',
    gridLevel: GridLevel.LOW_VOLTAGE,
    biddingZone: BiddingZone.NL,
    ratedPower: new Prisma.Decimal(3000),
    decommissioningPlannedOn: new Date('2040-09-01'),
    typeName: PowerProductionTypeSeed[5].name,
  },
  {
    id: UnitSeed[3].id,
    electricityMeterNumber: 'EMN-2025-004',
    gridOperator: 'FluxDirect Energy Networks',
    gridConnectionNumber: 'GCN-2025-004',
    gridLevel: GridLevel.LOW_VOLTAGE,
    biddingZone: BiddingZone.PL,
    ratedPower: new Prisma.Decimal(3000),
    decommissioningPlannedOn: new Date('2035-03-20'),
    typeName: PowerProductionTypeSeed[6].name,
  },
  {
    id: UnitSeed[7].id,
    electricityMeterNumber: 'EMN-2025-005',
    gridOperator: CompanySeed[3].name,
    gridConnectionNumber: 'GRID-2025-01',
    gridLevel: GridLevel.EXTRA_HIGH_VOLTAGE,
    biddingZone: BiddingZone.CZ,
    ratedPower: new Prisma.Decimal(100000),
    decommissioningPlannedOn: new Date('2045-08-14'),
    typeName: PowerProductionTypeSeed[11].name,
  },
];
