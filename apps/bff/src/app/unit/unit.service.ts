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
  ) {}

  async readPowerProductionUnit(id: string): Promise<PowerProductionUnitDto> {
    return firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNIT_BY_ID, new ReadByIdPayload(id)),
    ).then(PowerProductionUnitDto.fromEntity);
  }

  async readHydrogenProductionUnit(id: string): Promise<HydrogenProductionUnitDto> {
    return firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNIT_BY_ID, new ReadByIdPayload(id)),
    ).then(HydrogenProductionUnitDto.fromEntity);
  }

  async readHydrogenStorageUnit(id: string): Promise<HydrogenStorageUnitDto> {
    return firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNIT_BY_ID, new ReadByIdPayload(id)),
    ).then(HydrogenStorageUnitDto.fromEntity);
  }

  async readPowerProductionUnits(userId: string): Promise<PowerProductionOverviewDto[]> {
    const companyId = await this.getCompanyIdFromUserId(userId);
    return firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS, new ReadByIdPayload(companyId)),
    ).then((entities) => entities.map(PowerProductionOverviewDto.fromEntity));
  }

  async readHydrogenProductionUnits(userId: string): Promise<HydrogenProductionOverviewDto[]> {
    const companyId = await this.getCompanyIdFromUserId(userId);

    return firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS, new ReadByIdPayload(companyId)),
    ).then((entities) => entities.map(HydrogenProductionOverviewDto.fromEntity));
  }

  async readHydrogenStorageUnits(userId: string): Promise<HydrogenStorageOverviewDto[]> {
    const companyId = await this.getCompanyIdFromUserId(userId);

    return firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_HYDROGEN_STORAGE_UNITS, new ReadByIdPayload(companyId)),
    ).then((entities) => entities.map(HydrogenStorageOverviewDto.fromEntity));
  }

  async createPowerProductionUnit(dto: PowerProductionUnitCreateDto): Promise<PowerProductionUnitDto> {
    return firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.CREATE_POWER_PRODUCTION_UNIT,
        PowerProductionUnitCreateDto.toPayload(dto),
      ),
    ).then(PowerProductionUnitDto.fromEntity);
  }

  async createHydrogenProductionUnit(dto: HydrogenProductionUnitCreateDto): Promise<HydrogenProductionUnitDto> {
    return firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.CREATE_HYDROGEN_PRODUCTION_UNIT,
        HydrogenProductionUnitCreateDto.toPayload(dto),
      ),
    ).then(HydrogenProductionUnitDto.fromEntity);
  }

  async createHydrogenStorageUnit(dto: HydrogenStorageUnitCreateDto): Promise<HydrogenStorageUnitDto> {
    return firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.CREATE_HYDROGEN_STORAGE_UNIT,
        HydrogenStorageUnitCreateDto.toPayload(dto),
      ),
    ).then(HydrogenStorageUnitDto.fromEntity);
  }

  private async getCompanyIdFromUserId(id: string): Promise<string> {
    const userDetails = await this.userService.readUserWithCompany(id);
    return userDetails.company.id;
  }

  static mapEntityToDto(unitEntity: BaseUnitEntity): UnitDto {
    let unitDto: UnitDto;

    switch (unitEntity.unitType) {
      case UnitType.POWER_PRODUCTION:
        unitDto = PowerProductionUnitDto.fromEntity(unitEntity);
        break;
      case UnitType.HYDROGEN_PRODUCTION:
        unitDto = HydrogenProductionUnitDto.fromEntity(unitEntity);
        break;
      case UnitType.HYDROGEN_STORAGE:
        unitDto = HydrogenStorageUnitDto.fromEntity(unitEntity);
        break;
      default:
        throw new BadRequestException(`Unit type [${unitEntity.unitType}] unknown`);
    }

    return unitDto;
  }
}
