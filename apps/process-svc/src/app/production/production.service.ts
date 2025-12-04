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
  HydrogenStorageUnitEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  QualityDetailsEntity,
  UserEntity,
} from '@h2-trust/amqp';
import { BatchType, ProcessType } from '@h2-trust/domain';
import { DateTimeUtil } from '@h2-trust/utils';
import { ProductionUtils } from './utils/production.utils';

interface CreateProcessStepsParams {
  productionStartedAt: string;
  productionEndedAt: string;
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
  private readonly accountingPeriodInSeconds = 3600; // TODO-MP: move to lib
  private readonly hourInSeconds = 3600;

  constructor(@Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy) { }

  async createProductions(entity: CreateProductionEntity): Promise<ProcessStepEntity[]> {
    this.logger.debug(`### START PRODUCTION ###`);

    const powerProductions: ProcessStepEntity[] = await this.createPowerProductions(entity);
    const waterConsumptions: ProcessStepEntity[] = await this.createWaterConsumptions(entity);
    const hydrogenProductions: ProcessStepEntity[] = await this.createHydrogenProductions(entity, powerProductions, waterConsumptions);

    this.logger.debug(`### END PRODUCTION ###`);

    return [...powerProductions, ...waterConsumptions, ...hydrogenProductions];
  }

  private async createPowerProductions(entity: CreateProductionEntity): Promise<ProcessStepEntity[]> {
    return this.createProcessSteps(
      {
        productionStartedAt: entity.productionStartedAt,
        productionEndedAt: entity.productionEndedAt,
        type: ProcessType.POWER_PRODUCTION,
        batchActivity: false,
        batchAmount: entity.powerAmountKwh,
        batchQuality: null,
        batchType: BatchType.POWER,
        batchOwner: entity.companyIdOfPowerProductionUnit,
        hydrogenStorageUnitId: null,
        recordedBy: entity.recordedBy,
        executedBy: entity.powerProductionUnitId,
        predecessors: [],
      },
    );
  }

  private async createWaterConsumptions(entity: CreateProductionEntity): Promise<ProcessStepEntity[]> {
    const waterAmountLiters: number = this.calculateTotalWaterAmount(entity.productionStartedAt, entity.productionEndedAt, entity.waterConsumptionLitersPerHour);

    return this.createProcessSteps(
      {
        productionStartedAt: entity.productionStartedAt,
        productionEndedAt: entity.productionEndedAt,
        type: ProcessType.WATER_CONSUMPTION,
        batchActivity: false,
        batchAmount: waterAmountLiters,
        batchQuality: null,
        batchType: BatchType.WATER,
        batchOwner: entity.companyIdOfHydrogenProductionUnit,
        hydrogenStorageUnitId: null,
        recordedBy: entity.recordedBy,
        executedBy: entity.hydrogenProductionUnitId,
        predecessors: [],
      },
    );
  }

  private calculateTotalWaterAmount(productionStartedAt: string, productionEndedAt: string, waterConsumptionLitersPerHour: number): number {
    const startedAtInSeconds = DateTimeUtil.convertDateStringToSeconds(productionStartedAt);
    const endedAtInSeconds = DateTimeUtil.convertDateStringToSeconds(productionEndedAt);
    const durationInSeconds = ProductionUtils.calculateDuration(startedAtInSeconds, endedAtInSeconds);
    return (waterConsumptionLitersPerHour / this.hourInSeconds) * durationInSeconds;
  }

  private async createHydrogenProductions(entity: CreateProductionEntity, powerProductions: ProcessStepEntity[], waterConsumptions: ProcessStepEntity[]): Promise<ProcessStepEntity[]> {
    return this.createProcessSteps(
      {
        productionStartedAt: entity.productionStartedAt,
        productionEndedAt: entity.productionEndedAt,
        type: ProcessType.HYDROGEN_PRODUCTION,
        batchActivity: true,
        batchAmount: entity.hydrogenAmountKg,
        batchQuality: entity.hydrogenColor,
        batchType: BatchType.HYDROGEN,
        batchOwner: entity.companyIdOfHydrogenProductionUnit,
        hydrogenStorageUnitId: entity.hydrogenStorageUnitId,
        recordedBy: entity.recordedBy,
        executedBy: entity.hydrogenProductionUnitId,
        predecessors: [...powerProductions, ...waterConsumptions],
      },
    );
  }

  private async createProcessSteps(params: CreateProcessStepsParams): Promise<ProcessStepEntity[]> {
    const processSteps: ProcessStepEntity[] = [];

    const startedAtInSeconds = DateTimeUtil.convertDateStringToSeconds(params.productionStartedAt);
    const endedAtInSeconds = DateTimeUtil.convertDateStringToSeconds(params.productionEndedAt);
    const startedAtInSecondsAligned = Math.floor(startedAtInSeconds / this.accountingPeriodInSeconds) * this.accountingPeriodInSeconds;

    const numberOfAccountingPeriods = ProductionUtils.calculateNumberOfAccountingPeriods(
      startedAtInSecondsAligned,
      endedAtInSeconds,
      this.accountingPeriodInSeconds,
    );

    const amountPerAccountingPeriod = ProductionUtils.calculateBatchAmountPerPeriod(
      params.batchAmount,
      numberOfAccountingPeriods,
    );

    for (let i = 0; i < numberOfAccountingPeriods; i++) {
      this.logger.debug(`## Accounting Period ${i + 1} of ${numberOfAccountingPeriods} for process type ${params.type} ##`,);
      this.logger.debug(`amount: ${amountPerAccountingPeriod}`);

      const startedAt = ProductionUtils.calculateProductionStartDate(
        startedAtInSecondsAligned,
        this.accountingPeriodInSeconds,
        i,
      );
      this.logger.debug(`started At: ${startedAt.toISOString()}`);

      const endedAt = ProductionUtils.calculateProductionEndDate(
        startedAtInSecondsAligned,
        this.accountingPeriodInSeconds,
        i,
      );
      this.logger.debug(`ended At: ${endedAt.toISOString()}`);

      const predecessors: BatchEntity[] = params.predecessors
        .filter(
          (step) =>
            DateTimeUtil.convertDateToMilliseconds(step.startedAt) ===
            DateTimeUtil.convertDateToMilliseconds(startedAt),
        )
        .map((processStep) => processStep.batch);

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
            params.batchQuality ? new QualityDetailsEntity(null, params.batchQuality) : null,
          ),
          { id: params.recordedBy } as UserEntity,
          { id: params.executedBy } as BaseUnitEntity,
          null,
        ),
      );
    }

    return Promise.all(
      processSteps.map((processStep) =>
        firstValueFrom(this.batchSvc.send(ProcessStepMessagePatterns.CREATE, { processStepEntity: processStep })),
      ),
    );
  }
}
