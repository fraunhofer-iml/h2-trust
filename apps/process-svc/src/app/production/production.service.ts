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
  BatchEntity,
  BrokerQueues,
  CreateHydrogenProductionStatisticsPayload,
  CreateProductionEntity,
  CreateProductionsPayload,
  FinalizeProductionsPayload,
  HydrogenProductionUnitEntity,
  HydrogenStatisticsEntity,
  PowerProductionUnitEntity,
  PowerStatisticsEntity,
  ProcessStepEntity,
  ProductionStatisticsEntity,
  ReadByIdPayload,
  ReadByIdsPayload,
  StagedProductionEntity,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { StagedProductionRepository } from '@h2-trust/database';
import { BatchType, PowerType, ProcessType, RfnboType } from '@h2-trust/domain';
import { ProcessStepService } from '../process-step/process-step.service';
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
    private readonly processStepService: ProcessStepService,
  ) {
    this.productionChunkSize = this.configurationService.getProcessSvcConfiguration().productionChunkSize;
  }

  async finalizeProductions(payload: FinalizeProductionsPayload): Promise<ProcessStepEntity[]> {
    const stagedProductions: StagedProductionEntity[] =
      await this.stagedProductionRepository.getStagedProductionsByCsvImportId(payload.importId);

    const powerProductionUnits: PowerProductionUnitEntity[] = await firstValueFrom(
      this.generalSvc.send(
        UnitMessagePatterns.READ_MANY,
        new ReadByIdsPayload(
          Array.from(new Set(stagedProductions.map((stagedProduction) => stagedProduction.powerProductionUnitId))),
        ),
      ),
    );

    const powerProductionUnitById = new Map<string, PowerProductionUnitEntity>(
      powerProductionUnits.map((powerProductionUnit) => [powerProductionUnit.id, powerProductionUnit]),
    );

    const createProductions: CreateProductionEntity[] = stagedProductions
      .map((stagedProduction) => {
        const powerProductionUnit: PowerProductionUnitEntity = powerProductionUnitById.get(
          stagedProduction.powerProductionUnitId,
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
        return ProductionUtils.splitGridPowerProduction(createProductionEntity, powerProductionUnit.type.energySource);
      })
      .flatMap((x) => x);

    this.logger.debug(
      `Finalizing ${createProductions.length} staged productions in chunks of ${this.productionChunkSize}`,
    );
    return this.productionCreationService.createAndPersistProductions(createProductions);
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

    return this.productionCreationService.createAndPersistProductions(createProductionEntities);
  }

  async assembleProductionStatistics(
    payload: CreateHydrogenProductionStatisticsPayload,
  ): Promise<ProductionStatisticsEntity> {
    const hydrogenProcesses: ProcessStepEntity[] =
      await this.processStepService.readProcessStepsByPredecessorTypesAndUnitAndDate(
        [ProcessType.POWER_PRODUCTION],
        payload,
      );

    const invalidProcessTypes = [
      ...new Set(
        hydrogenProcesses
          .filter((processStep) => processStep.type !== ProcessType.HYDROGEN_PRODUCTION)
          .map((processStep) => processStep.type),
      ),
    ];

    if (invalidProcessTypes.length > 0) {
      throw new Error(
        `Expected only ${ProcessType.HYDROGEN_PRODUCTION} process steps, but received: ${invalidProcessTypes.join(', ')}`,
      );
    }

    const hydrogenStatistics = this.assembleHydrogenStatistics(hydrogenProcesses);

    const powerStatistics = this.assemblePowerStatistics(hydrogenProcesses);

    return new ProductionStatisticsEntity(hydrogenStatistics, powerStatistics);
  }

  private assembleHydrogenStatistics(processSteps: ProcessStepEntity[]): HydrogenStatisticsEntity {
    const {
      nonCertifiable,
      rfnboReady,
    }: {
      nonCertifiable: number;
      rfnboReady: number;
    } = processSteps.reduce(
      (statistics, processStep) => {
        const qualityDetails = processStep.batch.qualityDetails;
        if (!processStep.batch.active || !qualityDetails) {
          return statistics;
        }
        switch (qualityDetails.rfnboType) {
          case RfnboType.RFNBO_READY:
            statistics.rfnboReady += processStep.batch.amount;
            break;
          case RfnboType.NON_CERTIFIABLE:
            statistics.nonCertifiable += processStep.batch.amount;
            break;
          default:
            throw new Error(`Rfnbotype of ${processStep.id} not defined`);
        }
        return statistics;
      },
      { nonCertifiable: 0, rfnboReady: 0 },
    );
    return new HydrogenStatisticsEntity(nonCertifiable, rfnboReady);
  }

  private assemblePowerStatistics(processSteps: ProcessStepEntity[]): PowerStatisticsEntity {
    const batches: BatchEntity[] = processSteps
      .map((ps) => (ps.batch.predecessors ?? []).filter((batch) => batch.type === BatchType.POWER))
      .flat();
    const { renewable, partlyRenewable, nonRenewable } = batches.reduce(
      (statistics, batch) => {
        const qualityDetails = batch.qualityDetails;
        if (!qualityDetails) {
          return statistics;
        }
        switch (qualityDetails.powerType) {
          case PowerType.RENEWABLE:
            statistics.renewable += batch.amount;
            break;
          case PowerType.PARTLY_RENEWABLE:
            statistics.partlyRenewable += batch.amount;
            break;
          case PowerType.NON_RENEWABLE:
            statistics.nonRenewable += batch.amount;
            break;
        }
        return statistics;
      },
      { renewable: 0, partlyRenewable: 0, nonRenewable: 0 },
    );
    return new PowerStatisticsEntity(renewable, partlyRenewable, nonRenewable);
  }
}
