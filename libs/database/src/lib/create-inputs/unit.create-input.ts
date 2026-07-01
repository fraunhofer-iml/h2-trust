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
  CreateHydrogenBottlingUnitPayload,
  CreateHydrogenCompressorUnitPayload,
  CreateHydrogenEndUseUnitPayload,
  CreateHydrogenProductionUnitPayload,
  CreateHydrogenStorageUnitPayload,
  CreateHydrogenTransportUnitPayload,
  CreatePowerProductionUnitPayload,
} from '@h2-trust/contracts/payloads';
import { UnitType } from '@h2-trust/domain';

export function buildBaseUnitCreateInput(
  payload: BaseCreateUnitPayload,
  type: UnitType,
): Omit<Prisma.UnitCreateInput, 'details'> {
  return Prisma.validator<Omit<Prisma.UnitCreateInput, 'details'>>()({
    name: payload.name,
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
    type: type,
  });
}

export function buildPowerProductionUnitCreateInput(payload: CreatePowerProductionUnitPayload): Prisma.UnitCreateInput {
  return Prisma.validator<Prisma.UnitCreateInput>()({
    ...buildBaseUnitCreateInput(payload, UnitType.POWER_PRODUCTION),
    details: {
      create: {
        decommissioningPlannedOn: payload.decommissioningPlannedOn,
        ratedPower: new Prisma.Decimal(payload.ratedPower),
        financialSupportReceived: payload.financialSupportReceived,
        type: payload.powerProductionType,
        biddingZone: payload.biddingZone,
      },
    },
  });
}

export function buildHydrogenProductionUnitCreateInput(
  payload: CreateHydrogenProductionUnitPayload,
): Prisma.UnitCreateInput {
  return Prisma.validator<Prisma.UnitCreateInput>()({
    ...buildBaseUnitCreateInput(payload, UnitType.HYDROGEN_PRODUCTION),
    details: {
      create: {
        type: payload.hydrogenProductionType,
        technology: payload.technology,
        biddingZone: payload.biddingZone,
        ratedPower: new Prisma.Decimal(payload.ratedPower),
      },
    },
  });
}

export function buildHydrogenStorageUnitCreateInput(payload: CreateHydrogenStorageUnitPayload): Prisma.UnitCreateInput {
  return Prisma.validator<Prisma.UnitCreateInput>()({
    ...buildBaseUnitCreateInput(payload, UnitType.HYDROGEN_STORAGE),
    details: {
      create: {
        capacity: new Prisma.Decimal(payload.capacity),
        type: payload.type,
      },
    },
  });
}

export function buildHydrogenTransportUnitCreateInput(
  payload: CreateHydrogenTransportUnitPayload,
): Prisma.UnitCreateInput {
  return Prisma.validator<Prisma.UnitCreateInput>()({
    ...buildBaseUnitCreateInput(payload, UnitType.TRANSPORTATION),
    details: {
      create: {
        fuelType: payload.fuelType,
        type: payload.transportType,
      },
    },
  });
}

export function buildUnitCreateInputWitEmptyDetails(
  payload: CreateHydrogenCompressorUnitPayload | CreateHydrogenEndUseUnitPayload | CreateHydrogenBottlingUnitPayload,
  unitType: UnitType,
): Prisma.UnitCreateInput {
  return Prisma.validator<Prisma.UnitCreateInput>()({
    ...buildBaseUnitCreateInput(payload, unitType),
    details: {
      create: {},
    },
  });
}
