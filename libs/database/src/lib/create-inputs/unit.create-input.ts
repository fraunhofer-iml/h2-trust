/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  BaseUnitEntity,
  BrokerException,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionUnitEntity,
} from '@h2-trust/amqp';

export function buildBaseUnitCreateInput(entity: BaseUnitEntity): Prisma.UnitCreateInput {
  if (!entity.name) {
    throw new BrokerException('BaseUnitEntity.name was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.mastrNumber) {
    throw new BrokerException('BaseUnitEntity.mastrNumber was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.commissionedOn) {
    throw new BrokerException('BaseUnitEntity.commissionedOn was undefined', HttpStatus.BAD_REQUEST);
  }
  if (
    !entity.address?.street ||
    !entity.address.postalCode ||
    !entity.address.city ||
    !entity.address.state ||
    !entity.address.country
  ) {
    throw new BrokerException(
      'BaseUnitEntity.address is incomplete (street, postalCode, city, state, country are required)',
      HttpStatus.BAD_REQUEST,
    );
  }
  if (!entity.company?.id) {
    throw new BrokerException('BaseUnitEntity.company was undefined', HttpStatus.BAD_REQUEST);
  }

  return Prisma.validator<Prisma.UnitCreateInput>()({
    name: entity.name,
    mastrNumber: entity.mastrNumber,
    manufacturer: entity.manufacturer,
    modelType: entity.modelType,
    modelNumber: entity.modelNumber,
    serialNumber: entity.serialNumber,
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
  if (!entity.electricityMeterNumber) {
    throw new BrokerException('PowerProductionUnitEntity.electricityMeterNumber was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.ratedPower) {
    throw new BrokerException('PowerProductionUnitEntity.ratedPower was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.type?.name) {
    throw new BrokerException('PowerProductionUnitEntity.type was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.gridLevel) {
    throw new BrokerException('PowerProductionUnitEntity.gridLevel was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.biddingZone) {
    throw new BrokerException('PowerProductionUnitEntity.biddingZone was undefined', HttpStatus.BAD_REQUEST);
  }

  return Prisma.validator<Prisma.UnitCreateInput>()({
    ...buildBaseUnitCreateInput(entity),
    powerProductionUnit: {
      create: {
        decommissioningPlannedOn: entity.decommissioningPlannedOn,
        electricityMeterNumber: entity.electricityMeterNumber,
        ratedPower: new Prisma.Decimal(entity.ratedPower),
        gridOperator: entity.gridOperator,
        gridConnectionNumber: entity.gridConnectionNumber,
        type: { connect: { name: entity.type.name } },
        gridLevel: entity.gridLevel,
        biddingZone: entity.biddingZone,
      },
    },
  });
}

export function buildHydrogenProductionUnitCreateInput(entity: HydrogenProductionUnitEntity): Prisma.UnitCreateInput {
  if (!entity.biddingZone) {
    throw new BrokerException('HydrogenProductionUnitEntity.biddingZone was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.method) {
    throw new BrokerException('HydrogenProductionUnitEntity.method was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.technology) {
    throw new BrokerException('HydrogenProductionUnitEntity.technology was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.ratedPower) {
    throw new BrokerException('HydrogenProductionUnitEntity.ratedPower was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.pressure) {
    throw new BrokerException('HydrogenProductionUnitEntity.pressure was undefined', HttpStatus.BAD_REQUEST);
  }

  return Prisma.validator<Prisma.UnitCreateInput>()({
    ...buildBaseUnitCreateInput(entity),
    hydrogenProductionUnit: {
      create: {
        method: entity.method,
        technology: entity.technology,
        biddingZone: entity.biddingZone,
        ratedPower: new Prisma.Decimal(entity.ratedPower),
        pressure: new Prisma.Decimal(entity.pressure),
      },
    },
  });
}

export function buildHydrogenStorageUnitCreateInput(entity: HydrogenStorageUnitEntity): Prisma.UnitCreateInput {
  if (!entity.type) {
    throw new BrokerException('HydrogenStorageUnitEntity.type was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.capacity) {
    throw new BrokerException('HydrogenStorageUnitEntity.capacity was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.pressure) {
    throw new BrokerException('HydrogenStorageUnitEntity.pressure was undefined', HttpStatus.BAD_REQUEST);
  }

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
