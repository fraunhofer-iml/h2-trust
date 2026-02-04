/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnitSeed, UnitSeed } from 'libs/database/src/seed';
import { BiddingZone, HydrogenProductionMethod, HydrogenProductionTechnology, UnitType } from '@h2-trust/domain';
import { CompanyEntityHydrogenMock } from '../..';
import { AddressEntityPowerMock } from '../../address';
import { HydrogenProductionUnitEntity } from '../hydrogen-production-unit.entity';

export const HydrogenProductionUnitEntityMock: HydrogenProductionUnitEntity[] = [
  new HydrogenProductionUnitEntity(
    HydrogenProductionUnitSeed[0].id,
    UnitSeed[0].name,
    UnitSeed[0].mastrNumber,
    UnitSeed[0].manufacturer!,
    UnitSeed[0].modelType!,
    UnitSeed[0].modelNumber!,
    UnitSeed[0].serialNumber!,
    UnitSeed[0].certifiedBy!,
    new Date(UnitSeed[0].commissionedOn),
    AddressEntityPowerMock,
    CompanyEntityHydrogenMock,
    CompanyEntityHydrogenMock,
    UnitType.HYDROGEN_PRODUCTION,
    HydrogenProductionUnitSeed[0].ratedPower.toNumber(),
    HydrogenProductionUnitSeed[0].pressure.toNumber(),
    HydrogenProductionUnitSeed[0].method as HydrogenProductionMethod,
    HydrogenProductionUnitSeed[0].technology as HydrogenProductionTechnology,
    HydrogenProductionUnitSeed[0].biddingZone as BiddingZone,
    HydrogenProductionUnitSeed[0].waterConsumptionLitersPerHour.toNumber(),
  ),
];
