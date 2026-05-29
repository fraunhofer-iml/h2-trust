/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
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
  UnitDto,
  UnitOverviewDto,
  UnitUpdateActiveDto,
} from '@h2-trust/contracts/dtos';
import { HydrogenStorageUnitEntity } from '@h2-trust/contracts/entities';
import { ReadByIdPayload } from '@h2-trust/contracts/payloads';
import { UnitType } from '@h2-trust/domain';
import { QUEUE_GENERAL_SVC, UnitMessagePatterns } from '@h2-trust/messaging';
import { UserService } from '../user/user.service';

@Injectable()
export class UnitService {
  constructor(
    @Inject(QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    private readonly userService: UserService,
  ) {}

  async readUnitById(id: string): Promise<UnitDto> {
    const unit = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_BY_ID, new ReadByIdPayload(id)),
    );

    switch (unit.unitType) {
      case UnitType.POWER_PRODUCTION:
        return PowerProductionUnitDto.fromEntity(unit);
      case UnitType.HYDROGEN_PRODUCTION:
        return HydrogenProductionUnitDto.fromEntity(unit);
      case UnitType.HYDROGEN_STORAGE:
        return HydrogenStorageUnitDto.fromEntity(unit);
    }

    throw new BadRequestException('Unknown unit type');
  }

  async readUnits(userId: string, type?: UnitType): Promise<UnitOverviewDto[]> {
    if (type === UnitType.POWER_PRODUCTION) {
      return this.readPowerProductionUnits(userId);
    }

    if (type === UnitType.HYDROGEN_PRODUCTION) {
      return this.readHydrogenProductionUnits(userId);
    }

    if (type === UnitType.HYDROGEN_STORAGE) {
      return this.readHydrogenStorageUnits(userId);
    }

    if (type) {
      return [];
    }

    const [powerProduction, hydrogenProduction, hydrogenStorage] = await Promise.all([
      this.readPowerProductionUnits(userId),
      this.readHydrogenProductionUnits(userId),
      this.readHydrogenStorageUnits(userId),
    ]);

    return [...powerProduction, ...hydrogenProduction, ...hydrogenStorage];
  }

  async readPowerProductionUnit(id: string): Promise<PowerProductionUnitDto> {
    const unit = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_BY_ID, new ReadByIdPayload(id)),
    );
    return PowerProductionUnitDto.fromEntity(unit);
  }

  async readHydrogenProductionUnit(id: string): Promise<HydrogenProductionUnitDto> {
    const unit = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_BY_ID, new ReadByIdPayload(id)),
    );
    return HydrogenProductionUnitDto.fromEntity(unit);
  }

  async readHydrogenStorageUnit(id: string): Promise<HydrogenStorageUnitDto> {
    const unit = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_BY_ID, new ReadByIdPayload(id)),
    );
    return HydrogenStorageUnitDto.fromEntity(unit);
  }

  async readPowerProductionUnits(userId: string): Promise<PowerProductionOverviewDto[]> {
    const ownerId = await this.getCompanyIdFromUserId(userId);

    const units = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_POWER_PRODUCTION, new ReadByIdPayload(ownerId)),
    );
    return units.map(PowerProductionOverviewDto.fromEntity);
  }

  async readHydrogenProductionUnits(userId: string): Promise<HydrogenProductionOverviewDto[]> {
    const ownerId = await this.getCompanyIdFromUserId(userId);
    const units = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_HYDROGEN_PRODUCTION, new ReadByIdPayload(ownerId)),
    );
    return units.map(HydrogenProductionOverviewDto.fromEntity);
  }

  async readHydrogenStorageUnits(userId: string): Promise<HydrogenStorageOverviewDto[]> {
    const ownerId = await this.getCompanyIdFromUserId(userId);

    const units: HydrogenStorageUnitEntity[] = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ_HYDROGEN_STORAGE, new ReadByIdPayload(ownerId)),
    );
    return units.map(HydrogenStorageOverviewDto.fromEntity);
  }

  async createPowerProductionUnit(dto: PowerProductionUnitInputDto, userId: string): Promise<PowerProductionUnitDto> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);
    const unit = await firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.CREATE_POWER_PRODUCTION,
        PowerProductionUnitInputDto.toPayload(dto, undefined, requesterCompanyId),
      ),
    );
    return PowerProductionUnitDto.fromEntity(unit);
  }

  async createHydrogenProductionUnit(
    dto: HydrogenProductionUnitInputDto,
    userId: string,
  ): Promise<HydrogenProductionUnitDto> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);
    const unit = await firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.CREATE_HYDROGEN_PRODUCTION,
        HydrogenProductionUnitInputDto.toPayload(dto, undefined, requesterCompanyId),
      ),
    );
    return HydrogenProductionUnitDto.fromEntity(unit);
  }

  async createHydrogenStorageUnit(dto: HydrogenStorageUnitInputDto, userId: string): Promise<HydrogenStorageUnitDto> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);
    const unit = await firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.CREATE_HYDROGEN_STORAGE,
        HydrogenStorageUnitInputDto.toPayload(dto, undefined, requesterCompanyId),
      ),
    );
    return HydrogenStorageUnitDto.fromEntity(unit);
  }

  async updateUnitStatus(id: string, active: boolean, userId: string): Promise<void> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);
    return firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.UPDATE_STATUS,
        UnitUpdateActiveDto.toPayload(id, active, requesterCompanyId),
      ),
    );
  }

  async updateHydrogenProductionUnit(id: string, dto: HydrogenProductionUnitInputDto, userId: string): Promise<void> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);
    return firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.UPDATE_HYDROGEN_PRODUCTION,
        HydrogenProductionUnitInputDto.toPayload(dto, id, requesterCompanyId),
      ),
    );
  }

  async updatePowerProductionUnit(id: string, dto: PowerProductionUnitInputDto, userId: string): Promise<void> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);
    return firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.UPDATE_POWER_PRODUCTION,
        PowerProductionUnitInputDto.toPayload(dto, id, requesterCompanyId),
      ),
    );
  }

  async updateHydrogenStorageUnit(id: string, dto: HydrogenStorageUnitInputDto, userId: string): Promise<void> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);
    return firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.UPDATE_HYDROGEN_STORAGE,
        HydrogenStorageUnitInputDto.toPayload(dto, id, requesterCompanyId),
      ),
    );
  }
  private async getCompanyIdFromUserId(id: string): Promise<string> {
    const userWithCompany = await this.userService.readUserWithCompany(id);
    return userWithCompany.company.id;
  }
}
