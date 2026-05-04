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
  ConcreteUnitEntity,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionUnitEntity,
} from '@h2-trust/contracts/entities';
import {
  CreateHydrogenProductionUnitPayload,
  CreateHydrogenStorageUnitPayload,
  CreatePowerProductionUnitPayload,
  UpdateUnitStatusPayload,
} from '@h2-trust/contracts/payloads';
import { BrokerException } from '@h2-trust/messaging';
import {
  buildHydrogenProductionUnitCreateInput,
  buildHydrogenStorageUnitCreateInput,
  buildPowerProductionUnitCreateInput,
} from '../create-inputs';
import { PrismaService } from '../prisma.service';
import { baseUnitDeepQueryArgs } from '../query-args';
import { assertAllIdsFound, assertRecordFound } from './repository-assertions';

@Injectable()
export class UnitRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async findUnitById(id: string): Promise<ConcreteUnitEntity> {
    const unit = await this.prismaService.unit.findUnique({
      where: {
        id: id,
      },
      ...baseUnitDeepQueryArgs,
    });
    assertRecordFound(unit, id, 'Unit');
    return this.mapToActualUnitEntity(unit);
  }

  async findUnitsByIds(ids: string[]): Promise<ConcreteUnitEntity[]> {
    const units = await this.prismaService.unit.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      ...baseUnitDeepQueryArgs,
    });
    return units.map(this.mapToActualUnitEntity);
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
    const units = await this.prismaService.unit.findMany({
      where: {
        ownerId: ownerId,
        powerProductionUnit: {
          isNot: null,
        },
      },
      ...baseUnitDeepQueryArgs,
    });
    return units.map(PowerProductionUnitEntity.fromDeepDatabase);
  }

  async findPowerProductionUnitsByIds(ids: string[]): Promise<PowerProductionUnitEntity[]> {
    const units = await this.prismaService.unit.findMany({
      where: {
        id: { in: ids },
        powerProductionUnit: { isNot: null },
      },
      ...baseUnitDeepQueryArgs,
    });
    assertAllIdsFound(units, ids, 'PowerProductionUnits');
    return units.map(PowerProductionUnitEntity.fromDeepDatabase);
  }

  async findHydrogenProductionUnitsByOwnerId(ownerId: string): Promise<HydrogenProductionUnitEntity[]> {
    const units = await this.prismaService.unit.findMany({
      where: {
        ownerId: ownerId,
        hydrogenProductionUnit: {
          isNot: null,
        },
      },
      ...baseUnitDeepQueryArgs,
    });
    return units.map(HydrogenProductionUnitEntity.fromDeepDatabase);
  }

  async findHydrogenProductionUnitsByIds(ids: string[]): Promise<HydrogenProductionUnitEntity[]> {
    const units = await this.prismaService.unit.findMany({
      where: {
        id: { in: ids },
        hydrogenProductionUnit: { isNot: null },
      },
      ...baseUnitDeepQueryArgs,
    });
    assertAllIdsFound(units, ids, 'HydrogenProductionUnits');
    return units.map(HydrogenProductionUnitEntity.fromDeepDatabase);
  }

  async findHydrogenStorageUnitsByOwnerId(ownerId: string): Promise<HydrogenStorageUnitEntity[]> {
    const units = await this.prismaService.unit.findMany({
      where: {
        ownerId: ownerId,
        hydrogenStorageUnit: {
          isNot: null,
        },
      },
      ...baseUnitDeepQueryArgs,
    });
    return units.map(HydrogenStorageUnitEntity.fromDeepDatabase);
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
    payload: CreateHydrogenProductionUnitPayload
  ): Promise<HydrogenProductionUnitEntity> {
    if (payload.id) {
      await this.validateUnitIsActive(payload.id);
    }

    const unit = await this.prismaService.unit.upsert({
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
              city: payload.address.city,
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
              ratedPower: new Prisma.Decimal(payload.ratedPower),
              pressure: new Prisma.Decimal(payload.pressure),
              waterConsumptionLitersPerHour: new Prisma.Decimal(payload.waterConsumptionLitersPerHour),
            },
          },
        },
      },
      create: buildHydrogenProductionUnitCreateInput(payload),
      include: baseUnitDeepQueryArgs.include,
    })
    return HydrogenProductionUnitEntity.fromDeepDatabase(unit);
  }

  async updateOrCreatePowerProductionUnit(
    payload: CreatePowerProductionUnitPayload,
  ): Promise<PowerProductionUnitEntity> {
    if (payload.id) {
      await this.validateUnitIsActive(payload.id);
    }

    const unit = await this.prismaService.unit.upsert({
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
              city: payload.address.city,
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
              ratedPower: new Prisma.Decimal(payload.ratedPower),
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
    return PowerProductionUnitEntity.fromDeepDatabase(unit);
  }

  async updateOrCreateHydrogenStorageUnit(
    payload: CreateHydrogenStorageUnitPayload,
  ): Promise<HydrogenStorageUnitEntity> {
    if (payload.id) {
      await this.validateUnitIsActive(payload.id);
    }

    const unit = await this.prismaService.unit.upsert({
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
              city: payload.address.city,
            },
          },
        },
        hydrogenStorageUnit: {
          update: {
            where: { id: payload.id },
            data: {
              type: payload.storageType,
              capacity: new Prisma.Decimal(payload.capacity),
              pressure: new Prisma.Decimal(payload.pressure),
            },
          },
        },
      },
      create: buildHydrogenStorageUnitCreateInput(payload),
      include: baseUnitDeepQueryArgs.include,
    });
    return HydrogenStorageUnitEntity.fromDeepDatabase(unit);
  }

  private async validateUnitIsActive(id: string): Promise<void> {
    const unit = await this.prismaService.unit.findUnique({
      where: { id: id },
      select: { active: true },
    });

    if (!unit?.active) throw new Error(`Unit with Id ${id} is inactive.`);
  }
}
