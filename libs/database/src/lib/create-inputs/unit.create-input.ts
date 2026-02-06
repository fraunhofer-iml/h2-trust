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

export function buildBaseUnitCreateInput(payload: BaseCreateUnitPayload): Prisma.UnitCreateInput {
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
      connect: { id: payload.ownerId },
    },
    operator: {
      connect: { id: payload.operatorId },
    },
  });
}

export function buildPowerProductionUnitCreateInput(payload: CreatePowerProductionUnitPayload): Prisma.UnitCreateInput {
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
