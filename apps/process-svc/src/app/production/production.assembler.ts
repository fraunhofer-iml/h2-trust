/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from '@nestjs/common';
import {
  BaseUnitEntity,
  BatchEntity,
  CompanyEntity,
  CreateProductionEntity,
  HydrogenStorageUnitEntity,
  ProcessStepEntity,
  QualityDetailsEntity,
  UserEntity,
} from '@h2-trust/amqp';
import { BatchType, ProcessType } from '@h2-trust/domain';
import { DateTimeUtil } from '@h2-trust/utils';
import { AccountingPeriod, ProcessStepParams } from './production.types';
import { ProductionUtils } from './utils/production.utils';

export class ProductionAssembler {
  private static readonly logger = new Logger(ProductionAssembler.name);

  static assemblePowerProductions(entity: CreateProductionEntity): ProcessStepEntity[] {
    const params: ProcessStepParams = {
      type: ProcessType.POWER_PRODUCTION,
      executedBy: entity.powerProductionUnitId,
      recordedBy: entity.recordedBy,
      batchParams: {
        activity: false,
        type: BatchType.POWER,
        owner: entity.ownerIdOfPowerProductionUnit,
      },
    };

    return this.createProcessSteps(
      entity.productionStartedAt,
      entity.productionEndedAt,
      entity.powerAmountKwh,
      params,
      [],
    );
  }

  static assembleWaterConsumptions(entity: CreateProductionEntity): ProcessStepEntity[] {
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
        owner: entity.ownerIdOfHydrogenProductionUnit,
      },
    };

    return this.createProcessSteps(entity.productionStartedAt, entity.productionEndedAt, waterAmountLiters, params, []);
  }

  static assembleHydrogenProductions(
    entity: CreateProductionEntity,
    powerProductions: ProcessStepEntity[],
    waterConsumptions: ProcessStepEntity[],
  ): ProcessStepEntity[] {
    const params: ProcessStepParams = {
      type: ProcessType.HYDROGEN_PRODUCTION,
      executedBy: entity.hydrogenProductionUnitId,
      recordedBy: entity.recordedBy,
      batchParams: {
        activity: true,
        type: BatchType.HYDROGEN,
        owner: entity.ownerIdOfHydrogenProductionUnit,
        quality: entity.hydrogenColor,
        hydrogenStorageUnitId: entity.hydrogenStorageUnitId,
      },
    };

    return this.createProcessSteps(
      entity.productionStartedAt,
      entity.productionEndedAt,
      entity.hydrogenAmountKg,
      params,
      [...powerProductions, ...waterConsumptions],
    );
  }

  private static createProcessSteps(
    startedAt: Date,
    endedAt: Date,
    totalAmount: number,
    params: ProcessStepParams,
    predecessors: ProcessStepEntity[],
  ): ProcessStepEntity[] {
    const accountingPeriods: AccountingPeriod[] = ProductionUtils.calculateAccountingPeriods(
      startedAt,
      endedAt,
      totalAmount,
      predecessors,
    );
    return accountingPeriods.map((accountingPeriod) => this.createProcessStep(accountingPeriod, params));
  }

  private static createProcessStep(accountingPeriod: AccountingPeriod, params: ProcessStepParams): ProcessStepEntity {
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
}
