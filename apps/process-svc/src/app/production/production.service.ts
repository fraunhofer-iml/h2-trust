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
import { AccountingPeriod, ProcessStepParams } from './production.types';
import { ProductionUtils } from './utils/production.utils';

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);

  constructor(@Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy) {}

  async createPowerProductions(entity: CreateProductionEntity): Promise<ProcessStepEntity[]> {
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

  async createWaterConsumptions(entity: CreateProductionEntity): Promise<ProcessStepEntity[]> {
    const waterAmountLiters = ProductionUtils.calculateWaterAmount(
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

  async createHydrogenProductions(
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
    startedAt: string,
    endedAt: string,
    totalAmount: number,
    params: ProcessStepParams,
    predecessors: ProcessStepEntity[],
  ): Promise<ProcessStepEntity[]> {
    const accountingPeriods: AccountingPeriod[] = ProductionUtils.calculateAccountingPeriods(
      startedAt,
      endedAt,
      totalAmount,
      predecessors,
    );
    const processSteps = accountingPeriods.map((accountingPeriod) => this.createProcessStep(accountingPeriod, params));
    return this.persistProcessSteps(processSteps);
  }

  private createProcessStep(accountingPeriod: AccountingPeriod, params: ProcessStepParams): ProcessStepEntity {
    this.logger.debug(
      `${DateTimeUtil.formatDate(accountingPeriod.startedAt)} | ${DateTimeUtil.formatDate(accountingPeriod.endedAt)} | ${params.type} | ${params.executedBy} | ${accountingPeriod.amount}`,
    );

    const { batchParams } = params;

    const hydrogenStorageUnit = batchParams.hydrogenStorageUnitId
      ? ({ id: batchParams.hydrogenStorageUnitId } as HydrogenStorageUnitEntity)
      : null;

    const qualityDetails = batchParams.quality ? new QualityDetailsEntity(null, batchParams.quality) : null;

    const batch = new BatchEntity(
      null,
      batchParams.activity,
      accountingPeriod.amount,
      batchParams.type,
      accountingPeriod.predecessors,
      [],
      { id: batchParams.owner } as CompanyEntity,
      hydrogenStorageUnit,
      qualityDetails,
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
    return firstValueFrom(this.batchSvc.send(ProcessStepMessagePatterns.CREATE_MANY, { processSteps }));
  }
}
