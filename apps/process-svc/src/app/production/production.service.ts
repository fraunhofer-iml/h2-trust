/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {firstValueFrom} from 'rxjs';
import {Inject, Injectable, Logger} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
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
  UnitMessagePatterns,
  UserEntity,
} from '@h2-trust/amqp';
import {ConfigurationService} from '@h2-trust/configuration';
import {BatchType, ProcessType} from '@h2-trust/domain';
import {DateTimeUtil} from '@h2-trust/utils';
import {ProductionUtils} from './utils/production.utils';

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
  predecessors: ProcessStepEntity[];
}

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);
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

    const waterConsumptionProcessSteps: ProcessStepEntity[] =
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
      batchQuality: '{}',
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
      batchQuality: '{}',
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
      this.generalService.send(UnitMessagePatterns.READ, {id: createProductionEntity.hydrogenProductionUnitId}),
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
    waterConsumptionProcessSteps: ProcessStepEntity[],
  ): Promise<ProcessStepEntity[]> {
    return this.createProcessSteps({
      productionStartedAt: createProductionEntity.productionStartedAt,
      productionEndedAt: createProductionEntity.productionEndedAt,
      accountingPeriodInSeconds: this.hydrogenAccountingPeriodInSeconds,
      type: ProcessType.HYDROGEN_PRODUCTION,
      batchActivity: true,
      batchAmount: createProductionEntity.hydrogenAmountKg,
      batchQuality: JSON.stringify({color: createProductionEntity.hydrogenColor}),
      batchType: BatchType.HYDROGEN,
      batchOwner: createProductionEntity.companyIdOfHydrogenProductionUnit,
      hydrogenStorageUnitId: createProductionEntity.hydrogenStorageUnitId,
      recordedBy: createProductionEntity.recordedBy,
      executedBy: createProductionEntity.hydrogenProductionUnitId,
      predecessors: [...powerProductionProcessSteps, ...waterConsumptionProcessSteps],
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

      const predecessors: BatchEntity[] = params.predecessors
        .filter(step => this.toMilliseconds(step.startedAt) === this.toMilliseconds(startedAt))
        .map(processStep => processStep.batch);

      processSteps.push(
        new ProcessStepEntity(
          null,
          startedAt,
          endedAt,
          params.type,
          {
            active: params.batchActivity,
            amount: amountPerAccountingPeriod,
            quality: params.batchQuality,
            type: params.batchType,
            predecessors: predecessors,
            owner: {id: params.batchOwner} as CompanyEntity,
            hydrogenStorageUnit: {id: params.hydrogenStorageUnitId} as HydrogenStorageUnitEntity,
          } as BatchEntity,
          {id: params.recordedBy} as UserEntity,
          {id: params.executedBy} as BaseUnitEntity,
          null,
        ),
      );
    }

    return Promise.all(
      processSteps.map((step) =>
        firstValueFrom(this.batchService.send(ProcessStepMessagePatterns.CREATE, {processStepEntity: step})),
      ),
    );
  }

  private toMilliseconds(date: Date | string | undefined | null): number {
    if (date == null) {
      throw new Error('Date parameter cannot be null or undefined');
    }

    if (date instanceof Date) {
      return date.getTime();
    }

    const milliseconds = Date.parse(date);
    if (!Number.isFinite(milliseconds)) {
      throw new Error(`Invalid date string format: ${date}`);
    }

    return milliseconds;
  }
}
