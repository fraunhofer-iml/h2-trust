/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerQueues,
  CreateHydrogenProductionUnitPayload,
  CreateHydrogenStorageUnitPayload,
  CreatePowerProductionUnitPayload,
  DigitalProductPassportPatterns,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionTypeEntity,
  PowerProductionUnitEntity,
  ReadByIdPayload,
  ReadByIdsPayload,
  UnitEntity,
} from '@h2-trust/amqp';
import { PowerProductionTypeRepository, UnitRepository } from '@h2-trust/database';

@Injectable()
export class UnitService {
  constructor(
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processService: ClientProxy,
    private readonly unitRepository: UnitRepository,
    private readonly powerProductionTypeRepository: PowerProductionTypeRepository,
  ) {}

  async readUnitById(id: string): Promise<UnitEntity> {
    return this.unitRepository.findUnitById(id);
  }

  async readPowerProductionUnitsByOwnerId(payload: ReadByIdPayload): Promise<PowerProductionUnitEntity[]> {
    return this.unitRepository.findPowerProductionUnitsByOwnerId(payload.id);
  }

  async readPowerProductionUnitsByIds(payload: ReadByIdsPayload): Promise<PowerProductionUnitEntity[]> {
    return this.unitRepository.findPowerProductionUnitsByIds(payload.ids);
  }

  async readHydrogenProductionUnitsByOwnerId(payload: ReadByIdPayload): Promise<HydrogenProductionUnitEntity[]> {
    return this.unitRepository.findHydrogenProductionUnitsByOwnerId(payload.id);
  }

  async readHydrogenProductionUnitsByIds(payload: ReadByIdsPayload): Promise<HydrogenProductionUnitEntity[]> {
    return this.unitRepository.findHydrogenProductionUnitsByIds(payload.ids);
  }

  async readHydrogenStorageUnitsByOwnerId(payload: ReadByIdPayload): Promise<HydrogenStorageUnitEntity[]> {
    const hydrogenStorageUnits: HydrogenStorageUnitEntity[] =
      await this.unitRepository.findHydrogenStorageUnitsByOwnerId(payload.id);

    //TODO-LG: Increase efficiency
    for (let i = 0; i < hydrogenStorageUnits.length; i++) {
      //const fillingProcessStepIds = hydrogenStorageUnits[i].filling.map((batch) => batch.processId);

      for (let j = 0; j < hydrogenStorageUnits[i].filling.length; j++) {
        const rfnboType: string = await firstValueFrom(
          this.processService.send(
            DigitalProductPassportPatterns.READ_RFNBO_STATUS,
            new ReadByIdPayload(hydrogenStorageUnits[i].filling[j].processId),
          ),
        );
        hydrogenStorageUnits[i].filling[j].rfnbo = rfnboType;
      }
    }
    return hydrogenStorageUnits;
  }

  async readPowerProductionTypes(): Promise<PowerProductionTypeEntity[]> {
    return this.powerProductionTypeRepository.findPowerProductionTypes();
  }

  async createPowerProductionUnit(payload: CreatePowerProductionUnitPayload): Promise<PowerProductionUnitEntity> {
    return this.unitRepository.insertPowerProductionUnit(payload);
  }

  async createHydrogenProductionUnit(
    payload: CreateHydrogenProductionUnitPayload,
  ): Promise<HydrogenProductionUnitEntity> {
    return this.unitRepository.insertHydrogenProductionUnit(payload);
  }

  async createHydrogenStorageUnit(payload: CreateHydrogenStorageUnitPayload): Promise<HydrogenStorageUnitEntity> {
    return this.unitRepository.insertHydrogenStorageUnit(payload);
  }
}
