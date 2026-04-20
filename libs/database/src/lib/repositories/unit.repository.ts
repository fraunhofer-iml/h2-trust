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
  BrokerException,
  ConcreteUnitEntity,
  CreateHydrogenProductionUnitPayload,
  CreateHydrogenStorageUnitPayload,
  CreatePowerProductionUnitPayload,
  UpdateUnitStatusPayload,
} from '@h2-trust/amqp';
import {
  buildHydrogenProductionUnitCreateInput,
  buildHydrogenStorageUnitCreateInput,
  buildPowerProductionUnitCreateInput,
} from '../create-inputs';
import { PrismaService } from '../prisma.service';
import { baseUnitDeepQueryArgs } from '../query-args';
import { assertAllIdsFound, assertRecordFound } from './utils';
import { PowerProductionUnitEntity, HydrogenProductionUnitEntity, HydrogenStorageUnitEntity, BaseUnitEntity } from '@h2-trust/contracts';

@Injectable()
export class UnitRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnitById(id: string): Promise<ConcreteUnitEntity> {
    return this.prismaService.unit
      .findUnique({
        where: {
          id: id,
        },
        ...baseUnitDeepQueryArgs,
      })
      .then((result) => assertRecordFound(result, id, 'Unit'))
      .then(this.mapToActualUnitEntity);
  }

  async findUnitsByIds(ids: string[]): Promise<ConcreteUnitEntity[]> {
    return this.prismaService.unit
      .findMany({
        where: {
          id: {
            in: ids,
          },
        },
        ...baseUnitDeepQueryArgs,
      })
      .then((units) => units.map(this.mapToActualUnitEntity));
  }

  mapToActualUnitEntity(baseUnit: Prisma.UnitGetPayload<typeof baseUnitDeepQueryArgs>): ConcreteUnitEntity {
    if (baseUnit.powerProductionUnit) {
      return PowerProductionUnitEntity.fromDeepDatabase(baseUnit);
    }

    if (baseUnit.hydrogenProductionUnit) {
      return HydrogenProductionUnitEntity.fromDeepDatabase(baseUnit);
    }

    if (baseUnit.hydrogenStorageUnit) {
      return HydrogenStorageUnitEntity.fromDeepDatabase(baseUnit);
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
        ...baseUnitDeepQueryArgs,
      })
      .then((units) => units.map(PowerProductionUnitEntity.fromDeepDatabase));
  }

  async findPowerProductionUnitsByIds(ids: string[]): Promise<PowerProductionUnitEntity[]> {
    return this.prismaService.unit
      .findMany({
        where: {
          id: { in: ids },
          powerProductionUnit: { isNot: null },
        },
        ...baseUnitDeepQueryArgs,
      })
      .then((units) => {
        assertAllIdsFound(units, ids, 'PowerProductionUnits');
        return units.map(PowerProductionUnitEntity.fromDeepDatabase);
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
        ...baseUnitDeepQueryArgs,
      })
      .then((units) => units.map(HydrogenProductionUnitEntity.fromDeepDatabase));
  }

  async findHydrogenProductionUnitsByIds(ids: string[]): Promise<HydrogenProductionUnitEntity[]> {
    return this.prismaService.unit
      .findMany({
        where: {
          id: { in: ids },
          hydrogenProductionUnit: { isNot: null },
        },
        ...baseUnitDeepQueryArgs,
      })
      .then((units) => {
        assertAllIdsFound(units, ids, 'HydrogenProductionUnits');
        return units.map(HydrogenProductionUnitEntity.fromDeepDatabase);
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
        ...baseUnitDeepQueryArgs,
      })
      .then((units) => units.map(HydrogenStorageUnitEntity.fromDeepDatabase));
  }

  async updateUnitStatus(payload: UpdateUnitStatusPayload): Promise<BaseUnitEntity> {
    const unit = await this.prismaService.unit.update({
      where: {
        id: payload.id,
      },
      data: { active: payload.active },
      include: baseUnitDeepQueryArgs.include,
    });

    return BaseUnitEntity.fromDeepBaseUnit(unit);
  }

  async updateOrCreateHydrogenProductionUnit(
    payload: CreateHydrogenProductionUnitPayload,
  ): Promise<HydrogenProductionUnitEntity> {
    if (payload.id) {
      await this.validateUnitIsActive(payload.id);
    }

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
        include: baseUnitDeepQueryArgs.include,
      })
      .then(HydrogenProductionUnitEntity.fromDeepDatabase);
  }

  async updateOrCreatePowerProductionUnit(
    payload: CreatePowerProductionUnitPayload,
  ): Promise<PowerProductionUnitEntity> {
    if (payload.id) {
      await this.validateUnitIsActive(payload.id);
    }

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
                type: { connect: { name: payload.powerProductionType } },
              },
            },
          },
        },
        create: buildPowerProductionUnitCreateInput(payload),
        include: baseUnitDeepQueryArgs.include,
      })
      .then(PowerProductionUnitEntity.fromDeepDatabase);
  }

  async updateOrCreateHydrogenStorageUnit(
    payload: CreateHydrogenStorageUnitPayload,
  ): Promise<HydrogenStorageUnitEntity> {
    if (payload.id) {
      await this.validateUnitIsActive(payload.id);
    }

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
        include: baseUnitDeepQueryArgs.include,
      })
      .then(HydrogenStorageUnitEntity.fromDeepDatabase);
  }

  private async validateUnitIsActive(id: string): Promise<void> {
    const unit = await this.prismaService.unit.findUnique({
      where: { id: id },
      select: { active: true },
    });

    if (!unit?.active) throw new Error(`Unit with Id ${id} is inactive.`);
  }
}
