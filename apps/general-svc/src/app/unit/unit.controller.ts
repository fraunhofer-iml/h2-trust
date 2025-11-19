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
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionTypeEntity,
  PowerProductionUnitEntity,
  UnitEntity,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { UnitService } from './unit.service';

@Controller()
export class UnitController {
  constructor(private readonly service: UnitService) { }

  @MessagePattern(UnitMessagePatterns.READ)
  async readUnit(@Payload() payload: { id: string }): Promise<UnitEntity> {
    return this.service.readUnit(payload.id);
  }

  @MessagePattern(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS)
  async readPowerProductionUnits(@Payload() payload: { companyId: string }): Promise<PowerProductionUnitEntity[]> {
    return this.service.readPowerProductionUnits(payload.companyId);
  }

  @MessagePattern(UnitMessagePatterns.READ_POWER_PRODUCTION_UNITS_BY_IDS)
  async readPowerProductionUnitsByIds(@Payload() payload: { ids: string[] }): Promise<PowerProductionUnitEntity[]> {
    return this.service.readPowerProductionUnitsByIds(payload.ids);
  }

  @MessagePattern(UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS)
  async readHydrogenProductionUnits(
    @Payload() payload: { companyId: string },
  ): Promise<HydrogenProductionUnitEntity[]> {
    return this.service.readHydrogenProductionUnits(payload.companyId);
  }

  @MessagePattern(UnitMessagePatterns.READ_HYDROGEN_STORAGE_UNITS)
  async readHydrogenStorageUnits(@Payload() payload: { companyId: string }): Promise<HydrogenStorageUnitEntity[]> {
    return this.service.readHydrogenStorageUnits(payload.companyId);
  }

  @MessagePattern(UnitMessagePatterns.READ_POWER_PRODUCTION_TYPES)
  async readPowerProductionTypes(): Promise<PowerProductionTypeEntity[]> {
    return this.service.readPowerProductionTypes();
  }

  @MessagePattern(UnitMessagePatterns.CREATE_POWER_PRODUCTION_UNIT)
  async createPowerProductionUnit(
    @Payload() payload: { unit: PowerProductionUnitEntity },
  ): Promise<PowerProductionUnitEntity> {
    return this.service.createPowerProductionUnit(payload.unit);
  }

  @MessagePattern(UnitMessagePatterns.CREATE_HYDROGEN_PRODUCTION_UNIT)
  async createHydrogenProductionUnit(
    @Payload() payload: { unit: HydrogenProductionUnitEntity },
  ): Promise<HydrogenProductionUnitEntity> {
    return this.service.createHydrogenProductionUnit(payload.unit);
  }

  @MessagePattern(UnitMessagePatterns.CREATE_HYDROGEN_STORAGE_UNIT)
  async createHydrogenStorageUnit(
    @Payload() payload: { unit: HydrogenStorageUnitEntity },
  ): Promise<HydrogenStorageUnitEntity> {
    return this.service.createHydrogenStorageUnit(payload.unit);
  }
}
