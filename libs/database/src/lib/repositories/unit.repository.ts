/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UnitEntity, UserEntity } from '@h2-trust/contracts/entities';
import {
  CreateHydrogenBottlingUnitPayload,
  CreateHydrogenCompressorUnitPayload,
  CreateHydrogenEndUseUnitPayload,
  CreateHydrogenProductionUnitPayload,
  CreateHydrogenStorageUnitPayload,
  CreateHydrogenTransportUnitPayload,
  CreatePowerProductionUnitPayload,
  UpdateUnitStatusPayload,
} from '@h2-trust/contracts/payloads';
import { UnitType } from '@h2-trust/domain';
import { DomainException, ErrorCode } from '@h2-trust/exceptions';
import {
  buildHydrogenProductionUnitCreateInput,
  buildHydrogenStorageUnitCreateInput,
  buildHydrogenTransportUnitCreateInput,
  buildPowerProductionUnitCreateInput,
  buildUnitCreateInputWitEmptySpecification,
} from '../create-inputs';
import { PrismaService } from '../prisma.service';
import { unitDeepQueryArgs } from '../query-args';
import { wrapPrismaError } from './prisma-error.wrapper';
import { assertAllIdsFound, assertRecordFound } from './repository-assertions';

@Injectable()
export class UnitRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnitById(id: string): Promise<UnitEntity> {
    const unit = await this.prismaService.unit
      .findUnique({ where: { id }, ...unitDeepQueryArgs })
      .catch(wrapPrismaError);

    assertRecordFound(unit, id);
    return UnitEntity.fromDeepBaseUnit(unit);
  }

  async findUnitsByIds(ids: string[]): Promise<UnitEntity[]> {
    const units = await this.prismaService.unit
      .findMany({ where: { id: { in: ids } }, ...unitDeepQueryArgs })
      .catch(wrapPrismaError);

    assertAllIdsFound(units, ids);
    return units.map(UnitEntity.fromDeepBaseUnit);
  }

  async findUnitsByOwnerIdAndType(ownerId: string, unitType: UnitType): Promise<UnitEntity[]> {
    const units = await this.prismaService.unit
      .findMany({ where: { ownerId, type: unitType }, ...unitDeepQueryArgs })
      .catch(wrapPrismaError);
    return units.map(UnitEntity.fromDeepBaseUnit);
  }

  async updateUnitStatus(payload: UpdateUnitStatusPayload): Promise<UnitEntity> {
    const unit = await this.prismaService.unit
      .update({ where: { id: payload.id }, data: { active: payload.active }, include: unitDeepQueryArgs.include })
      .catch(wrapPrismaError);

    return UnitEntity.fromDeepBaseUnit(unit);
  }

  async updateOrCreateHydrogenProductionUnit(payload: CreateHydrogenProductionUnitPayload): Promise<UnitEntity> {
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
              data: {
                type: payload.hydrogenProductionType,
                technology: payload.technology,
                biddingZone: payload.biddingZone,
                ratedPower: new Prisma.Decimal(payload.ratedPower),
                waterConsumptionLitersPerHour: new Prisma.Decimal(payload.waterConsumptionLitersPerHour),
              },
            },
          },
        },
        create: buildHydrogenProductionUnitCreateInput(payload),
        include: unitDeepQueryArgs.include,
      })
      .catch(wrapPrismaError);

    return UnitEntity.fromDeepBaseUnit(unit);
  }

  async updateOrCreatePowerProductionUnit(payload: CreatePowerProductionUnitPayload): Promise<UnitEntity> {
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
              data: {
                biddingZone: payload.biddingZone,
                ratedPower: new Prisma.Decimal(payload.ratedPower),
                decommissioningPlannedOn: payload.decommissioningPlannedOn,
                financialSupportReceived: payload.financialSupportReceived,
                type: payload.powerProductionType,
              },
            },
          },
        },
        create: buildPowerProductionUnitCreateInput(payload),
        include: unitDeepQueryArgs.include,
      })
      .catch(wrapPrismaError);

    return UnitEntity.fromDeepBaseUnit(unit);
  }

  async updateOrCreateHydrogenStorageUnit(payload: CreateHydrogenStorageUnitPayload): Promise<UnitEntity> {
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

    return UnitEntity.fromDeepBaseUnit(unit);
  }

  async updateOrCreateHydrogenTransportUnit(payload: CreateHydrogenTransportUnitPayload): Promise<UnitEntity> {
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
              data: {
                fuelType: payload.fuelType,
                type: payload.transportType,
              },
            },
          },
        },
        create: buildHydrogenTransportUnitCreateInput(payload),
        include: unitDeepQueryArgs.include,
      })
      .catch(wrapPrismaError);

    return UnitEntity.fromDeepBaseUnit(unit);
  }

  async updateOrCreateHydrogenCompressorUnit(payload: CreateHydrogenCompressorUnitPayload): Promise<UnitEntity> {
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
        },
        create: buildUnitCreateInputWitEmptySpecification(payload, UnitType.COMPRESSION),

        include: unitDeepQueryArgs.include,
      })
      .catch(wrapPrismaError);

    return UnitEntity.fromDeepBaseUnit(unit);
  }

  async updateOrCreateHydrogenEndUseUnit(payload: CreateHydrogenEndUseUnitPayload): Promise<UnitEntity> {
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
        },
        create: buildUnitCreateInputWitEmptySpecification(payload, UnitType.END_USE),

        include: unitDeepQueryArgs.include,
      })
      .catch(wrapPrismaError);

    return UnitEntity.fromDeepBaseUnit(unit);
  }

  async updateOrCreateHydrogenBottlingUnit(payload: CreateHydrogenBottlingUnitPayload): Promise<UnitEntity> {
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
        },
        create: buildUnitCreateInputWitEmptySpecification(payload, UnitType.BOTTLING),

        include: unitDeepQueryArgs.include,
      })
      .catch(wrapPrismaError);

    return UnitEntity.fromDeepBaseUnit(unit);
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
    const ownedUnits = await this.findUnitsByOwnerIdAndType(user.company.id, UnitType.POWER_PRODUCTION);
    return ownedUnits.some((unit) => unit.id === powerProductionUnitId);
  }
}
