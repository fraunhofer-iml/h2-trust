/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from '@nestjs/common';
import {
  BatchEntity,
  CompanyEntity,
  CreateProductionEntity,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProductionChainEntity,
  QualityDetailsEntity,
  UnitEntity,
  UserEntity,
} from '@h2-trust/amqp';
import { BatchType, HydrogenColor, PowerType, ProcessType, RfnboType } from '@h2-trust/domain';
import { DateTimeUtil } from '@h2-trust/utils';
import { AccountingPeriod, ProcessStepParams } from './production.types';
import { ProductionUtils } from './utils/production.utils';

export class ProductionAssembler {
  private static readonly logger = new Logger(ProductionAssembler.name);

  static assemblePowerProductions(
    entity: CreateProductionEntity,
    powerProductionUnit: PowerProductionUnitEntity,
  ): ProcessStepEntity[] {
    const params: ProcessStepParams = {
      type: ProcessType.POWER_PRODUCTION,
      executedBy: powerProductionUnit,
      recordedBy: entity.recordedBy,
      batchParams: {
        activity: false,
        type: BatchType.POWER,
        owner: entity.ownerIdOfPowerProductionUnit,
        powerType: entity.powerType as PowerType,
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

  static assembleWaterConsumptions(entity: CreateProductionEntity, executedBy: UnitEntity): ProcessStepEntity[] {
    const waterAmountLiters = ProductionUtils.calculateWaterAmount(
      entity.productionStartedAt,
      entity.productionEndedAt,
      entity.waterConsumptionLitersPerHour,
    );

    const params: ProcessStepParams = {
      type: ProcessType.WATER_CONSUMPTION,
      executedBy: executedBy,
      recordedBy: entity.recordedBy,
      batchParams: {
        activity: false,
        type: BatchType.WATER,
        owner: entity.ownerIdOfHydrogenProductionUnit,
      },
    };

    return this.createProcessSteps(entity.productionStartedAt, entity.productionEndedAt, waterAmountLiters, params, []);
  }

  public static assembleRootProductions(
    createProduction: CreateProductionEntity,
    productionUnitsForId: Map<string, UnitEntity>,
  ): ProductionChainEntity {
    if (!createProduction.powerProductionUnitId || !productionUnitsForId.has(createProduction.powerProductionUnitId)) {
      throw new Error(
        `Power Production Unit ${createProduction.powerProductionUnitId} does not exist in productionUnits: `,
      );
    }

    if (
      !createProduction.hydrogenProductionUnitId ||
      !productionUnitsForId.has(createProduction.hydrogenProductionUnitId)
    ) {
      throw new Error(
        `Hydrogen Production Unit ${createProduction.hydrogenProductionUnitId} does not exist in productionUnits: `,
      );
    }

    const powerProductionUnit: PowerProductionUnitEntity = productionUnitsForId.get(
      createProduction.powerProductionUnitId,
    ) as PowerProductionUnitEntity;
    const hydrogenProductionUnit: HydrogenProductionUnitEntity = productionUnitsForId.get(
      createProduction.hydrogenProductionUnitId,
    ) as HydrogenProductionUnitEntity;

    const powerProduction: ProcessStepEntity = this.createPowerProductionProcessStep(
      createProduction,
      powerProductionUnit,
    );
    const waterConsumption: ProcessStepEntity = this.createWaterConsumptionProcessStep(
      createProduction,
      hydrogenProductionUnit,
    );
    const hydrogenProductionToCreate: ProcessStepEntity = ProductionAssembler.createHydrogenProductionProcessStep(
      createProduction,
      powerProduction,
      waterConsumption,
      hydrogenProductionUnit,
    );
    return new ProductionChainEntity(
      hydrogenProductionToCreate,
      hydrogenProductionToCreate,
      powerProduction,
      waterConsumption,
      powerProductionUnit,
      hydrogenProductionUnit,
    );
  }

  static assembleHydrogenProductions(
    entity: CreateProductionEntity,
    powerProductions: ProcessStepEntity[],
    waterConsumptions: ProcessStepEntity[],
    hydrogenProductionUnit: HydrogenProductionUnitEntity,
  ): ProcessStepEntity[] {
    const params: ProcessStepParams = {
      type: ProcessType.HYDROGEN_PRODUCTION,
      executedBy: hydrogenProductionUnit,
      recordedBy: entity.recordedBy,
      batchParams: {
        activity: true,
        type: BatchType.HYDROGEN,
        owner: entity.ownerIdOfHydrogenProductionUnit,
        quality: entity.hydrogenColor,
        hydrogenStorageUnitId: entity.hydrogenStorageUnitId,
        powerType: (powerProductions[0]?.batch?.qualityDetails?.powerType as PowerType) ?? PowerType.NOT_SPECIFIED,
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

  private static createPowerProductionProcessStep(
    entity: CreateProductionEntity,
    powerProductionUnit: PowerProductionUnitEntity,
  ): ProcessStepEntity {
    const qualityDetails: QualityDetailsEntity = new QualityDetailsEntity(
      null,
      HydrogenColor.MIX,
      RfnboType.NOT_SPECIFIED,
      entity.powerType as PowerType,
    );

    const batch = new BatchEntity(
      null,
      false,
      entity.powerAmountKwh,
      BatchType.POWER,
      [],
      [],
      { id: entity.ownerIdOfPowerProductionUnit } as CompanyEntity,
      null,
      qualityDetails,
    );

    return new ProcessStepEntity(
      null,
      entity.productionStartedAt,
      entity.productionEndedAt,
      ProcessType.POWER_PRODUCTION,
      batch,
      { id: entity.recordedBy } as UserEntity,
      powerProductionUnit,
      null,
    );
  }

  private static createWaterConsumptionProcessStep(
    entity: CreateProductionEntity,
    executedBy: HydrogenProductionUnitEntity,
  ): ProcessStepEntity {
    const waterAmountLiters = ProductionUtils.calculateWaterAmount(
      entity.productionStartedAt,
      entity.productionEndedAt,
      entity.waterConsumptionLitersPerHour,
    );

    const qualityDetails: QualityDetailsEntity = new QualityDetailsEntity(
      null,
      HydrogenColor.MIX,
      RfnboType.NOT_SPECIFIED,
      PowerType.NOT_SPECIFIED,
    );

    const batch = new BatchEntity(
      null,
      false,
      waterAmountLiters,
      BatchType.WATER,
      [],
      [],
      { id: entity.ownerIdOfHydrogenProductionUnit } as CompanyEntity,
      null,
      qualityDetails,
    );

    return new ProcessStepEntity(
      null,
      entity.productionStartedAt,
      entity.productionEndedAt,
      ProcessType.WATER_CONSUMPTION,
      batch,
      { id: entity.recordedBy } as UserEntity,
      executedBy,
      null,
    );
  }

  private static createHydrogenProductionProcessStep(
    entity: CreateProductionEntity,
    powerProduction: ProcessStepEntity,
    waterConsumption: ProcessStepEntity,
    hydrogenProductionUnit: HydrogenProductionUnitEntity,
  ): ProcessStepEntity {
    const qualityDetails: QualityDetailsEntity = new QualityDetailsEntity(
      null,
      HydrogenColor.MIX,
      RfnboType.NOT_SPECIFIED,
      (powerProduction?.batch?.qualityDetails?.powerType as PowerType) ?? PowerType.NOT_SPECIFIED,
    );

    const batch = new BatchEntity(
      null,
      true,
      entity.hydrogenAmountKg,
      BatchType.HYDROGEN,
      [powerProduction.batch, waterConsumption.batch],
      [],
      { id: entity.ownerIdOfHydrogenProductionUnit } as CompanyEntity,
      { id: entity.hydrogenStorageUnitId } as HydrogenStorageUnitEntity,
      qualityDetails,
    );

    return new ProcessStepEntity(
      null,
      entity.productionStartedAt,
      entity.productionEndedAt,
      ProcessType.HYDROGEN_PRODUCTION,
      batch,
      { id: entity.recordedBy } as UserEntity,
      hydrogenProductionUnit,
      null,
    );
  }

  private static createProcessStep(accountingPeriod: AccountingPeriod, params: ProcessStepParams): ProcessStepEntity {
    this.logger.debug(
      `${DateTimeUtil.formatDate(accountingPeriod.startedAt)} | ${DateTimeUtil.formatDate(accountingPeriod.endedAt)} | ${params.type} | ${params.executedBy} | ${accountingPeriod.amount}`,
    );

    const { batchParams } = params;

    const hydrogenStorageUnit = batchParams.hydrogenStorageUnitId
      ? ({ id: batchParams.hydrogenStorageUnitId } as HydrogenStorageUnitEntity)
      : null;

    const qualityDetails: QualityDetailsEntity = new QualityDetailsEntity(
      null,
      batchParams.quality ?? HydrogenColor.MIX,
      RfnboType.NOT_SPECIFIED,
      batchParams.powerType,
    );

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
      params.executedBy,
      null,
    );
  }
}
