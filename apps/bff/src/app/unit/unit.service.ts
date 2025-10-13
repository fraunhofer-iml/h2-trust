/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseUnitEntity, BrokerException, BrokerQueues, UnitEntity, UnitMessagePatterns } from '@h2-trust/amqp';
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
  UnitType,
} from '@h2-trust/api';
import { UserService } from '../user/user.service';

@Injectable()
export class UnitService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    private readonly userService: UserService,
  ) {}

  async readUnit(id: string): Promise<UnitDto> {
    return firstValueFrom(this.generalService.send(UnitMessagePatterns.READ, { id })).then(
      UnitService.mapUnitEntityToDto,
    );
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
        const powerProductionUnits = await this.readPowerProductionUnits(companyId);
        const hydrogenProductionUnits = await this.readHydrogenProductionUnits(companyId);
        const hydrogenStorageUnits = await this.readHydrogenStorageUnits(companyId);
        return [...powerProductionUnits, ...hydrogenProductionUnits, ...hydrogenStorageUnits];
      }
      default:
        throw new BrokerException(`unit-type ${unitType} unknown`, HttpStatus.BAD_REQUEST);
    }
  }

  private async readPowerProductionUnits(companyId: string): Promise<PowerProductionOverviewDto[]> {
    return firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS, { companyId }),
    ).then((entities) => entities.map(PowerProductionOverviewDto.fromEntity));
  }

  private async readHydrogenProductionUnits(companyId: string): Promise<HydrogenProductionOverviewDto[]> {
    return firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS, { companyId }),
    ).then((entities) => entities.map(HydrogenProductionOverviewDto.fromEntity));
  }

  private async readHydrogenStorageUnits(companyId: string): Promise<HydrogenStorageOverviewDto[]> {
    return firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_HYDROGEN_STORAGE_UNITS, { companyId }),
    ).then((entities) => entities.map(HydrogenStorageOverviewDto.fromEntity));
  }

  async createUnit(unit: UnitCreateDto): Promise<UnitDto> {
    let messagePattern: UnitMessagePatterns;
    let unitEntity: UnitEntity;
    switch (unit.unitType) {
      case UnitType.POWER_PRODUCTION: {
        messagePattern = UnitMessagePatterns.CREATE_POWER_PRODUCTION_UNIT;
        unitEntity = PowerProductionUnitCreateDto.toEntity(unit as PowerProductionUnitCreateDto);
        break;
      }
      case UnitType.HYDROGEN_PRODUCTION: {
        messagePattern = UnitMessagePatterns.CREATE_HYDROGEN_PRODUCTION_UNIT;
        unitEntity = HydrogenProductionUnitCreateDto.toEntity(unit as HydrogenProductionUnitCreateDto);
        break;
      }
      case UnitType.HYDROGEN_STORAGE: {
        messagePattern = UnitMessagePatterns.CREATE_HYDROGEN_STORAGE_UNIT;
        unitEntity = HydrogenStorageUnitCreateDto.toEntity(unit as HydrogenStorageUnitCreateDto);
        break;
      }
      default: {
        throw new BrokerException(`Unit type [${unit.unitType}] unknown`, HttpStatus.BAD_REQUEST);
      }
    }
    return firstValueFrom(this.generalService.send(messagePattern, { unit: unitEntity })).then(
      UnitService.mapUnitEntityToDto,
    );
  }

  static mapUnitEntityToDto(unit: BaseUnitEntity): UnitDto {
    switch (unit.unitType) {
      case UnitType.POWER_PRODUCTION:
        return PowerProductionUnitDto.fromEntity(unit);
      case UnitType.HYDROGEN_PRODUCTION:
        return HydrogenProductionUnitDto.fromEntity(unit);
      case UnitType.HYDROGEN_STORAGE:
        return HydrogenStorageUnitDto.fromEntity(unit);
      default:
        throw new BrokerException(`unit-type ${unit.unitType} unknown`, HttpStatus.BAD_REQUEST);
    }
  }
}
