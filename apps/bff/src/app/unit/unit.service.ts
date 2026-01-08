/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BaseUnitEntity,
  BrokerQueues,
  CreateHydrogenProductionUnitPayload,
  CreateHydrogenStorageUnitPayload,
  CreatePowerProductionUnitPayload,
  ReadByIdPayload,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import {
  HydrogenProductionOverviewDto,
  HydrogenProductionUnitCreateDto,
  HydrogenProductionUnitDto,
  HydrogenStorageOverviewDto,
  HydrogenStorageUnitCreateDto,
  HydrogenStorageUnitDto,
  PowerProductionOverviewDto,
  PowerProductionUnitCreateDto,
  PowerProductionUnitDto,
  UnitCreateDto,
  UnitDto,
  UnitOverviewDto,
} from '@h2-trust/api';
import { UnitType } from '@h2-trust/domain';
import { UserService } from '../user/user.service';

@Injectable()
export class UnitService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    private readonly userService: UserService,
  ) { }

  async readUnit(id: string): Promise<UnitDto> {
    const unit: BaseUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, new ReadByIdPayload(id))
    );
    return UnitService.mapEntityToDto(unit);
  }

  async readUnits(userId: string, unitType: UnitType): Promise<UnitOverviewDto[]> {
    const userDetails = await this.userService.readUserWithCompany(userId);
    const companyId = userDetails.company.id;

    switch (unitType) {
      case UnitType.POWER_PRODUCTION:
        return this.readPowerProductionUnits(companyId);
      case UnitType.HYDROGEN_PRODUCTION:
        return this.readHydrogenProductionUnits(companyId);
      case UnitType.HYDROGEN_STORAGE:
        return this.readHydrogenStorageUnits(companyId);
      case undefined: {
        const [powerProductionUnits, hydrogenProductionUnits, hydrogenStorageUnits] = await Promise.all([
          this.readPowerProductionUnits(companyId),
          this.readHydrogenProductionUnits(companyId),
          this.readHydrogenStorageUnits(companyId),
        ]);
        return [...powerProductionUnits, ...hydrogenProductionUnits, ...hydrogenStorageUnits];
      }
      default:
        throw new BadRequestException(`Unit type [${unitType}] unknown`);
    }
  }

  private async readPowerProductionUnits(companyId: string): Promise<PowerProductionOverviewDto[]> {
    const units: BaseUnitEntity[] = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS, new ReadByIdPayload(companyId)),
    );
    return units.map(PowerProductionOverviewDto.fromEntity);
  }

  private async readHydrogenProductionUnits(companyId: string): Promise<HydrogenProductionOverviewDto[]> {
    const units: BaseUnitEntity[] = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS, new ReadByIdPayload(companyId)),
    );
    return units.map(HydrogenProductionOverviewDto.fromEntity);
  }

  private async readHydrogenStorageUnits(companyId: string): Promise<HydrogenStorageOverviewDto[]> {
    const units: BaseUnitEntity[] = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_HYDROGEN_STORAGE_UNITS, new ReadByIdPayload(companyId)),
    );
    return units.map(HydrogenStorageOverviewDto.fromEntity);
  }

  async createUnit(dto: UnitCreateDto): Promise<UnitDto> {
    let messagePattern: UnitMessagePatterns;
    let payload:
      | CreatePowerProductionUnitPayload
      | CreateHydrogenProductionUnitPayload
      | CreateHydrogenStorageUnitPayload;

    switch (dto.unitType) {
      case UnitType.POWER_PRODUCTION: {
        messagePattern = UnitMessagePatterns.CREATE_POWER_PRODUCTION_UNIT;
        payload = PowerProductionUnitCreateDto.toPayload(dto as PowerProductionUnitCreateDto);
        break;
      }
      case UnitType.HYDROGEN_PRODUCTION: {
        messagePattern = UnitMessagePatterns.CREATE_HYDROGEN_PRODUCTION_UNIT;
        payload = HydrogenProductionUnitCreateDto.toPayload(dto as HydrogenProductionUnitCreateDto);
        break;
      }
      case UnitType.HYDROGEN_STORAGE: {
        messagePattern = UnitMessagePatterns.CREATE_HYDROGEN_STORAGE_UNIT;
        payload = HydrogenStorageUnitCreateDto.toPayload(dto as HydrogenStorageUnitCreateDto);
        break;
      }
      default: {
        throw new BadRequestException(`Unit type [${dto.unitType}] unknown`);
      }
    }

    const entity: BaseUnitEntity = await firstValueFrom(
      this.generalService.send(messagePattern, payload)
    );
    return UnitService.mapEntityToDto(entity);
  }

  static mapEntityToDto(unitEntity: BaseUnitEntity): UnitDto {
    let unit: UnitDto;

    switch (unitEntity.unitType) {
      case UnitType.POWER_PRODUCTION:
        unit = PowerProductionUnitDto.fromEntity(unitEntity);
        break;
      case UnitType.HYDROGEN_PRODUCTION:
        unit = HydrogenProductionUnitDto.fromEntity(unitEntity);
        break;
      case UnitType.HYDROGEN_STORAGE:
        unit = HydrogenStorageUnitDto.fromEntity(unitEntity);
        break;
      default:
        throw new BadRequestException(`Unit type [${unitEntity.unitType}] unknown`);
    }

    return unit;
  }
}
