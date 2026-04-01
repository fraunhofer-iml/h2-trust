/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  BaseUnitEntity,
  BrokerException,
  CreateHydrogenProductionUnitPayload,
  CreateHydrogenStorageUnitPayload,
  CreatePowerProductionUnitPayload,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionUnitEntity,
  UnitEntity,
  UpdateUnitStatusPayload,
} from '@h2-trust/amqp';
import {
  buildHydrogenProductionUnitCreateInput,
  buildHydrogenStorageUnitCreateInput,
  buildPowerProductionUnitCreateInput,
} from '../create-inputs';
import { PrismaService } from '../prisma.service';
import {
  allUnitsQueryArgs,
  baseUnitDeepQueryArgs,
  hydrogenProductionUnitQueryArgs,
  hydrogenStorageUnitQueryArgs,
  powerProductionUnitQueryArgs,
} from '../query-args';
import { assertAllIdsFound, assertRecordFound } from './utils';

@Injectable()
export class UnitRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnitById(id: string): Promise<UnitEntity> {
    return this.prismaService.unit
      .findUnique({
        where: {
          id: id,
        },
        ...allUnitsQueryArgs,
      })
      .then((result) => assertRecordFound(result, id, 'Unit'))
      .then(this.mapToActualUnitEntity);
  }

  async findUnitsByIds(ids: string[]): Promise<UnitEntity[]> {
    return this.prismaService.unit
      .findMany({
        where: {
          id: {
            in: ids,
          },
        },
        ...allUnitsQueryArgs,
      })
      .then((units) => units.map(this.mapToActualUnitEntity));
  }

  mapToActualUnitEntity(_unit: Prisma.UnitGetPayload<typeof allUnitsQueryArgs>): UnitEntity {
    const { powerProductionUnit, hydrogenProductionUnit, hydrogenStorageUnit, ...unit } = _unit;

    if (powerProductionUnit) {
      return PowerProductionUnitEntity.fromDatabase({
        powerProductionUnit,
        ...unit,
      });
    }

    if (hydrogenProductionUnit) {
      return HydrogenProductionUnitEntity.fromDatabase({
        hydrogenProductionUnit,
        ...unit,
      });
    }

    if (hydrogenStorageUnit) {
      return HydrogenStorageUnitEntity.fromDatabase({
        hydrogenStorageUnit,
        ...unit,
      });
    }

    throw new BrokerException(`Incompatible unit`, HttpStatus.BAD_REQUEST);
  }

  async findPowerProductionUnitsByOwnerId(ownerId: string): Promise<PowerProductionUnitEntity[]> {
    return this.prismaService.unit
      .findMany({
        where: {
          ownerId: ownerId,
          powerProductionUnit: {
            isNot: null,
          },
        },
        ...powerProductionUnitQueryArgs,
      })
      .then((units) => units.map(PowerProductionUnitEntity.fromDatabase));
  }

  async findPowerProductionUnitsByIds(ids: string[]): Promise<PowerProductionUnitEntity[]> {
    return this.prismaService.unit
      .findMany({
        where: {
          id: { in: ids },
          powerProductionUnit: { isNot: null },
        },
        ...powerProductionUnitQueryArgs,
      })
      .then((units) => {
        assertAllIdsFound(units, ids, 'PowerProductionUnits');
        return units.map(PowerProductionUnitEntity.fromDatabase);
      });
  }

  async findHydrogenProductionUnitsByOwnerId(ownerId: string): Promise<HydrogenProductionUnitEntity[]> {
    return this.prismaService.unit
      .findMany({
        where: {
          ownerId: ownerId,
          hydrogenProductionUnit: {
            isNot: null,
          },
        },
        ...hydrogenProductionUnitQueryArgs,
      })
      .then((units) => units.map(HydrogenProductionUnitEntity.fromDatabase));
  }

  async findHydrogenProductionUnitsByIds(ids: string[]): Promise<HydrogenProductionUnitEntity[]> {
    return this.prismaService.unit
      .findMany({
        where: {
          id: { in: ids },
          hydrogenProductionUnit: { isNot: null },
        },
        ...hydrogenProductionUnitQueryArgs,
      })
      .then((units) => {
        assertAllIdsFound(units, ids, 'HydrogenProductionUnits');
        return units.map(HydrogenProductionUnitEntity.fromDatabase);
      });
  }

  async findHydrogenStorageUnitsByOwnerId(ownerId: string): Promise<HydrogenStorageUnitEntity[]> {
    return this.prismaService.unit
      .findMany({
        where: {
          ownerId: ownerId,
          hydrogenStorageUnit: {
            isNot: null,
          },
        },
        ...hydrogenStorageUnitQueryArgs,
      })
      .then((units) => units.map(HydrogenStorageUnitEntity.fromDatabase));
  }

  async updateUnitStatus(payload: UpdateUnitStatusPayload): Promise<BaseUnitEntity> {
    const unit = await this.prismaService.unit.update({
      where: {
        id: payload.id,
      },
      data: { active: payload.active },
      include: baseUnitDeepQueryArgs.include,
    });

    return BaseUnitEntity.fromDatabase(unit);
  }

  async updateOrCreateHydrogenProductionUnit(
    payload: CreateHydrogenProductionUnitPayload,
  ): Promise<HydrogenProductionUnitEntity> {
    return this.prismaService.unit
      .upsert({
        where: { id: payload.id ?? '' },
        update: {
          name: payload.name,
          mastrNumber: payload.mastrNumber,
          commissionedOn: payload.commissionedOn,
          owner: { connect: { id: payload.ownerId } },
          manufacturer: payload.manufacturer,
          modelType: payload.modelType,
          modelNumber: payload.modelNumber,
          serialNumber: payload.serialNumber,
          certifiedBy: payload.certifiedBy,
          operator: { connect: { id: payload.operatorId } },
          address: {
            update: {
              where: { id: payload.address.id },
              data: {
                street: payload.address.street,
                state: payload.address.state,
                postalCode: payload.address.postalCode,
                country: payload.address.country,
                city: payload.address.postalCode,
              },
            },
          },
          hydrogenProductionUnit: {
            update: {
              where: { id: payload.id },
              data: {
                method: payload.method,
                technology: payload.technology,
                biddingZone: payload.biddingZone,
                ratedPower: payload.ratedPower,
                pressure: payload.pressure,
                waterConsumptionLitersPerHour: payload.waterConsumptionLitersPerHour,
              },
            },
          },
        },
        create: buildHydrogenProductionUnitCreateInput(payload),
        include: hydrogenProductionUnitQueryArgs.include,
      })
      .then(HydrogenProductionUnitEntity.fromDatabase);
  }

  async updateOrCreatePowerProductionUnit(
    payload: CreatePowerProductionUnitPayload,
  ): Promise<PowerProductionUnitEntity> {
    return this.prismaService.unit
      .upsert({
        where: { id: payload.id ?? '' },
        update: {
          name: payload.name,
          mastrNumber: payload.mastrNumber,
          commissionedOn: payload.commissionedOn,
          owner: { connect: { id: payload.ownerId } },
          manufacturer: payload.manufacturer,
          modelType: payload.modelType,
          modelNumber: payload.modelNumber,
          serialNumber: payload.serialNumber,
          certifiedBy: payload.certifiedBy,
          operator: { connect: { id: payload.operatorId } },
          address: {
            update: {
              where: { id: payload.address.id },
              data: {
                street: payload.address.street,
                state: payload.address.state,
                postalCode: payload.address.postalCode,
                country: payload.address.country,
                city: payload.address.postalCode,
              },
            },
          },
          powerProductionUnit: {
            update: {
              where: { id: payload.id },
              data: {
                electricityMeterNumber: payload.electricityMeterNumber,
                gridOperator: payload.gridOperator,
                gridConnectionNumber: payload.gridConnectionNumber,
                gridLevel: payload.gridLevel,
                biddingZone: payload.biddingZone,
                ratedPower: payload.ratedPower,
                decommissioningPlannedOn: payload.decommissioningPlannedOn,
                financialSupportReceived: payload.financialSupportReceived,
              },
            },
          },
        },
        create: buildPowerProductionUnitCreateInput(payload),
        include: powerProductionUnitQueryArgs.include,
      })
      .then(PowerProductionUnitEntity.fromDatabase);
  }

  async updateOrCreateHydrogenStorageUnit(
    payload: CreateHydrogenStorageUnitPayload,
  ): Promise<HydrogenStorageUnitEntity> {
    return this.prismaService.unit
      .upsert({
        where: { id: payload.id ?? '' },
        update: {
          name: payload.name,
          mastrNumber: payload.mastrNumber,
          commissionedOn: payload.commissionedOn,
          owner: { connect: { id: payload.ownerId } },
          manufacturer: payload.manufacturer,
          modelType: payload.modelType,
          modelNumber: payload.modelNumber,
          serialNumber: payload.serialNumber,
          certifiedBy: payload.certifiedBy,
          operator: { connect: { id: payload.operatorId } },
          address: {
            update: {
              where: { id: payload.address.id },
              data: {
                street: payload.address.street,
                state: payload.address.state,
                postalCode: payload.address.postalCode,
                country: payload.address.country,
                city: payload.address.postalCode,
              },
            },
          },
          hydrogenStorageUnit: {
            update: {
              where: { id: payload.id },
              data: {
                type: payload.modelType,
                capacity: payload.capacity,
                pressure: payload.pressure,
              },
            },
          },
        },
        create: buildHydrogenStorageUnitCreateInput(payload),
        include: hydrogenStorageUnitQueryArgs.include,
      })
      .then(HydrogenStorageUnitEntity.fromDatabase);
  }
}
