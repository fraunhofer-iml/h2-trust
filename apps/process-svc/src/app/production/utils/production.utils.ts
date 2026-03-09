/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BatchEntity,
  CreateProductionEntity,
  CreateProductionsPayload,
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
} from '@h2-trust/amqp';
import { EnergySource, PowerProductionClass, RenewableShareInGridMix, TimeInSeconds } from '@h2-trust/domain';
import { DateTimeUtil } from '@h2-trust/utils';
import { AccountingPeriod } from '../production.types';

export class ProductionUtils {
  static calculateNumberOfAccountingPeriods(
    startedAtInSeconds: number,
    endedAtInSeconds: number,
    accountingPeriodInSeconds: number,
  ): number {
    const durationInSeconds = this.calculateDuration(startedAtInSeconds, endedAtInSeconds);

    if (!Number.isFinite(accountingPeriodInSeconds)) {
      throw new Error(`accountingPeriodInSeconds must be a finite number: ${accountingPeriodInSeconds}`);
    }

    if (accountingPeriodInSeconds <= 0) {
      throw new Error('accountingPeriodInSeconds must be greater than zero');
    }

    return Math.ceil(durationInSeconds / accountingPeriodInSeconds);
  }

  static calculateDuration(startedAtInSeconds: number, endedAtInSeconds: number) {
    const durationInSeconds = endedAtInSeconds - startedAtInSeconds;

    if (startedAtInSeconds < 0) {
      throw new Error('startedAtInSeconds must be positive');
    }

    if (endedAtInSeconds < 0) {
      throw new Error('endedAtInSeconds must be positive');
    }

    if (durationInSeconds <= 0) {
      throw new Error('endedAtInSeconds must be greater than startedAtInSeconds');
    }

    return durationInSeconds;
  }

  static calculateBatchAmountPerAccountingPeriod(batchAmount: number, numberOfAccountingPeriods: number): number {
    if (batchAmount <= 0) {
      throw new Error('batchAmount must be greater than zero');
    }

    if (numberOfAccountingPeriods <= 0) {
      throw new Error('numberOfAccountingPeriods must be greater than zero');
    }

    return batchAmount / Math.max(1, numberOfAccountingPeriods);
  }

  static calculateProductionStartDate(
    startedAtInSeconds: number,
    accountingPeriodInSeconds: number,
    accountingPeriodIndex: number,
  ): Date {
    return this.calculateProductionDate(startedAtInSeconds, accountingPeriodInSeconds, accountingPeriodIndex, false);
  }

  static calculateProductionEndDate(
    startedAtInSeconds: number,
    accountingPeriodInSeconds: number,
    accountingPeriodIndex: number,
  ): Date {
    return this.calculateProductionDate(startedAtInSeconds, accountingPeriodInSeconds, accountingPeriodIndex, true);
  }

  static calculateProductionDate(
    startedAtInSeconds: number,
    accountingPeriodInSeconds: number,
    accountingPeriodIndex: number,
    isEnd: boolean,
  ): Date {
    const productionStartedAtInMs = startedAtInSeconds * 1000;
    const accountingPeriodInMs = accountingPeriodInSeconds * 1000;
    const accountingPeriodOffsetInMs = (accountingPeriodIndex + (isEnd ? 1 : 0)) * accountingPeriodInMs;

    return new Date(
      isEnd
        ? productionStartedAtInMs + accountingPeriodOffsetInMs - 1000 // Subtract 1 second to ensure the end time is before the next period starts
        : productionStartedAtInMs + accountingPeriodOffsetInMs,
    );
  }

  static calculateWaterAmount(startedAt: Date, endedAt: Date, waterConsumptionPerHour: number): number {
    if (waterConsumptionPerHour < 0) {
      throw new Error(`waterConsumptionPerHour must be non-negative: [${waterConsumptionPerHour}]`);
    }

    const startedAtInSeconds = DateTimeUtil.convertDateToSeconds(startedAt);
    const endedAtInSeconds = DateTimeUtil.convertDateToSeconds(endedAt);
    const durationInSeconds = ProductionUtils.calculateDuration(startedAtInSeconds, endedAtInSeconds);
    return (waterConsumptionPerHour / TimeInSeconds.ONE_HOUR) * durationInSeconds;
  }

  static calculateAccountingPeriods(
    startedAt: Date,
    endedAt: Date,
    totalAmount: number,
    predecessors: ProcessStepEntity[],
  ): AccountingPeriod[] {
    const startInSeconds = DateTimeUtil.convertDateToSeconds(startedAt);
    const endInSeconds = DateTimeUtil.convertDateToSeconds(endedAt);
    const alignedStartInSeconds =
      Math.floor(startInSeconds / TimeInSeconds.ACCOUNTING_PERIOD) * TimeInSeconds.ACCOUNTING_PERIOD;

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

  private static groupBatchesByStartedAt(processSteps: ProcessStepEntity[]): Map<number, BatchEntity[]> {
    const batchesByStartedAt = new Map<number, BatchEntity[]>();

    for (const processStep of processSteps) {
      const startedAt = DateTimeUtil.convertDateToMilliseconds(processStep.startedAt);

      const batches = batchesByStartedAt.get(startedAt) || [];
      batches.push(processStep.batch);
      batchesByStartedAt.set(startedAt, batches);
    }

    return batchesByStartedAt;
  }

  /**
   * If the PowerProduction is grid electricity, then the CreateProductionsPayload should be split into two parts so that both a HydrogenBatch from renewable electricity and one from non-renewable electricity can be created.
   * @param createProductionsPayload The production payload, which may need to be split up.
   * @param powerProductionUnitEnergyType The energy type of the power production unit to be tested on grid electricity.
   * @returns In the Grid Electricity case, a list of the productions to be created for the two electricity options is returned. In the case of renewable electricity, nothing is done and the original payload is returned.
   */
  static splitGridPowerProduction(
    createProductionsPayload: CreateProductionsPayload,
    powerProductionUnit: PowerProductionUnitEntity,
    hydrogenProductionUnit: HydrogenProductionUnitEntity,
  ): CreateProductionEntity[] {
    if (powerProductionUnit.type.energySource != EnergySource.GRID) {
      return [
        new CreateProductionEntity(
          createProductionsPayload.productionStartedAt,
          createProductionsPayload.productionEndedAt,
          createProductionsPayload.powerProductionUnitId,
          PowerProductionClass.RENEWABLE,
          createProductionsPayload.powerAmountKwh,
          createProductionsPayload.hydrogenProductionUnitId,
          createProductionsPayload.hydrogenAmountKg,
          createProductionsPayload.userId,
          powerProductionUnit.type.hydrogenColor,
          createProductionsPayload.hydrogenStorageUnitId,
          powerProductionUnit.owner.id,
          hydrogenProductionUnit.owner.id,
          hydrogenProductionUnit.waterConsumptionLitersPerHour,
        ),
      ];
    }

    const renewablePowerAmountKwh = (createProductionsPayload.powerAmountKwh * RenewableShareInGridMix.DE) / 100;
    const renewableHydrogenAmountKg = (createProductionsPayload.hydrogenAmountKg * RenewableShareInGridMix.DE) / 100;
    const renewableWaterConsumption =
      (hydrogenProductionUnit.waterConsumptionLitersPerHour * RenewableShareInGridMix.DE) / 100;

    const renewableCreateProductionEntity: CreateProductionEntity = new CreateProductionEntity(
      createProductionsPayload.productionStartedAt,
      createProductionsPayload.productionEndedAt,
      createProductionsPayload.powerProductionUnitId,
      PowerProductionClass.RENEWABLE_GRID,
      renewablePowerAmountKwh,
      createProductionsPayload.hydrogenProductionUnitId,
      renewableHydrogenAmountKg,
      createProductionsPayload.userId,
      powerProductionUnit.type.hydrogenColor,
      createProductionsPayload.hydrogenStorageUnitId,
      powerProductionUnit.owner.id,
      hydrogenProductionUnit.owner.id,
      renewableWaterConsumption,
    );

    const notRenewableCreateProductionEntity: CreateProductionEntity = new CreateProductionEntity(
      createProductionsPayload.productionStartedAt,
      createProductionsPayload.productionEndedAt,
      createProductionsPayload.powerProductionUnitId,
      PowerProductionClass.NOT_RENEWABLE_GRID,
      createProductionsPayload.powerAmountKwh - renewablePowerAmountKwh,
      createProductionsPayload.hydrogenProductionUnitId,
      createProductionsPayload.hydrogenAmountKg - renewableHydrogenAmountKg,
      createProductionsPayload.userId,
      powerProductionUnit.type.hydrogenColor,
      createProductionsPayload.hydrogenStorageUnitId,
      powerProductionUnit.owner.id,
      hydrogenProductionUnit.owner.id,
      hydrogenProductionUnit.waterConsumptionLitersPerHour - renewableWaterConsumption,
    );

    return [renewableCreateProductionEntity, notRenewableCreateProductionEntity];
  }
}
