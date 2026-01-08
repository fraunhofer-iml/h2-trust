/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import {
  BaseCreateUnitPayload,
  CreateHydrogenProductionUnitPayload,
  CreateHydrogenStorageUnitPayload,
  CreatePowerProductionUnitPayload,
} from '@h2-trust/amqp';
import { assertDefined } from '@h2-trust/utils';

export function buildBaseUnitCreateInput(payload: BaseCreateUnitPayload): Prisma.UnitCreateInput {
  assertDefined(payload.name, 'BaseCreateUnitPayload.name');
  assertDefined(payload.mastrNumber, 'BaseCreateUnitPayload.mastrNumber');
  assertDefined(payload.commissionedOn, 'BaseCreateUnitPayload.commissionedOn');
  assertDefined(payload.address, 'BaseCreateUnitPayload.address');
  assertDefined(payload.address.street, 'BaseCreateUnitPayload.address.street');
  assertDefined(payload.address.postalCode, 'BaseCreateUnitPayload.address.postalCode');
  assertDefined(payload.address.city, 'BaseCreateUnitPayload.address.city');
  assertDefined(payload.address.state, 'BaseCreateUnitPayload.address.state');
  assertDefined(payload.address.country, 'BaseCreateUnitPayload.address.country');
  assertDefined(payload.companyId, 'BaseCreateUnitPayload.companyId');

  return Prisma.validator<Prisma.UnitCreateInput>()({
    name: payload.name,
    mastrNumber: payload.mastrNumber,
    manufacturer: payload.manufacturer,
    modelType: payload.modelType,
    modelNumber: payload.modelNumber,
    serialNumber: payload.serialNumber,
    certifiedBy: payload.certifiedBy,
    commissionedOn: payload.commissionedOn,
    address: {
      create: {
        street: payload.address.street,
        postalCode: payload.address.postalCode,
        city: payload.address.city,
        state: payload.address.state,
        country: payload.address.country,
      },
    },
    owner: {
      connect: { id: payload.companyId },
    },
    ...(payload.operatorId && {
      operator: {
        connect: { id: payload.operatorId },
      },
    }),
  });
}

export function buildPowerProductionUnitCreateInput(payload: CreatePowerProductionUnitPayload): Prisma.UnitCreateInput {
  assertDefined(payload.electricityMeterNumber, 'CreatePowerProductionUnitPayload.electricityMeterNumber');
  assertDefined(payload.ratedPower, 'CreatePowerProductionUnitPayload.ratedPower');
  assertDefined(payload.financialSupportReceived, 'CreatePowerProductionUnitPayload.financialSupportReceived');
  assertDefined(payload.powerProductionType, 'CreatePowerProductionUnitPayload.powerProductionType');
  assertDefined(payload.gridLevel, 'CreatePowerProductionUnitPayload.gridLevel');
  assertDefined(payload.biddingZone, 'CreatePowerProductionUnitPayload.biddingZone');

  return Prisma.validator<Prisma.UnitCreateInput>()({
    ...buildBaseUnitCreateInput(payload),
    powerProductionUnit: {
      create: {
        decommissioningPlannedOn: payload.decommissioningPlannedOn,
        electricityMeterNumber: payload.electricityMeterNumber,
        ratedPower: new Prisma.Decimal(payload.ratedPower),
        gridOperator: payload.gridOperator,
        gridConnectionNumber: payload.gridConnectionNumber,
        financialSupportReceived: payload.financialSupportReceived,
        type: { connect: { name: payload.powerProductionType } },
        gridLevel: payload.gridLevel,
        biddingZone: payload.biddingZone,
      },
    },
  });
}

export function buildHydrogenProductionUnitCreateInput(
  payload: CreateHydrogenProductionUnitPayload,
): Prisma.UnitCreateInput {
  assertDefined(payload.biddingZone, 'CreateHydrogenProductionUnitPayload.biddingZone');
  assertDefined(payload.method, 'CreateHydrogenProductionUnitPayload.method');
  assertDefined(payload.technology, 'CreateHydrogenProductionUnitPayload.technology');
  assertDefined(payload.ratedPower, 'CreateHydrogenProductionUnitPayload.ratedPower');
  assertDefined(payload.pressure, 'CreateHydrogenProductionUnitPayload.pressure');
  assertDefined(
    payload.waterConsumptionLitersPerHour,
    'CreateHydrogenProductionUnitPayload.waterConsumptionLitersPerHour',
  );

  return Prisma.validator<Prisma.UnitCreateInput>()({
    ...buildBaseUnitCreateInput(payload),
    hydrogenProductionUnit: {
      create: {
        method: payload.method,
        technology: payload.technology,
        biddingZone: payload.biddingZone,
        ratedPower: new Prisma.Decimal(payload.ratedPower),
        pressure: new Prisma.Decimal(payload.pressure),
        waterConsumptionLitersPerHour: new Prisma.Decimal(payload.waterConsumptionLitersPerHour),
      },
    },
  });
}

export function buildHydrogenStorageUnitCreateInput(payload: CreateHydrogenStorageUnitPayload): Prisma.UnitCreateInput {
  assertDefined(payload.storageType, 'CreateHydrogenStorageUnitPayload.storageType');
  assertDefined(payload.capacity, 'CreateHydrogenStorageUnitPayload.capacity');
  assertDefined(payload.pressure, 'CreateHydrogenStorageUnitPayload.pressure');

  return Prisma.validator<Prisma.UnitCreateInput>()({
    ...buildBaseUnitCreateInput(payload),
    hydrogenStorageUnit: {
      create: {
        capacity: new Prisma.Decimal(payload.capacity),
        pressure: new Prisma.Decimal(payload.pressure),
        type: payload.storageType,
      },
    },
  });
}
