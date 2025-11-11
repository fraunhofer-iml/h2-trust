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
  BaseUnitEntity,
  BatchEntity,
  BrokerQueues,
  CompanyEntity,
  CreateProductionEntity,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  QualityDetailsEntity,
  UnitMessagePatterns,
  UserEntity,
} from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { BatchType, ProcessType } from '@h2-trust/domain';
import { DateTimeUtil } from '@h2-trust/utils';
import { ProductionUtils } from './utils/production.utils';

interface CreateProcessStepsParams {
  productionStartedAt: string;
  productionEndedAt: string;
  accountingPeriodInSeconds: number;
  type: ProcessType;
  batchActivity: boolean;
  batchAmount: number;
  batchQuality: string;
  batchType: BatchType;
  batchOwner: string;
  hydrogenStorageUnitId: string;
  recordedBy: string;
  executedBy: string;
  predecessors: string[];
}

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);
  private readonly numberOfPredecessors = 2;
  private readonly secondsPerHour = 3600;
  private readonly powerAccountingPeriodInSeconds: number;
  private readonly waterAccountingPeriodInSeconds: number;
  private readonly hydrogenAccountingPeriodInSeconds: number;

  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy,
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    private readonly configurationService: ConfigurationService,
  ) {
    const configuration = this.configurationService.getProcessSvcConfiguration();
    this.powerAccountingPeriodInSeconds = configuration.powerAccountingPeriodInSeconds;
    this.waterAccountingPeriodInSeconds = configuration.waterAccountingPeriodInSeconds;
    this.hydrogenAccountingPeriodInSeconds = configuration.hydrogenAccountingPeriodInSeconds;
  }

  async createProduction(createProductionEntity: CreateProductionEntity): Promise<ProcessStepEntity[]> {
    this.logger.debug(`### START PRODUCTION ###`);

    const powerProductionProcessSteps: ProcessStepEntity[] =
      await this.createPowerProductionProcessSteps(createProductionEntity);

    const waterConsumptionProcessSteps: ProcessStepEntity[] = [];
    await this.createWaterConsumptionProcessSteps(createProductionEntity);

    const hydrogenProductionProcessSteps: ProcessStepEntity[] = await this.createHydrogenProductionProcessSteps(
      createProductionEntity,
      powerProductionProcessSteps,
      waterConsumptionProcessSteps,
    );

    this.logger.debug(`### END PRODUCTION ###`);

    return [...powerProductionProcessSteps, ...waterConsumptionProcessSteps, ...hydrogenProductionProcessSteps];
  }

  private async createPowerProductionProcessSteps(
    createProductionEntity: CreateProductionEntity,
  ): Promise<ProcessStepEntity[]> {
    return this.createProcessSteps({
      productionStartedAt: createProductionEntity.productionStartedAt,
      productionEndedAt: createProductionEntity.productionEndedAt,
      accountingPeriodInSeconds: this.powerAccountingPeriodInSeconds,
      type: ProcessType.POWER_PRODUCTION,
      batchActivity: false,
      batchAmount: createProductionEntity.powerAmountKwh,
      batchQuality: null,
      batchType: BatchType.POWER,
      batchOwner: createProductionEntity.companyIdOfPowerProductionUnit,
      hydrogenStorageUnitId: null,
      recordedBy: createProductionEntity.recordedBy,
      executedBy: createProductionEntity.powerProductionUnitId,
      predecessors: [],
    });
  }

  private async createWaterConsumptionProcessSteps(
    createProductionEntity: CreateProductionEntity,
  ): Promise<ProcessStepEntity[]> {
    const waterAmountLiters: number = await this.calculateTotalWaterAmount(createProductionEntity);

    return this.createProcessSteps({
      productionStartedAt: createProductionEntity.productionStartedAt,
      productionEndedAt: createProductionEntity.productionEndedAt,
      accountingPeriodInSeconds: this.waterAccountingPeriodInSeconds,
      type: ProcessType.WATER_CONSUMPTION,
      batchActivity: false,
      batchAmount: waterAmountLiters,
      batchQuality: null,
      batchType: BatchType.WATER,
      batchOwner: createProductionEntity.companyIdOfHydrogenProductionUnit,
      hydrogenStorageUnitId: null,
      recordedBy: createProductionEntity.recordedBy,
      executedBy: createProductionEntity.hydrogenProductionUnitId,
      predecessors: [],
    });
  }

  private async calculateTotalWaterAmount(createProductionEntity: CreateProductionEntity): Promise<number> {
    const hydrogenProductionUnit: HydrogenProductionUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, { id: createProductionEntity.hydrogenProductionUnitId }),
    );

    if (!Number.isFinite(hydrogenProductionUnit?.waterConsumptionLitersPerHour)) {
      throw new Error(
        `Invalid or missing waterConsumptionLitersPerHour for HydrogenProductionUnit with id: ${createProductionEntity.hydrogenProductionUnitId}`,
      );
    }

    const startedAtInSeconds = DateTimeUtil.convertDateStringToSeconds(createProductionEntity.productionStartedAt);
    const endedAtInSeconds = DateTimeUtil.convertDateStringToSeconds(createProductionEntity.productionEndedAt);
    const durationInSeconds = ProductionUtils.calculateDuration(startedAtInSeconds, endedAtInSeconds);

    return (hydrogenProductionUnit.waterConsumptionLitersPerHour / this.secondsPerHour) * durationInSeconds;
  }

  private async createHydrogenProductionProcessSteps(
    createProductionEntity: CreateProductionEntity,
    powerProductionProcessSteps: ProcessStepEntity[],
    _waterConsumptionProcessSteps: ProcessStepEntity[],
  ): Promise<ProcessStepEntity[]> {
    // TODO-MP: add `...waterConsumptionProcessSteps` to predecessors in DUHGW-236
    const predecessors: string[] = [...powerProductionProcessSteps].map((step) => step.batch.id);

    return this.createProcessSteps({
      productionStartedAt: createProductionEntity.productionStartedAt,
      productionEndedAt: createProductionEntity.productionEndedAt,
      accountingPeriodInSeconds: this.hydrogenAccountingPeriodInSeconds,
      type: ProcessType.HYDROGEN_PRODUCTION,
      batchActivity: true,
      batchAmount: createProductionEntity.hydrogenAmountKg,
      batchQuality: createProductionEntity.hydrogenColor,
      batchType: BatchType.HYDROGEN,
      batchOwner: createProductionEntity.companyIdOfHydrogenProductionUnit,
      hydrogenStorageUnitId: createProductionEntity.hydrogenStorageUnitId,
      recordedBy: createProductionEntity.recordedBy,
      executedBy: createProductionEntity.hydrogenProductionUnitId,
      predecessors: predecessors,
    });
  }

  private async createProcessSteps(params: CreateProcessStepsParams): Promise<ProcessStepEntity[]> {
    const processSteps: ProcessStepEntity[] = [];
    const startedAtInSeconds = DateTimeUtil.convertDateStringToSeconds(params.productionStartedAt);
    const endedAtInSeconds = DateTimeUtil.convertDateStringToSeconds(params.productionEndedAt);
    const startedAtInSecondsAligned =
      Math.floor(startedAtInSeconds / params.accountingPeriodInSeconds) * params.accountingPeriodInSeconds;

    const numberOfAccountingPeriods = ProductionUtils.calculateNumberOfAccountingPeriods(
      startedAtInSecondsAligned,
      endedAtInSeconds,
      params.accountingPeriodInSeconds,
    );

    const amountPerAccountingPeriod = ProductionUtils.calculateBatchAmountPerPeriod(
      params.batchAmount,
      numberOfAccountingPeriods,
    );

    for (let i = 0; i < numberOfAccountingPeriods; i++) {
      this.logger.debug(
        `## Accounting Period ${i + 1} of ${numberOfAccountingPeriods} for process type ${params.type} ##`,
      );
      this.logger.debug(`amount: ${amountPerAccountingPeriod}`);

      const startedAt = ProductionUtils.calculateProductionStartDate(
        startedAtInSecondsAligned,
        params.accountingPeriodInSeconds,
        i,
      );
      this.logger.debug(`started At: ${startedAt.toISOString()}`);

      const endedAt = ProductionUtils.calculateProductionEndDate(
        startedAtInSecondsAligned,
        params.accountingPeriodInSeconds,
        i,
      );
      this.logger.debug(`ended At: ${endedAt.toISOString()}`);

      const predecessors = params.predecessors.slice(i, i + this.numberOfPredecessors).map((id) => ({ id: id }));
      this.logger.debug(`predecessors: ${predecessors.map((p) => p.id).join(', ')}`);

      processSteps.push(
        new ProcessStepEntity(
          null,
          startedAt,
          endedAt,
          params.type,
          new BatchEntity(
            null,
            params.batchActivity,
            amountPerAccountingPeriod,
            params.batchType,
            predecessors,
            [],
            { id: params.batchOwner } as CompanyEntity,
            { id: params.hydrogenStorageUnitId } as HydrogenStorageUnitEntity,
            params.batchQuality
              ? new QualityDetailsEntity(null, params.batchQuality)
              : null,
          ),
          { id: params.recordedBy } as UserEntity,
          { id: params.executedBy } as BaseUnitEntity,
          null,
        ),
      );
    }

    return Promise.all(
      processSteps.map((step) =>
        firstValueFrom(this.batchService.send(ProcessStepMessagePatterns.CREATE, { processStepEntity: step })),
      ),
    );
  }
}
