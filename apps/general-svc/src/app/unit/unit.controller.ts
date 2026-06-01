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
  BaseUnitEntity,
  ConcreteUnitEntity,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionUnitEntity,
  TransportUnitEntity,
} from '@h2-trust/contracts/entities';
import {
  BaseCreateUnitPayload,
  CreateHydrogenProductionUnitPayload,
  CreateHydrogenStorageUnitPayload,
  CreateHydrogenTransportUnitPayload,
  CreatePowerProductionUnitPayload,
  ReadByIdPayload,
  ReadByIdsPayload,
  ReadByOwnerIdAndTypePayload,
  UpdateUnitStatusPayload,
} from '@h2-trust/contracts/payloads';
import { UnitMessagePatterns } from '@h2-trust/messaging';
import { UnitService } from './unit.service';

@Controller()
export class UnitController {
  constructor(private readonly service: UnitService) {}

  @MessagePattern(UnitMessagePatterns.READ_BY_ID)
  readUnit(payload: ReadByIdPayload): Promise<ConcreteUnitEntity> {
    return this.service.readUnitById(payload.id);
  }

  @MessagePattern(UnitMessagePatterns.READ_MANY_BY_IDS)
  readUnits(payload: ReadByIdsPayload): Promise<ConcreteUnitEntity[]> {
    return this.service.readUnitsByIds(payload.ids);
  }

  @MessagePattern(UnitMessagePatterns.READ_BY_OWNER_ID_AND_TYPE)
  readUnitsByOwnerIdAndType(payload: ReadByOwnerIdAndTypePayload): Promise<ConcreteUnitEntity[]> {
    return this.service.readUnitsByOwnerIdAndType(payload.id, payload.type);
  }

  @MessagePattern(UnitMessagePatterns.CREATE_POWER_PRODUCTION)
  createPowerProductionUnit(payload: CreatePowerProductionUnitPayload): Promise<PowerProductionUnitEntity> {
    return this.service.updateOrCreatePowerProductionUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.CREATE_HYDROGEN_PRODUCTION)
  createHydrogenProductionUnit(payload: CreateHydrogenProductionUnitPayload): Promise<HydrogenProductionUnitEntity> {
    return this.service.updateOrCreateHydrogenProductionUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.CREATE_HYDROGEN_STORAGE)
  createHydrogenStorageUnit(payload: CreateHydrogenStorageUnitPayload): Promise<HydrogenStorageUnitEntity> {
    return this.service.updateOrCreateHydrogenStorageUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.CREATE_HYDROGEN_TRANSPORT)
  createHydrogenTransportUnit(payload: CreateHydrogenTransportUnitPayload): Promise<TransportUnitEntity> {
    return this.service.updateOrCreateHydrogenTransportUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.CREATE_BASE_UNIT)
  createBaseUnit(payload: BaseCreateUnitPayload): Promise<BaseUnitEntity> {
    return this.service.updateOrCreateBaseUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.UPDATE_HYDROGEN_PRODUCTION)
  updateHydrogenProductionUnit(payload: CreateHydrogenProductionUnitPayload): Promise<HydrogenProductionUnitEntity> {
    return this.service.updateOrCreateHydrogenProductionUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.UPDATE_POWER_PRODUCTION)
  updatePowerProductionUnit(payload: CreatePowerProductionUnitPayload): Promise<PowerProductionUnitEntity> {
    return this.service.updateOrCreatePowerProductionUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.UPDATE_HYDROGEN_STORAGE)
  updateHydrogenStorageUnit(payload: CreateHydrogenStorageUnitPayload): Promise<HydrogenStorageUnitEntity> {
    return this.service.updateOrCreateHydrogenStorageUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.UPDATE_HYDROGEN_TRANSPORT)
  updateHydrogenTransportUnit(payload: CreateHydrogenTransportUnitPayload): Promise<TransportUnitEntity> {
    return this.service.updateOrCreateHydrogenTransportUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.UPDATE_BASE_UNIT)
  updateBaseUnit(payload: BaseCreateUnitPayload): Promise<BaseUnitEntity> {
    return this.service.updateOrCreateBaseUnit(payload);
  }

  @MessagePattern(UnitMessagePatterns.UPDATE_STATUS)
  updateUnitStatus(payload: UpdateUnitStatusPayload): Promise<BaseUnitEntity> {
    return this.service.updateUnitStatus(payload);
  }
}
