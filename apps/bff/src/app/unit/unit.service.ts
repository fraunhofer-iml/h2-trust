/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerQueues, HydrogenStorageUnitEntity, ReadByIdPayload, UnitMessagePatterns } from '@h2-trust/amqp';
import {
  HydrogenProductionOverviewDto,
  HydrogenProductionUnitDto,
  HydrogenProductionUnitInputDto,
  HydrogenStorageOverviewDto,
  HydrogenStorageUnitDto,
  HydrogenStorageUnitInputDto,
  PowerProductionOverviewDto,
  PowerProductionUnitDto,
  PowerProductionUnitInputDto,
  UnitUpdateActiveDto,
} from '@h2-trust/api';
import { UserService } from '../user/user.service';

@Injectable()
export class UnitService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    private readonly userService: UserService,
  ) {}

  async readPowerProductionUnit(id: string): Promise<PowerProductionUnitDto> {
    const unit = await firstValueFrom(this.generalService.send(UnitMessagePatterns.READ, new ReadByIdPayload(id)));
    return PowerProductionUnitDto.fromEntity(unit);
  }

  async readHydrogenProductionUnit(id: string): Promise<HydrogenProductionUnitDto> {
    return firstValueFrom(this.generalService.send(UnitMessagePatterns.READ, new ReadByIdPayload(id))).then(
      HydrogenProductionUnitDto.fromEntity,
    );
  }

  async readHydrogenStorageUnit(id: string): Promise<HydrogenStorageUnitDto> {
    return firstValueFrom(this.generalService.send(UnitMessagePatterns.READ, new ReadByIdPayload(id))).then(
      HydrogenStorageUnitDto.fromEntity,
    );
  }

  async readPowerProductionUnits(userId: string): Promise<PowerProductionOverviewDto[]> {
    const ownerId = await this.getCompanyIdFromUserId(userId);

    const units = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS, new ReadByIdPayload(ownerId)),
    );
    return units.map(PowerProductionOverviewDto.fromEntity);
  }

  async readHydrogenProductionUnits(userId: string): Promise<HydrogenProductionOverviewDto[]> {
    const ownerId = await this.getCompanyIdFromUserId(userId);
    const units = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS, new ReadByIdPayload(ownerId)),
    );
    return units.map(HydrogenProductionOverviewDto.fromEntity);
  }

  async readHydrogenStorageUnits(userId: string): Promise<HydrogenStorageOverviewDto[]> {
    const ownerId = await this.getCompanyIdFromUserId(userId);

    const units: HydrogenStorageUnitEntity[] = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_HYDROGEN_STORAGE_UNITS, new ReadByIdPayload(ownerId)),
    );
    return units.map(HydrogenStorageOverviewDto.fromEntity);
  }

  async createPowerProductionUnit(dto: PowerProductionUnitInputDto): Promise<PowerProductionUnitDto> {
    return firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.CREATE_POWER_PRODUCTION_UNIT,
        PowerProductionUnitInputDto.toPayload(dto),
      ),
    ).then(PowerProductionUnitDto.fromEntity);
  }

  async createHydrogenProductionUnit(dto: HydrogenProductionUnitInputDto): Promise<HydrogenProductionUnitDto> {
    return firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.CREATE_HYDROGEN_PRODUCTION_UNIT,
        HydrogenProductionUnitInputDto.toPayload(dto),
      ),
    ).then(HydrogenProductionUnitDto.fromEntity);
  }

  async createHydrogenStorageUnit(dto: HydrogenStorageUnitInputDto): Promise<HydrogenStorageUnitDto> {
    return firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.CREATE_HYDROGEN_STORAGE_UNIT,
        HydrogenStorageUnitInputDto.toPayload(dto),
      ),
    ).then(HydrogenStorageUnitDto.fromEntity);
  }

  async updateUnitStatus(id: string, active: boolean): Promise<void> {
    await firstValueFrom(
      this.generalService.send<void>(UnitMessagePatterns.UPDATE_UNIT_STATUS, UnitUpdateActiveDto.toPayload(id, active)),
    );
  }

  async updateHydrogenProductionUnit(id: string, dto: HydrogenProductionUnitInputDto): Promise<void> {
    return await firstValueFrom(
      this.generalService.send<void>(
        UnitMessagePatterns.UPDATE_HYDROGEN_PRODUCTION_UNIT,
        HydrogenProductionUnitInputDto.toPayload(dto, id),
      ),
    );
  }

  async updatePowerProductionUnit(id: string, dto: PowerProductionUnitInputDto): Promise<void> {
    return await firstValueFrom(
      this.generalService.send<void>(
        UnitMessagePatterns.UPDATE_POWER_PRODUCTION_UNIT,
        PowerProductionUnitInputDto.toPayload(dto, id),
      ),
    );
  }
  async updateHydrogenStorageUnit(id: string, dto: HydrogenStorageUnitInputDto): Promise<void> {
    return await firstValueFrom(
      this.generalService.send<void>(
        UnitMessagePatterns.UPDATE_HYDROGEN_STORAGE_UNIT,
        HydrogenStorageUnitInputDto.toPayload(dto, id),
      ),
    );
  }
  private async getCompanyIdFromUserId(id: string): Promise<string> {
    const userDetails = await this.userService.readUserWithCompany(id);
    return userDetails.company.id;
  }
}
