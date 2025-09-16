/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
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

  async readPowerProductionUnits(companyId: string): Promise<PowerProductionUnitEntity[]> {
    return this.unitRepository.findPowerProductionUnitsByCompanyId(companyId);
  }

  async readHydrogenProductionUnits(companyId: string): Promise<HydrogenProductionUnitEntity[]> {
    return this.unitRepository.findHydrogenProductionUnitsByCompanyId(companyId);
  }

  async readHydrogenStorageUnits(companyId: string): Promise<HydrogenStorageUnitEntity[]> {
    return this.unitRepository.findHydrogenStorageUnitsByCompanyId(companyId);
  }

  async readPowerProductionTypes(): Promise<PowerProductionTypeEntity[]> {
    return this.powerProductionTypeRepository.findPowerProductionTypes();
  }
}
