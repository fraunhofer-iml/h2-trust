/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerQueues,
  CreateProductionEntity,
  CreateProductionsPayload,
  FinalizeProductionsPayload,
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ReadByIdPayload,
  StagedProductionEntity,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { StagedProductionRepository } from '@h2-trust/database';
import { PowerType } from '@h2-trust/domain';
import { ProductionCreationService } from './production-creation.service';
import { ProductionUtils } from './utils/production.utils';

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly productionChunkSize: number;

  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    private readonly configurationService: ConfigurationService,
    private readonly productionCreationService: ProductionCreationService,
    private readonly stagedProductionRepository: StagedProductionRepository,
  ) {
    this.productionChunkSize = this.configurationService.getProcessSvcConfiguration().productionChunkSize;
  }

  async finalizeProductions(payload: FinalizeProductionsPayload): Promise<ProcessStepEntity[]> {
    const stagedProductions: StagedProductionEntity[] =
      await this.stagedProductionRepository.getStagedProductionsByCsvImportId(payload.importId);

    const createProductions: CreateProductionEntity[] = (
      await Promise.all(
        stagedProductions.map(async (stagedProduction) => {
          const powerProductionUnit: PowerProductionUnitEntity = await firstValueFrom(
            this.generalSvc.send(UnitMessagePatterns.READ, new ReadByIdPayload(stagedProduction.powerProductionUnitId)),
          );
          const createProductionEntity: CreateProductionEntity = new CreateProductionEntity(
            stagedProduction.startedAt,
            new Date(new Date(stagedProduction.startedAt).setMinutes(59, 59, 999)),
            stagedProduction.powerProductionUnitId,
            PowerType.RENEWABLE,
            stagedProduction.powerAmount,
            stagedProduction.hydrogenProductionUnitId,
            stagedProduction.hydrogenAmount,
            payload.recordedBy,
            stagedProduction.hydrogenColor,
            payload.hydrogenStorageUnitId,
            stagedProduction.powerProductionUnitOwnerId,
            stagedProduction.hydrogenProductionUnitOwnerId,
            stagedProduction.waterConsumptionLitersPerHour,
          );
          return ProductionUtils.splitGridPowerProduction(
            createProductionEntity,
            powerProductionUnit.type.energySource,
          );
        }),
      )
    ).flatMap((x) => x);

    this.logger.debug(
      `Finalizing ${createProductions.length} staged productions in chunks of ${this.productionChunkSize}`,
    );
    return this.productionCreationService.createAndPersistProcessSteps(createProductions);
  }

  async createProductions(payload: CreateProductionsPayload): Promise<ProcessStepEntity[]> {
    const powerProductionUnit: PowerProductionUnitEntity = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ, new ReadByIdPayload(payload.powerProductionUnitId)),
    );

    const hydrogenProductionUnit: HydrogenProductionUnitEntity = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ, new ReadByIdPayload(payload.hydrogenProductionUnitId)),
    );

    const createProductionEntity: CreateProductionEntity = new CreateProductionEntity(
      payload.productionStartedAt,
      payload.productionEndedAt,
      payload.powerProductionUnitId,
      PowerType.RENEWABLE,
      payload.powerAmountKwh,
      payload.hydrogenProductionUnitId,
      payload.hydrogenAmountKg,
      payload.userId,
      powerProductionUnit.type.hydrogenColor,
      payload.hydrogenStorageUnitId,
      powerProductionUnit.owner.id,
      hydrogenProductionUnit.owner.id,
      hydrogenProductionUnit.waterConsumptionLitersPerHour,
    );

    const createProductionEntities: CreateProductionEntity[] = ProductionUtils.splitGridPowerProduction(
      createProductionEntity,
      powerProductionUnit.type.energySource,
    );

    return this.productionCreationService.createAndPersistProcessSteps(createProductionEntities);
  }
}
