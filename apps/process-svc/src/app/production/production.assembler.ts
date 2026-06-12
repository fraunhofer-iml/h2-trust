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
  ProcessStepEntity,
  QualityDetailsEntity,
  UnitEntity,
  UserEntity,
} from '@h2-trust/contracts/entities';
import { BatchType, PowerType, ProcessType, RfnboType } from '@h2-trust/domain';
import { assertDefined, assertValidEnum, formatDate } from '@h2-trust/utils';
import { AccountingPeriod, ProcessStepParams } from './production.types';
import { calculateAccountingPeriods, calculateWaterAmount } from './utils/production.utils';

const logger = new Logger('ProductionAssembler');

export function assemblePowerProductions(
  entity: CreateProductionEntity,
  productionUnitsForId: Map<string, UnitEntity>,
): ProcessStepEntity[] {
  const powerProductionUnit = productionUnitsForId.get(entity.powerProductionUnitId);
  assertDefined(powerProductionUnit, 'powerProductionUnit');
  assertValidEnum(entity.powerType, PowerType, 'PowerType');

  const params: ProcessStepParams = {
    type: ProcessType.POWER_PRODUCTION,
    executedBy: powerProductionUnit,
    recordedBy: entity.recordedBy,
    batchParams: {
      activity: false,
      type: BatchType.POWER,
      owner: entity.ownerIdOfPowerProductionUnit,
      powerType: entity.powerType,
    },
  };

  return createProcessSteps(entity.productionStartedAt, entity.productionEndedAt, entity.powerAmountKwh, params, []);
}

export function assembleWaterConsumptions(
  entity: CreateProductionEntity,
  productionUnitsForId: Map<string, UnitEntity>,
): ProcessStepEntity[] {
  const hydrogenProductionUnit = productionUnitsForId.get(entity.hydrogenProductionUnitId);
  assertDefined(hydrogenProductionUnit, 'hydrogenProductionUnit');
  const waterAmountLiters = calculateWaterAmount(
    entity.productionStartedAt,
    entity.productionEndedAt,
    entity.waterConsumptionLitersPerHour,
  );

  const params: ProcessStepParams = {
    type: ProcessType.WATER_CONSUMPTION,
    executedBy: hydrogenProductionUnit,
    recordedBy: entity.recordedBy,
    batchParams: {
      activity: false,
      type: BatchType.WATER,
      owner: entity.ownerIdOfHydrogenProductionUnit,
    },
  };

  return createProcessSteps(entity.productionStartedAt, entity.productionEndedAt, waterAmountLiters, params, []);
}

export function assembleHydrogenProductions(
  entity: CreateProductionEntity,
  powerProductions: ProcessStepEntity[],
  waterConsumptions: ProcessStepEntity[],
  productionUnitsForId: Map<string, UnitEntity>,
): ProcessStepEntity[] {
  const hydrogenProductionUnit = productionUnitsForId.get(entity.hydrogenProductionUnitId);
  assertDefined(hydrogenProductionUnit, 'hydrogenProductionUnit');
  const rawPowerType = powerProductions[0]?.batch?.qualityDetails?.productionPowerType ?? PowerType.NOT_SPECIFIED;
  assertValidEnum(rawPowerType, PowerType, 'PowerType');
  const params: ProcessStepParams = {
    type: ProcessType.HYDROGEN_PRODUCTION,
    executedBy: hydrogenProductionUnit,
    recordedBy: entity.recordedBy,
    batchParams: {
      activity: true,
      type: BatchType.HYDROGEN,
      owner: entity.ownerIdOfHydrogenProductionUnit,
      hydrogenStorageUnitId: entity.hydrogenStorageUnitId,
      powerType: rawPowerType,
    },
  };

  return createProcessSteps(entity.productionStartedAt, entity.productionEndedAt, entity.hydrogenAmountKg, params, [
    ...powerProductions,
    ...waterConsumptions,
  ]);
}

function createProcessSteps(
  startedAt: Date,
  endedAt: Date,
  totalAmount: number,
  params: ProcessStepParams,
  predecessors: ProcessStepEntity[],
): ProcessStepEntity[] {
  const accountingPeriods: AccountingPeriod[] = calculateAccountingPeriods(
    startedAt,
    endedAt,
    totalAmount,
    predecessors,
  );
  return accountingPeriods.map((accountingPeriod) => createProcessStep(accountingPeriod, params));
}

function createProcessStep(accountingPeriod: AccountingPeriod, params: ProcessStepParams): ProcessStepEntity {
  logger.debug(
    `${formatDate(accountingPeriod.startedAt)} | ${formatDate(accountingPeriod.endedAt)} | ${params.type} | ${params.executedBy} | ${accountingPeriod.amount}`,
  );

  const { batchParams } = params;

  const qualityDetails: QualityDetailsEntity = new QualityDetailsEntity(
    null,
    RfnboType.NOT_SPECIFIED,
    batchParams.powerType,
    0,
  );

  const batch = new BatchEntity(
    null,
    batchParams.activity,
    accountingPeriod.amount,
    batchParams.type,
    accountingPeriod.predecessors,
    [],
    { id: batchParams.owner } as CompanyEntity,
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
