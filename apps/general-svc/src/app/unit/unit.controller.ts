/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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
  constructor(private readonly service: UnitService) { }

  @MessagePattern(UnitMessagePatterns.READ)
  async readUnit(@Payload() payload: ReadByIdPayload): Promise<UnitEntity> {
    return this.service.readUnit(payload.id);
  }

  @MessagePattern(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS)
  async readPowerProductionUnitsByCompanyId(@Payload() payload: ReadByIdPayload): Promise<PowerProductionUnitEntity[]> {
    return this.service.readPowerProductionUnitsByCompanyId(payload.id);
  }

  @MessagePattern(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS)
  async readPowerProductionUnitsByIds(@Payload() payload: ReadByIdsPayload): Promise<PowerProductionUnitEntity[]> {
    return this.service.readPowerProductionUnitsByIds(payload.ids);
  }

  @MessagePattern(UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS)
  async readHydrogenProductionUnits(@Payload() payload: ReadByIdPayload): Promise<HydrogenProductionUnitEntity[]> {
    return this.service.readHydrogenProductionUnits(payload.id);
  }

  @MessagePattern(UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS_BY_IDS)
  async readHydrogenProductionUnitsByIds(@Payload() payload: ReadByIdsPayload): Promise<HydrogenProductionUnitEntity[]> {
    return this.service.readHydrogenProductionUnitsByIds(payload.ids);
  }

  @MessagePattern(UnitMessagePatterns.READ_HYDROGEN_STORAGE_UNITS)
  async readHydrogenStorageUnits(@Payload() payload: ReadByIdPayload): Promise<HydrogenStorageUnitEntity[]> {
    return this.service.readHydrogenStorageUnits(payload.id);
  }

  @MessagePattern(UnitMessagePatterns.READ_POWER_PRODUCTION_TYPES)
  async readPowerProductionTypes(): Promise<PowerProductionTypeEntity[]> {
    return this.service.readPowerProductionTypes();
  }

  @MessagePattern(UnitMessagePatterns.CREATE_POWER_PRODUCTION_UNIT)
  async createPowerProductionUnit(@Payload() payload: CreatePowerProductionUnitPayload): Promise<PowerProductionUnitEntity> {
    return this.service.createPowerProductionUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.CREATE_HYDROGEN_PRODUCTION_UNIT)
  async createHydrogenProductionUnit(@Payload() payload: CreateHydrogenProductionUnitPayload): Promise<HydrogenProductionUnitEntity> {
    return this.service.createHydrogenProductionUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.CREATE_HYDROGEN_STORAGE_UNIT)
  async createHydrogenStorageUnit(@Payload() payload: CreateHydrogenStorageUnitPayload): Promise<HydrogenStorageUnitEntity> {
    return this.service.createHydrogenStorageUnit(payload);
  }
}
