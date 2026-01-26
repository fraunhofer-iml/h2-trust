/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { TimeInSeconds } from '@h2-trust/domain';
import { DateTimeUtil } from '@h2-trust/utils';
import { AccountingPeriod } from '../production.types';
import { ProductionErrorMessages } from '../../constants';

export class ProductionUtils {
  static calculateNumberOfAccountingPeriods(
    startedAtInSeconds: number,
    endedAtInSeconds: number,
    accountingPeriodInSeconds: number,
  ): number {
    const durationInSeconds = this.calculateDuration(startedAtInSeconds, endedAtInSeconds);

    if (!Number.isFinite(accountingPeriodInSeconds)) {
      throw new Error(ProductionErrorMessages.ACCOUNTING_PERIOD_NOT_FINITE(accountingPeriodInSeconds));
    }

    if (accountingPeriodInSeconds <= 0) {
      throw new Error(ProductionErrorMessages.ACCOUNTING_PERIOD_NOT_POSITIVE);
    }

    return Math.ceil(durationInSeconds / accountingPeriodInSeconds);
  }

  static calculateDuration(startedAtInSeconds: number, endedAtInSeconds: number) {
    const durationInSeconds = endedAtInSeconds - startedAtInSeconds;

    if (startedAtInSeconds < 0) {
      throw new Error(ProductionErrorMessages.STARTED_AT_NOT_POSITIVE);
    }

    if (endedAtInSeconds < 0) {
      throw new Error(ProductionErrorMessages.ENDED_AT_NOT_POSITIVE);
    }

    if (durationInSeconds <= 0) {
      throw new Error(ProductionErrorMessages.ENDED_AT_BEFORE_STARTED_AT);
    }

    return durationInSeconds;
  }

  static calculateBatchAmountPerAccountingPeriod(batchAmount: number, numberOfAccountingPeriods: number): number {
    if (batchAmount <= 0) {
      throw new Error(ProductionErrorMessages.BATCH_AMOUNT_NOT_POSITIVE);
    }

    if (numberOfAccountingPeriods <= 0) {
      throw new Error(ProductionErrorMessages.NUMBER_OF_PERIODS_NOT_POSITIVE);
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
      throw new Error(ProductionErrorMessages.WATER_CONSUMPTION_NEGATIVE(waterConsumptionPerHour));
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
}
