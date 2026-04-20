/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  UnitMessagePatterns,
} from '@h2-trust/messaging';
import { UnitService } from './unit.service';
import { BaseUnitEntity, ConcreteUnitEntity, CreateHydrogenProductionUnitPayload, CreateHydrogenStorageUnitPayload, CreatePowerProductionUnitPayload, HydrogenProductionUnitEntity, HydrogenStorageUnitEntity, PowerProductionTypeEntity, PowerProductionUnitEntity, ReadByIdPayload, ReadByIdsPayload, UpdateUnitStatusPayload } from '@h2-trust/contracts';

@Controller()
export class UnitController {
  constructor(private readonly service: UnitService) { }

  @MessagePattern(UnitMessagePatterns.READ)
  async readUnit(payload: ReadByIdPayload): Promise<ConcreteUnitEntity> {
    return this.service.readUnitById(payload.id);
  }

  @MessagePattern(UnitMessagePatterns.READ_MANY)
  async readUnits(payload: ReadByIdsPayload): Promise<ConcreteUnitEntity[]> {
    return this.service.readUnitsByIds(payload.ids);
  }

  @MessagePattern(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS)
  async readPowerProductionUnitsByOwnerId(payload: ReadByIdPayload): Promise<PowerProductionUnitEntity[]> {
    return this.service.readPowerProductionUnitsByOwnerId(payload);
  }

  @MessagePattern(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS)
  async readPowerProductionUnitsByIds(payload: ReadByIdsPayload): Promise<PowerProductionUnitEntity[]> {
    return this.service.readPowerProductionUnitsByIds(payload);
  }

  @MessagePattern(UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS)
  async readHydrogenProductionUnits(payload: ReadByIdPayload): Promise<HydrogenProductionUnitEntity[]> {
    return this.service.readHydrogenProductionUnitsByOwnerId(payload);
  }

  @MessagePattern(UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS_BY_IDS)
  async readHydrogenProductionUnitsByIds(payload: ReadByIdsPayload): Promise<HydrogenProductionUnitEntity[]> {
    return this.service.readHydrogenProductionUnitsByIds(payload);
  }

  @MessagePattern(UnitMessagePatterns.READ_HYDROGEN_STORAGE_UNITS)
  async readHydrogenStorageUnits(payload: ReadByIdPayload): Promise<HydrogenStorageUnitEntity[]> {
    return this.service.readHydrogenStorageUnitsByOwnerId(payload);
  }

  @MessagePattern(UnitMessagePatterns.READ_POWER_PRODUCTION_TYPES)
  async readPowerProductionTypes(): Promise<PowerProductionTypeEntity[]> {
    return this.service.readPowerProductionTypes();
  }

  @MessagePattern(UnitMessagePatterns.CREATE_POWER_PRODUCTION_UNIT)
  async createPowerProductionUnit(payload: CreatePowerProductionUnitPayload): Promise<PowerProductionUnitEntity> {
    return this.service.updateOrCreatePowerProductionUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.CREATE_HYDROGEN_PRODUCTION_UNIT)
  async createHydrogenProductionUnit(
    payload: CreateHydrogenProductionUnitPayload,
  ): Promise<HydrogenProductionUnitEntity> {
    return this.service.updateOrCreateHydrogenProductionUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.CREATE_HYDROGEN_STORAGE_UNIT)
  async createHydrogenStorageUnit(payload: CreateHydrogenStorageUnitPayload): Promise<HydrogenStorageUnitEntity> {
    return this.service.updateOrCreateHydrogenStorageUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.UPDATE_HYDROGEN_PRODUCTION_UNIT)
  async updateHydrogenProductionUnit(
    payload: CreateHydrogenProductionUnitPayload,
  ): Promise<HydrogenProductionUnitEntity> {
    return this.service.updateOrCreateHydrogenProductionUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.UPDATE_POWER_PRODUCTION_UNIT)
  async updatePowerProductionUnit(payload: CreatePowerProductionUnitPayload): Promise<PowerProductionUnitEntity> {
    return this.service.updateOrCreatePowerProductionUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.UPDATE_HYDROGEN_STORAGE_UNIT)
  async updateHydrogenStorageUnit(payload: CreateHydrogenStorageUnitPayload): Promise<HydrogenStorageUnitEntity> {
    return this.service.updateOrCreateHydrogenStorageUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.UPDATE_UNIT_STATUS)
  async updateUnitStatus(payload: UpdateUnitStatusPayload): Promise<BaseUnitEntity> {
    return this.service.updateUnitStatus(payload);
  }
}
