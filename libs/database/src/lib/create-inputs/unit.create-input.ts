/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import {
  BaseUnitEntity,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionUnitEntity,
} from '@h2-trust/amqp';
import { assertDefined } from './util';

export function buildBaseUnitCreateInput(entity: BaseUnitEntity): Prisma.UnitCreateInput {
  assertDefined(entity.name, 'BaseUnitEntity.name');
  assertDefined(entity.mastrNumber, 'BaseUnitEntity.mastrNumber');
  assertDefined(entity.commissionedOn, 'BaseUnitEntity.commissionedOn');
  assertDefined(entity.address, 'BaseUnitEntity.address');
  assertDefined(entity.address.street, 'BaseUnitEntity.address.street');
  assertDefined(entity.address.postalCode, 'BaseUnitEntity.address.postalCode');
  assertDefined(entity.address.city, 'BaseUnitEntity.address.city');
  assertDefined(entity.address.state, 'BaseUnitEntity.address.state');
  assertDefined(entity.address.country, 'BaseUnitEntity.address.country');
  assertDefined(entity.company?.id, 'BaseUnitEntity.company.id');

  return Prisma.validator<Prisma.UnitCreateInput>()({
    name: entity.name,
    mastrNumber: entity.mastrNumber,
    manufacturer: entity.manufacturer,
    modelType: entity.modelType,
    modelNumber: entity.modelNumber,
    serialNumber: entity.serialNumber,
    certifiedBy: entity.certifiedBy,
    commissionedOn: entity.commissionedOn,
    address: {
      create: {
        street: entity.address.street,
        postalCode: entity.address.postalCode,
        city: entity.address.city,
        state: entity.address.state,
        country: entity.address.country,
      },
    },
    owner: {
      connect: { id: entity.company.id },
    },
    ...(entity.operator?.id && {
      operator: {
        connect: { id: entity.operator.id },
      },
    }),
  });
}

export function buildPowerProductionUnitCreateInput(entity: PowerProductionUnitEntity): Prisma.UnitCreateInput {
  assertDefined(entity.electricityMeterNumber, 'PowerProductionUnitEntity.electricityMeterNumber');
  assertDefined(entity.ratedPower, 'PowerProductionUnitEntity.ratedPower');
  assertDefined(entity.financialSupportReceived, 'PowerProductionUnitEntity.financialSupportReceived');
  assertDefined(entity.type?.name, 'PowerProductionUnitEntity.type');
  assertDefined(entity.gridLevel, 'PowerProductionUnitEntity.gridLevel');
  assertDefined(entity.biddingZone, 'PowerProductionUnitEntity.biddingZone');

  return Prisma.validator<Prisma.UnitCreateInput>()({
    ...buildBaseUnitCreateInput(entity),
    powerProductionUnit: {
      create: {
        decommissioningPlannedOn: entity.decommissioningPlannedOn,
        electricityMeterNumber: entity.electricityMeterNumber,
        ratedPower: new Prisma.Decimal(entity.ratedPower),
        gridOperator: entity.gridOperator,
        gridConnectionNumber: entity.gridConnectionNumber,
        financialSupportReceived: entity.financialSupportReceived,
        type: { connect: { name: entity.type.name } },
        gridLevel: entity.gridLevel,
        biddingZone: entity.biddingZone,
      },
    },
  });
}

export function buildHydrogenProductionUnitCreateInput(entity: HydrogenProductionUnitEntity): Prisma.UnitCreateInput {
  assertDefined(entity.biddingZone, 'HydrogenProductionUnitEntity.biddingZone');
  assertDefined(entity.method, 'HydrogenProductionUnitEntity.method');
  assertDefined(entity.technology, 'HydrogenProductionUnitEntity.technology');
  assertDefined(entity.ratedPower, 'HydrogenProductionUnitEntity.ratedPower');
  assertDefined(entity.pressure, 'HydrogenProductionUnitEntity.pressure');
  assertDefined(entity.waterConsumptionLitersPerHour, 'HydrogenProductionUnitEntity.waterConsumptionLitersPerHour');

  return Prisma.validator<Prisma.UnitCreateInput>()({
    ...buildBaseUnitCreateInput(entity),
    hydrogenProductionUnit: {
      create: {
        method: entity.method,
        technology: entity.technology,
        biddingZone: entity.biddingZone,
        ratedPower: new Prisma.Decimal(entity.ratedPower),
        pressure: new Prisma.Decimal(entity.pressure),
        waterConsumptionLitersPerHour: new Prisma.Decimal(entity.waterConsumptionLitersPerHour),
      },
    },
  });
}

export function buildHydrogenStorageUnitCreateInput(entity: HydrogenStorageUnitEntity): Prisma.UnitCreateInput {
  assertDefined(entity.type, 'HydrogenStorageUnitEntity.type');
  assertDefined(entity.capacity, 'HydrogenStorageUnitEntity.capacity');
  assertDefined(entity.pressure, 'HydrogenStorageUnitEntity.pressure');

  return Prisma.validator<Prisma.UnitCreateInput>()({
    ...buildBaseUnitCreateInput(entity),
    hydrogenStorageUnit: {
      create: {
        capacity: new Prisma.Decimal(entity.capacity),
        pressure: new Prisma.Decimal(entity.pressure),
        type: entity.type,
      },
    },
  });
}
