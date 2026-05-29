/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnitDto } from '@h2-trust/contracts/dtos';
import { BiddingZone, HydrogenProductionTechnology, HydrogenProductionType, UnitType } from '@h2-trust/domain';
import { BaseUnitDtoFixture } from './base-unit.fixture';

export const HydrogenProductionUnitDtoFixture = {
  create: (overrides: Partial<HydrogenProductionUnitDto> = {}): HydrogenProductionUnitDto => ({
    ...BaseUnitDtoFixture.create({
      id: overrides.id,
      name: overrides.name,
      mastrNumber: overrides.mastrNumber,
      manufacturer: overrides.manufacturer,
      modelType: overrides.modelType,
      modelNumber: overrides.modelNumber,
      serialNumber: overrides.serialNumber,
      certifiedBy: overrides.certifiedBy,
      commissionedOn: overrides.commissionedOn,
      address: overrides.address,
      owner: overrides.owner,
      operator: overrides.operator,
      unitType: overrides.unitType ?? UnitType.HYDROGEN_PRODUCTION,
      active: overrides.active,
    }),
    method: overrides.method ?? HydrogenProductionType.ELECTROLYSIS,
    technology: overrides.technology ?? HydrogenProductionTechnology.PEM,
    biddingZone: overrides.biddingZone ?? BiddingZone.DE_LU,
    ratedPower: overrides.ratedPower ?? 50,
    pressure: overrides.pressure ?? 30,
    waterConsumptionLitersPerHour: overrides.waterConsumptionLitersPerHour ?? 100,
  }),
} as const;
