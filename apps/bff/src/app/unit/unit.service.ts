/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { HydrogenBottlingUnitDto } from 'libs/contracts/src/lib/dtos/unit/hydrogen-bottling-unit.dto';
import { HydrogenCompressorUnitDto } from 'libs/contracts/src/lib/dtos/unit/hydrogen-compressor-unit.dto';
import { HydrogenEndUseUnitDto } from 'libs/contracts/src/lib/dtos/unit/hydrogen-end-use-unit.dto';
import { firstValueFrom } from 'rxjs';
import {
  BaseUnitDto,
  getSpecificUnit,
  getSpecificUnitOverview,
  HydrogenBottlingUnitInputDto,
  HydrogenCompressorUnitInputDto,
  HydrogenEndUseUnitInputDto,
  HydrogenProductionUnitDto,
  HydrogenProductionUnitInputDto,
  HydrogenStorageUnitDto,
  HydrogenStorageUnitInputDto,
  HydrogenTransportUnitDto,
  HydrogenTransportUnitInputDto,
  PowerProductionUnitDto,
  PowerProductionUnitInputDto,
  UnitDto,
  UnitOverviewDto,
  UnitUpdateActiveDto,
} from '@h2-trust/contracts/dtos';
import { UnitEntity } from '@h2-trust/contracts/entities';
import { ReadByIdPayload, ReadByOwnerIdAndTypePayload } from '@h2-trust/contracts/payloads';
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

    return getSpecificUnit(unit);
  }

  async readUnits(userId: string, type?: UnitType): Promise<UnitOverviewDto[]> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);

    const units: UnitEntity[] = await firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.READ_BY_OWNER_ID_AND_TYPE,
        new ReadByOwnerIdAndTypePayload(requesterCompanyId, type),
      ),
    );

    return units.map((unit) => getSpecificUnitOverview(unit));
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

  async createHydrogenTransportUnit(
    dto: HydrogenTransportUnitInputDto,
    userId: string,
  ): Promise<HydrogenTransportUnitDto> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);
    const unit = await firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.CREATE_HYDROGEN_TRANSPORT,
        HydrogenTransportUnitInputDto.toPayload(dto, undefined, requesterCompanyId),
      ),
    );
    return HydrogenTransportUnitDto.fromEntity(unit);
  }

  async createHydrogenCompressorUnit(dto: HydrogenCompressorUnitInputDto, userId: string): Promise<BaseUnitDto> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);
    const unit = await firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.CREATE_HYDROGEN_COMPRESSOR,
        HydrogenCompressorUnitInputDto.toPayload(dto, undefined, requesterCompanyId),
      ),
    );
    return HydrogenCompressorUnitDto.fromEntity(unit);
  }

  async createHydrogenBottlingUnit(dto: HydrogenBottlingUnitInputDto, userId: string): Promise<BaseUnitDto> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);
    const unit = await firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.CREATE_HYDROGEN_BOTTLING,
        HydrogenBottlingUnitInputDto.toPayload(dto, undefined, requesterCompanyId),
      ),
    );
    return HydrogenBottlingUnitDto.fromEntity(unit);
  }

  async createHydrogenEndUseUnit(dto: HydrogenEndUseUnitInputDto, userId: string): Promise<BaseUnitDto> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);
    const unit = await firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.CREATE_HYDROGEN_END_USE,
        HydrogenEndUseUnitInputDto.toPayload(dto, undefined, requesterCompanyId),
      ),
    );
    return HydrogenEndUseUnitDto.fromEntity(unit);
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

  async updateHydrogenTransportUnit(id: string, dto: HydrogenTransportUnitInputDto, userId: string): Promise<void> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);
    return firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.UPDATE_HYDROGEN_TRANSPORT,
        HydrogenTransportUnitInputDto.toPayload(dto, id, requesterCompanyId),
      ),
    );
  }

  async updateHydrogenCompressorUnit(id: string, dto: HydrogenCompressorUnitInputDto, userId: string): Promise<void> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);
    return firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.UPDATE_HYDROGEN_COMPRESSOR,
        HydrogenCompressorUnitInputDto.toPayload(dto, id, requesterCompanyId),
      ),
    );
  }

  async updateHydrogenBottlingUnit(id: string, dto: HydrogenBottlingUnitInputDto, userId: string): Promise<void> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);
    return firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.UPDATE_HYDROGEN_BOTTLING,
        HydrogenBottlingUnitInputDto.toPayload(dto, id, requesterCompanyId),
      ),
    );
  }

  async updateHydrogenEndUseUnit(id: string, dto: HydrogenEndUseUnitInputDto, userId: string): Promise<void> {
    const requesterCompanyId = await this.getCompanyIdFromUserId(userId);
    return firstValueFrom(
      this.generalService.send(
        UnitMessagePatterns.UPDATE_HYDROGEN_END_USE,
        HydrogenEndUseUnitInputDto.toPayload(dto, id, requesterCompanyId),
      ),
    );
  }

  private async getCompanyIdFromUserId(id: string): Promise<string> {
    const userWithCompany = await this.userService.readUserWithCompany(id);
    return userWithCompany.company.id;
  }
}
