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
  CreateHydrogenProductionUnitPayload,
  CreateHydrogenStorageUnitPayload,
  CreatePowerProductionUnitPayload,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionTypeEntity,
  PowerProductionUnitEntity,
  ReadByIdPayload,
  ReadByIdsPayload,
  UnitEntity,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { UnitService } from './unit.service';

@Controller()
export class UnitController {
  constructor(private readonly service: UnitService) {}

  @MessagePattern(UnitMessagePatterns.READ)
  async readUnit(payload: ReadByIdPayload): Promise<UnitEntity> {
    return this.service.readUnitById(payload.id);
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
    return this.service.createPowerProductionUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.CREATE_HYDROGEN_PRODUCTION_UNIT)
  async createHydrogenProductionUnit(
    payload: CreateHydrogenProductionUnitPayload,
  ): Promise<HydrogenProductionUnitEntity> {
    return this.service.createHydrogenProductionUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.CREATE_HYDROGEN_STORAGE_UNIT)
  async createHydrogenStorageUnit(payload: CreateHydrogenStorageUnitPayload): Promise<HydrogenStorageUnitEntity> {
    return this.service.createHydrogenStorageUnit(payload);
  }
}
