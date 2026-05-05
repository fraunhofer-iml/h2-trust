/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  BaseUnitEntity,
  ConcreteUnitEntity,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionTypeEntity,
  PowerProductionUnitEntity,
} from '@h2-trust/contracts/entities';
import {
  CreateHydrogenProductionUnitPayload,
  CreateHydrogenStorageUnitPayload,
  CreatePowerProductionUnitPayload,
  ReadByIdPayload,
  ReadByIdsPayload,
  UpdateUnitStatusPayload,
} from '@h2-trust/contracts/payloads';
import { PowerProductionTypeRepository, UnitRepository } from '@h2-trust/database';

@Injectable()
export class UnitService {
  constructor(
    private readonly unitRepository: UnitRepository,
    private readonly powerProductionTypeRepository: PowerProductionTypeRepository,
  ) {}

  readUnitById(id: string): Promise<ConcreteUnitEntity> {
    return this.unitRepository.findUnitById(id);
  }

  readUnitsByIds(ids: string[]): Promise<ConcreteUnitEntity[]> {
    return this.unitRepository.findUnitsByIds(ids);
  }

  readPowerProductionUnitsByOwnerId(payload: ReadByIdPayload): Promise<PowerProductionUnitEntity[]> {
    return this.unitRepository.findPowerProductionUnitsByOwnerId(payload.id);
  }

  readPowerProductionUnitsByIds(payload: ReadByIdsPayload): Promise<PowerProductionUnitEntity[]> {
    return this.unitRepository.findPowerProductionUnitsByIds(payload.ids);
  }

  readHydrogenProductionUnitsByOwnerId(payload: ReadByIdPayload): Promise<HydrogenProductionUnitEntity[]> {
    return this.unitRepository.findHydrogenProductionUnitsByOwnerId(payload.id);
  }

  readHydrogenProductionUnitsByIds(payload: ReadByIdsPayload): Promise<HydrogenProductionUnitEntity[]> {
    return this.unitRepository.findHydrogenProductionUnitsByIds(payload.ids);
  }

  readHydrogenStorageUnitsByOwnerId(payload: ReadByIdPayload): Promise<HydrogenStorageUnitEntity[]> {
    return this.unitRepository.findHydrogenStorageUnitsByOwnerId(payload.id);
  }

  readPowerProductionTypes(): Promise<PowerProductionTypeEntity[]> {
    return this.powerProductionTypeRepository.findPowerProductionTypes();
  }

  updateOrCreateHydrogenProductionUnit(
    payload: CreateHydrogenProductionUnitPayload,
  ): Promise<HydrogenProductionUnitEntity> {
    return this.unitRepository.updateOrCreateHydrogenProductionUnit(payload);
  }

  updateOrCreatePowerProductionUnit(payload: CreatePowerProductionUnitPayload): Promise<PowerProductionUnitEntity> {
    return this.unitRepository.updateOrCreatePowerProductionUnit(payload);
  }

  updateOrCreateHydrogenStorageUnit(payload: CreateHydrogenStorageUnitPayload): Promise<HydrogenStorageUnitEntity> {
    return this.unitRepository.updateOrCreateHydrogenStorageUnit(payload);
  }

  updateUnitStatus(payload: UpdateUnitStatusPayload): Promise<BaseUnitEntity> {
    return this.unitRepository.updateUnitStatus(payload);
  }
}
