/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  BaseUnitEntity,
  ConcreteUnitEntity,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionUnitEntity,
  UserEntity,
} from '@h2-trust/contracts/entities';
import {
  CreateHydrogenProductionUnitPayload,
  CreateHydrogenStorageUnitPayload,
  CreatePowerProductionUnitPayload,
  UpdateUnitStatusPayload,
} from '@h2-trust/contracts/payloads';
import { UnitType } from '@h2-trust/domain';
import { DomainException, ErrorCode } from '@h2-trust/exceptions';
import {
  buildHydrogenProductionUnitCreateInput,
  buildHydrogenStorageUnitCreateInput,
  buildPowerProductionUnitCreateInput,
} from '../create-inputs';
import { PrismaService } from '../prisma.service';
import { unitDeepQueryArgs } from '../query-args';
import { wrapPrismaError } from './prisma-error.wrapper';
import { assertAllIdsFound, assertRecordFound } from './repository-assertions';

@Injectable()
export class UnitRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnitById(id: string): Promise<ConcreteUnitEntity> {
    const unit = await this.prismaService.unit
      .findUnique({ where: { id }, ...unitDeepQueryArgs })
      .catch(wrapPrismaError);

    assertRecordFound(unit, id);
    return this.mapToActualUnitEntity(unit);
  }

  async findUnitsByIds(ids: string[]): Promise<ConcreteUnitEntity[]> {
    const units = await this.prismaService.unit
      .findMany({ where: { id: { in: ids } }, ...unitDeepQueryArgs })
      .catch(wrapPrismaError);

    assertAllIdsFound(units, ids);
    return units.map(this.mapToActualUnitEntity);
  }

  mapToActualUnitEntity(baseUnit: Prisma.UnitGetPayload<typeof unitDeepQueryArgs>): ConcreteUnitEntity {
    if (baseUnit.type === UnitType.POWER_PRODUCTION) {
      return PowerProductionUnitEntity.fromDeepUnitDatabase(baseUnit);
    }

    if (baseUnit.type === UnitType.HYDROGEN_PRODUCTION) {
      return HydrogenProductionUnitEntity.fromDeepDatabase(baseUnit);
    }

    if (baseUnit.type === UnitType.HYDROGEN_STORAGE) {
      //TODO-LG: add process steps of hydrogen storage here
      return HydrogenStorageUnitEntity.fromDeepDatabase(baseUnit, []);
    }

    return BaseUnitEntity.fromDeepBaseUnit(baseUnit);
  }

  async findPowerProductionUnitsByOwnerId(ownerId: string): Promise<PowerProductionUnitEntity[]> {
    const units = await this.prismaService.unit
      .findMany({ where: { ownerId, type: UnitType.POWER_PRODUCTION }, ...unitDeepQueryArgs })
      .catch(wrapPrismaError);

    return units.map(PowerProductionUnitEntity.fromDeepUnitDatabase);
  }

  async findPowerProductionUnitsByIds(ids: string[]): Promise<PowerProductionUnitEntity[]> {
    const units = await this.prismaService.unit
      .findMany({ where: { id: { in: ids }, type: UnitType.POWER_PRODUCTION }, ...unitDeepQueryArgs })
      .catch(wrapPrismaError);

    assertAllIdsFound(units, ids);
    return units.map(PowerProductionUnitEntity.fromDeepUnitDatabase);
  }

  async findHydrogenProductionUnitsByOwnerId(ownerId: string): Promise<HydrogenProductionUnitEntity[]> {
    const units = await this.prismaService.unit
      .findMany({ where: { ownerId, type: UnitType.HYDROGEN_PRODUCTION }, ...unitDeepQueryArgs })
      .catch(wrapPrismaError);

    return units.map(HydrogenProductionUnitEntity.fromDeepDatabase);
  }

  async findHydrogenProductionUnitsByIds(ids: string[]): Promise<HydrogenProductionUnitEntity[]> {
    const units = await this.prismaService.unit
      .findMany({ where: { id: { in: ids }, type: UnitType.HYDROGEN_PRODUCTION }, ...unitDeepQueryArgs })
      .catch(wrapPrismaError);

    assertAllIdsFound(units, ids);
    return units.map(HydrogenProductionUnitEntity.fromDeepDatabase);
  }

  async findHydrogenStorageUnitsByOwnerId(ownerId: string): Promise<HydrogenStorageUnitEntity[]> {
    const units = await this.prismaService.unit
      .findMany({ where: { ownerId, type: UnitType.HYDROGEN_STORAGE }, ...unitDeepQueryArgs })
      .catch(wrapPrismaError);
    //TODO-LG: add process steps of storage unit here
    return units.map((unit) => HydrogenStorageUnitEntity.fromDeepDatabase(unit, []));
  }

  async updateUnitStatus(payload: UpdateUnitStatusPayload): Promise<BaseUnitEntity> {
    const unit = await this.prismaService.unit
      .update({ where: { id: payload.id }, data: { active: payload.active }, include: unitDeepQueryArgs.include })
      .catch(wrapPrismaError);

    return BaseUnitEntity.fromDeepBaseUnit(unit);
  }

  async updateOrCreateHydrogenProductionUnit(
    payload: CreateHydrogenProductionUnitPayload,
  ): Promise<HydrogenProductionUnitEntity> {
    if (payload.id) {
      await this.validateUnitIsActive(payload.id);
    }

    const unit = await this.prismaService.unit
      .upsert({
        where: { id: payload.id ?? '' },
        update: {
          name: payload.name,
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
          specification: {
            update: {
              where: { id: payload.id },
              data: {
                type: payload.hydrogenProductionType,
                technology: payload.technology,
                biddingZone: payload.biddingZone,
                ratedPower: new Prisma.Decimal(payload.ratedPower),
              },
            },
          },
        },
        create: buildHydrogenProductionUnitCreateInput(payload),
        include: unitDeepQueryArgs.include,
      })
      .catch(wrapPrismaError);

    return HydrogenProductionUnitEntity.fromDeepDatabase(unit);
  }

  async updateOrCreatePowerProductionUnit(
    payload: CreatePowerProductionUnitPayload,
  ): Promise<PowerProductionUnitEntity> {
    if (payload.id) {
      await this.validateUnitIsActive(payload.id);
    }

    const unit = await this.prismaService.unit
      .upsert({
        where: { id: payload.id ?? '' },
        update: {
          name: payload.name,
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
          specification: {
            update: {
              where: { id: payload.id },
              data: {
                biddingZone: payload.biddingZone,
                ratedPower: new Prisma.Decimal(payload.ratedPower),
                decommissioningPlannedOn: payload.decommissioningPlannedOn,
                financialSupportReceived: payload.financialSupportReceived,
                energySource: payload.powerProductionType,
              },
            },
          },
        },
        create: buildPowerProductionUnitCreateInput(payload),
        include: unitDeepQueryArgs.include,
      })
      .catch(wrapPrismaError);

    return PowerProductionUnitEntity.fromDeepUnitDatabase(unit);
  }

  async updateOrCreateHydrogenStorageUnit(
    payload: CreateHydrogenStorageUnitPayload,
  ): Promise<HydrogenStorageUnitEntity> {
    if (payload.id) {
      await this.validateUnitIsActive(payload.id);
    }

    const unit = await this.prismaService.unit
      .upsert({
        where: { id: payload.id ?? '' },
        update: {
          name: payload.name,
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
          specification: {
            update: {
              where: { id: payload.id },
              data: {
                type: payload.type,
                capacity: new Prisma.Decimal(payload.capacity),
              },
            },
          },
        },
        create: buildHydrogenStorageUnitCreateInput(payload),
        include: unitDeepQueryArgs.include,
      })
      .catch(wrapPrismaError);

    return HydrogenStorageUnitEntity.fromDeepDatabase(unit, []);
  }

  private async validateUnitIsActive(id: string): Promise<void> {
    const unit = await this.prismaService.unit
      .findUnique({ where: { id }, select: { active: true } })
      .catch(wrapPrismaError);

    if (!unit?.active) {
      throw new DomainException(ErrorCode.DOMAIN_RESOURCE_INACTIVE, `Unit with ID '${id}' is inactive.`);
    }
  }

  async ownsPowerProductionUnit(user: UserEntity, powerProductionUnitId: string): Promise<boolean> {
    const ownedUnits = await this.findPowerProductionUnitsByOwnerId(user.company.id);
    return ownedUnits.some((unit) => unit.id === powerProductionUnitId);
  }
}
