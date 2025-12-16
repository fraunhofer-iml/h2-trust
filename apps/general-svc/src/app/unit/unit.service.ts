/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  CreateHydrogenProductionUnitPayload,
  CreateHydrogenStorageUnitPayload,
  CreatePowerProductionUnitPayload,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionTypeEntity,
  PowerProductionUnitEntity,
  UnitEntity,
} from '@h2-trust/amqp';
import { PowerProductionTypeRepository, UnitRepository } from '@h2-trust/database';

@Injectable()
export class UnitService {
  constructor(
    private readonly unitRepository: UnitRepository,
    private readonly powerProductionTypeRepository: PowerProductionTypeRepository,
  ) {}

  async readUnit(id: string): Promise<UnitEntity> {
    return this.unitRepository.findUnitById(id);
  }

  async readPowerProductionUnitsByCompanyId(companyId: string): Promise<PowerProductionUnitEntity[]> {
    return this.unitRepository.findPowerProductionUnitsByCompanyId(companyId);
  }

  async readPowerProductionUnitsByIds(ids: string[]): Promise<PowerProductionUnitEntity[]> {
    return this.unitRepository.findPowerProductionUnitsByIds(ids);
  }

  async readHydrogenProductionUnits(companyId: string): Promise<HydrogenProductionUnitEntity[]> {
    return this.unitRepository.findHydrogenProductionUnitsByCompanyId(companyId);
  }

  async readHydrogenProductionUnitsByIds(ids: string[]): Promise<HydrogenProductionUnitEntity[]> {
    return this.unitRepository.findHydrogenProductionUnitsByIds(ids);
  }

  async readHydrogenStorageUnits(companyId: string): Promise<HydrogenStorageUnitEntity[]> {
    return this.unitRepository.findHydrogenStorageUnitsByCompanyId(companyId);
  }

  async readPowerProductionTypes(): Promise<PowerProductionTypeEntity[]> {
    return this.powerProductionTypeRepository.findPowerProductionTypes();
  }

  async createPowerProductionUnit(payload: CreatePowerProductionUnitPayload): Promise<PowerProductionUnitEntity> {
    return this.unitRepository.insertPowerProductionUnit(payload);
  }

  async createHydrogenProductionUnit(payload: CreateHydrogenProductionUnitPayload): Promise<HydrogenProductionUnitEntity> {
    return this.unitRepository.insertHydrogenProductionUnit(payload);
  }

  async createHydrogenStorageUnit(payload: CreateHydrogenStorageUnitPayload): Promise<HydrogenStorageUnitEntity> {
    return this.unitRepository.insertHydrogenStorageUnit(payload);
  }
}
