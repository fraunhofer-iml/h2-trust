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
import { BatchType, ProcessType, TimeInSeconds } from '@h2-trust/domain';
import { DateTimeUtil } from '@h2-trust/utils';
import { ProductionUtils } from './utils/production.utils';

interface BatchParams {
  activity: boolean;
  type: BatchType;
  owner: string;
  quality?: string;
  hydrogenStorageUnitId?: string;
}

interface ProcessStepParams {
  type: ProcessType;
  executedBy: string;
  recordedBy: string;
  batchParams: BatchParams;
}

interface AccountingPeriod {
  startedAt: Date;
  endedAt: Date;
  amount: number;
  predecessors: BatchEntity[];
}

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);

  constructor(@Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy) { }

  async createProductions(entity: CreateProductionEntity): Promise<ProcessStepEntity[]> {
    this.logger.debug('Production Creation Started');

    const [powerProductions, waterConsumptions] = await Promise.all([
      this.createPowerProductions(entity),
      this.createWaterConsumptions(entity),
    ]);

    const hydrogenProductions = await this.createHydrogenProductions(
      entity,
      powerProductions,
      waterConsumptions,
    );

    this.logger.debug('Production Creation Completed');

    return [...powerProductions, ...waterConsumptions, ...hydrogenProductions];
  }

  private async createPowerProductions(entity: CreateProductionEntity): Promise<ProcessStepEntity[]> {
    const params: ProcessStepParams = {
      type: ProcessType.POWER_PRODUCTION,
      executedBy: entity.powerProductionUnitId,
      recordedBy: entity.recordedBy,
      batchParams: {
        activity: false,
        type: BatchType.POWER,
        owner: entity.companyIdOfPowerProductionUnit,
      },
    };

    return this.createAndPersistProcessSteps(
      entity.productionStartedAt,
      entity.productionEndedAt,
      entity.powerAmountKwh,
      params,
      [],
    );
  }

  private async createWaterConsumptions(entity: CreateProductionEntity): Promise<ProcessStepEntity[]> {
    const waterAmountLiters = this.calculateWaterAmount(
      entity.productionStartedAt,
      entity.productionEndedAt,
      entity.waterConsumptionLitersPerHour,
    );

    const params: ProcessStepParams = {
      type: ProcessType.WATER_CONSUMPTION,
      executedBy: entity.hydrogenProductionUnitId,
      recordedBy: entity.recordedBy,
      batchParams: {
        activity: false,
        type: BatchType.WATER,
        owner: entity.companyIdOfHydrogenProductionUnit,
      },
    };

    return this.createAndPersistProcessSteps(
      entity.productionStartedAt,
      entity.productionEndedAt,
      waterAmountLiters,
      params,
      [],
    );
  }

  private calculateWaterAmount(
    startDate: string,
    endDate: string,
    consumptionPerHour: number,
  ): number {
    const startInSeconds = DateTimeUtil.convertDateStringToSeconds(startDate);
    const endInSeconds = DateTimeUtil.convertDateStringToSeconds(endDate);
    const durationInSeconds = ProductionUtils.calculateDuration(startInSeconds, endInSeconds);
    return (consumptionPerHour / TimeInSeconds.ONE_HOUR) * durationInSeconds;
  }

  private async createHydrogenProductions(
    entity: CreateProductionEntity,
    powerProductions: ProcessStepEntity[],
    waterConsumptions: ProcessStepEntity[],
  ): Promise<ProcessStepEntity[]> {
    const params: ProcessStepParams = {
      type: ProcessType.HYDROGEN_PRODUCTION,
      executedBy: entity.hydrogenProductionUnitId,
      recordedBy: entity.recordedBy,
      batchParams: {
        activity: true,
        type: BatchType.HYDROGEN,
        owner: entity.companyIdOfHydrogenProductionUnit,
        quality: entity.hydrogenColor,
        hydrogenStorageUnitId: entity.hydrogenStorageUnitId,
      },
    };

    return this.createAndPersistProcessSteps(
      entity.productionStartedAt,
      entity.productionEndedAt,
      entity.hydrogenAmountKg,
      params,
      [...powerProductions, ...waterConsumptions],
    );
  }

  private async createAndPersistProcessSteps(
    startDate: string,
    endDate: string,
    totalAmount: number,
    params: ProcessStepParams,
    predecessors: ProcessStepEntity[],
  ): Promise<ProcessStepEntity[]> {
    const accountingPeriods: AccountingPeriod[] = this.calculateAccountingPeriods(
      startDate,
      endDate,
      totalAmount,
      predecessors,
    );
    const processSteps = accountingPeriods.map((accountingPeriod) =>
      this.createProcessStep(accountingPeriod, params),
    );

    return this.persistProcessSteps(processSteps);
  }

  private calculateAccountingPeriods(
    startDate: string,
    endDate: string,
    totalAmount: number,
    predecessors: ProcessStepEntity[],
  ): AccountingPeriod[] {
    const startInSeconds = DateTimeUtil.convertDateStringToSeconds(startDate);
    const endInSeconds = DateTimeUtil.convertDateStringToSeconds(endDate);
    const alignedStartInSeconds = Math.floor(startInSeconds / TimeInSeconds.ACCOUNTING_PERIOD) * TimeInSeconds.ACCOUNTING_PERIOD;

    const numberOfAccountingPeriods = ProductionUtils.calculateNumberOfAccountingPeriods(
      alignedStartInSeconds,
      endInSeconds,
      TimeInSeconds.ACCOUNTING_PERIOD,
    );

    const amountPerAccountingPeriod = ProductionUtils.calculateBatchAmountPerAccountingPeriod(
      totalAmount,
      numberOfAccountingPeriods,
    );

    const predecessorsByStartedAt = this.groupBatchesByStartedAt(predecessors);
    const accountingPeriods: AccountingPeriod[] = [];

    for (let i = 0; i < numberOfAccountingPeriods; i++) {
      const startedAt = ProductionUtils.calculateProductionStartDate(
        alignedStartInSeconds,
        TimeInSeconds.ACCOUNTING_PERIOD,
        i,
      );

      const endedAt = ProductionUtils.calculateProductionEndDate(
        alignedStartInSeconds,
        TimeInSeconds.ACCOUNTING_PERIOD,
        i,
      );

      const startedAtConverted = DateTimeUtil.convertDateToMilliseconds(startedAt);
      const predecessors = predecessorsByStartedAt.get(startedAtConverted) || [];

      accountingPeriods.push({
        startedAt: startedAt,
        endedAt: endedAt,
        amount: amountPerAccountingPeriod,
        predecessors: predecessors,
      });
    }

    return accountingPeriods;
  }

  private groupBatchesByStartedAt(processSteps: ProcessStepEntity[]): Map<number, BatchEntity[]> {
    const batchesByStartedAt = new Map<number, BatchEntity[]>();

    for (const processStep of processSteps) {
      const startedAt = DateTimeUtil.convertDateToMilliseconds(processStep.startedAt);

      const batches = batchesByStartedAt.get(startedAt) || [];
      batches.push(processStep.batch);
      batchesByStartedAt.set(startedAt, batches);
    }

    return batchesByStartedAt;
  }

  private createProcessStep(
    accountingPeriod: AccountingPeriod,
    params: ProcessStepParams,
  ): ProcessStepEntity {
    const { batchParams } = params;

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    this.logger.debug(
      `${formatDate(accountingPeriod.startedAt)} - ${formatDate(accountingPeriod.endedAt)} | ${params.type} | ${batchParams.activity} | ${accountingPeriod.amount}`
    );

    const hydrogenStorageUnit = batchParams.hydrogenStorageUnitId
      ? ({ id: batchParams.hydrogenStorageUnitId } as HydrogenStorageUnitEntity)
      : null;

    const qualityDetails = batchParams.quality
      ? new QualityDetailsEntity(null, batchParams.quality)
      : null;

    const batch = new BatchEntity(
      null,
      batchParams.activity,
      accountingPeriod.amount,
      batchParams.type,
      accountingPeriod.predecessors,
      [],
      { id: batchParams.owner } as CompanyEntity,
      hydrogenStorageUnit,
      qualityDetails
    );

    return new ProcessStepEntity(
      null,
      accountingPeriod.startedAt,
      accountingPeriod.endedAt,
      params.type,
      batch,
      { id: params.recordedBy } as UserEntity,
      { id: params.executedBy } as BaseUnitEntity,
      null,
    );
  }

  private async persistProcessSteps(processSteps: ProcessStepEntity[]): Promise<ProcessStepEntity[]> {
    return Promise.all(
      processSteps.map((processStep) => firstValueFrom(
        this.batchSvc.send(ProcessStepMessagePatterns.CREATE, { processStepEntity: processStep })
      )),
    );
  }
}
