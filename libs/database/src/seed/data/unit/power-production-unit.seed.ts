/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionUnit, Prisma } from '@prisma/client';
import { BiddingZone, GridLevel } from '@h2-trust/domain';
import { PowerProductionTypeSeed } from './power-production-type.seed';
import { UnitSeed } from './unit.seed';

export const PowerProductionUnitSeed: readonly PowerProductionUnit[] = Object.freeze([
  {
    id: UnitSeed[0].id,
    electricityMeterNumber: '123456789012',
    gridOperator: 'Powernetz GmbH',
    gridConnectionNumber: 'DE0012345678901234',
    gridLevel: GridLevel.LOW_VOLTAGE,
    biddingZone: BiddingZone.DE_LU,
    ratedPower: new Prisma.Decimal(4.5),
    decommissioningPlannedOn: new Date('2045-04-01'),
    financialSupportReceived: false,
    typeName: PowerProductionTypeSeed[0].name,
  },
  {
    id: UnitSeed[1].id,
    electricityMeterNumber: 'EMN-2025-002',
    gridOperator: 'FluxDirect Energy Networks',
    gridConnectionNumber: 'GCN-2025-002',
    gridLevel: GridLevel.MEDIUM_VOLTAGE,
    biddingZone: BiddingZone.FR,
    ratedPower: new Prisma.Decimal(1500),
    decommissioningPlannedOn: new Date('2043-06-15'),
    financialSupportReceived: true,
    typeName: PowerProductionTypeSeed[1].name,
  },
  {
    id: UnitSeed[2].id,
    electricityMeterNumber: 'EMN-2025-003',
    gridOperator: 'FluxDirect Energy Networks',
    gridConnectionNumber: 'GCN-2025-003',
    gridLevel: GridLevel.MEDIUM_VOLTAGE,
    biddingZone: BiddingZone.NL,
    ratedPower: new Prisma.Decimal(3000),
    decommissioningPlannedOn: new Date('2040-09-01'),
    financialSupportReceived: false,
    typeName: PowerProductionTypeSeed[2].name,
  },
  {
    id: UnitSeed[3].id,
    electricityMeterNumber: 'EMN-2025-004',
    gridOperator: 'FluxDirect Energy Networks',
    gridConnectionNumber: 'GRID-2025-004',
    gridLevel: GridLevel.EXTRA_HIGH_VOLTAGE,
    biddingZone: BiddingZone.CZ,
    ratedPower: new Prisma.Decimal(100000),
    decommissioningPlannedOn: new Date('2045-08-14'),
    financialSupportReceived: true,
    typeName: PowerProductionTypeSeed[3].name,
  },
]);
