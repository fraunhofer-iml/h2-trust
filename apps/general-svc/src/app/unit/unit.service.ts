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
import { DomainException, ErrorCode } from '@h2-trust/exceptions';
import { assertDefined } from '@h2-trust/utils';

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

  async updateOrCreateHydrogenProductionUnit(
    payload: CreateHydrogenProductionUnitPayload,
  ): Promise<HydrogenProductionUnitEntity> {
    if (payload.id) {
      await this.assertOwnership(payload.id, payload.requesterCompanyId);
    }
    return this.unitRepository.updateOrCreateHydrogenProductionUnit(payload);
  }

  async updateOrCreatePowerProductionUnit(
    payload: CreatePowerProductionUnitPayload,
  ): Promise<PowerProductionUnitEntity> {
    if (payload.id) {
      await this.assertOwnership(payload.id, payload.requesterCompanyId);
    }
    return this.unitRepository.updateOrCreatePowerProductionUnit(payload);
  }

  async updateOrCreateHydrogenStorageUnit(
    payload: CreateHydrogenStorageUnitPayload,
  ): Promise<HydrogenStorageUnitEntity> {
    if (payload.id) {
      await this.assertOwnership(payload.id, payload.requesterCompanyId);
    }
    return this.unitRepository.updateOrCreateHydrogenStorageUnit(payload);
  }

  async updateUnitStatus(payload: UpdateUnitStatusPayload): Promise<BaseUnitEntity> {
    await this.assertOwnership(payload.id, payload.requesterCompanyId);
    return this.unitRepository.updateUnitStatus(payload);
  }

  private async assertOwnership(unitId: string, requesterCompanyId: string | undefined): Promise<void> {
    assertDefined(requesterCompanyId, 'requesterCompanyId');
    const unit = await this.unitRepository.findUnitById(unitId);
    if (unit.owner.id !== requesterCompanyId) {
      throw new DomainException(
        ErrorCode.DOMAIN_BUSINESS_RULE_VIOLATION,
        `Requester is not authorized to update unit '${unitId}'.`,
      );
    }
  }
}
