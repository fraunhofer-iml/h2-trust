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
  if (!entity.gridLevelName) {
    throw new BrokerException('PowerProductionUnitEntity.gridLevelName was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.biddingZoneName) {
    throw new BrokerException('PowerProductionUnitEntity.biddingZoneName was undefined', HttpStatus.BAD_REQUEST);
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
        gridLevel: { connect: { name: entity.gridLevelName } },
        biddingZone: { connect: { name: entity.biddingZoneName } },
      },
    },
  });
}

export function buildHydrogenProductionUnitCreateInput(entity: HydrogenProductionUnitEntity): Prisma.UnitCreateInput {
  if (!entity.ratedPower) {
    throw new BrokerException('HydrogenProductionUnitEntity.ratedPower was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.pressure) {
    throw new BrokerException('HydrogenProductionUnitEntity.pressure was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.type?.id) {
    throw new BrokerException('HydrogenProductionUnitEntity.type.id was undefined', HttpStatus.BAD_REQUEST);
  }
  if (!entity.biddingZoneName) {
    throw new BrokerException('HydrogenProductionUnitEntity.biddingZoneName was undefined', HttpStatus.BAD_REQUEST);
  }

  return Prisma.validator<Prisma.UnitCreateInput>()({
    ...buildBaseUnitCreateInput(entity),
    hydrogenProductionUnit: {
      create: {
        ratedPower: new Prisma.Decimal(entity.ratedPower),
        pressure: new Prisma.Decimal(entity.pressure),
        type: {
          connect: { id: entity.type.id },
        },
        biddingZone: {
          connect: { name: entity.biddingZoneName },
        },
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
        type: {
          connect: {
            name: entity.type,
          },
        },
      },
    },
  });
}
