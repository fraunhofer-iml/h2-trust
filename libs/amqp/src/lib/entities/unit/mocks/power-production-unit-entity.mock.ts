/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AddressSeed, CompanySeed, PowerProductionUnitSeed, UnitSeed } from 'libs/database/src/seed';
import { BiddingZone, GridLevel, UnitType } from '@h2-trust/domain';
import { AddressEntityPowerMock } from '../../address';
import { CompanyEntityPowerMock } from '../../company';
import { PowerProductionUnitEntity } from '../power-production-unit.entity';
import { PowerProductionTypeEntityMock } from './power-production-type-entity.mock';

export const PowerProductionUnitEntityMock: PowerProductionUnitEntity[] = [
  new PowerProductionUnitEntity(
    PowerProductionUnitSeed[0].id,
    UnitSeed[0].name,
    UnitSeed[0].mastrNumber,
    UnitSeed[0].manufacturer!,
    UnitSeed[0].modelType!,
    UnitSeed[0].modelNumber!,
    UnitSeed[0].serialNumber!,
    UnitSeed[0].certifiedBy!,
    new Date(UnitSeed[0].commissionedOn),
    AddressEntityPowerMock,
    {
      id: CompanySeed[2].id!,
      name: CompanySeed[2].name,
      mastrNumber: CompanySeed[2].mastrNumber,
      type: CompanySeed[2].type,
      address: {
        street: AddressSeed[2].street,
        postalCode: AddressSeed[2].postalCode,
        city: AddressSeed[2].city,
        state: AddressSeed[2].state,
        country: AddressSeed[2].country,
      },
      users: [],
      hydrogenApprovals: [],
    },
    CompanyEntityPowerMock,
    UnitType.POWER_PRODUCTION,
    new Date(PowerProductionUnitSeed[0].decommissioningPlannedOn!),
    PowerProductionUnitSeed[0].electricityMeterNumber,
    PowerProductionUnitSeed[0].ratedPower.toNumber(),
    PowerProductionUnitSeed[0].gridOperator!,
    PowerProductionUnitSeed[0].gridLevel as GridLevel,
    PowerProductionUnitSeed[0].biddingZone as BiddingZone,
    PowerProductionUnitSeed[0].gridConnectionNumber!,
    PowerProductionUnitSeed[0].financialSupportReceived,
    PowerProductionTypeEntityMock[1],
  ),
];
