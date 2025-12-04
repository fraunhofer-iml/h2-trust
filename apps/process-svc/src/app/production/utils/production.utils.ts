/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity, BatchEntity } from "@h2-trust/amqp";
import { TimeInSeconds } from "@h2-trust/domain";
import { DateTimeUtil } from "@h2-trust/utils";
import { AccountingPeriod } from "../production.types";

export class ProductionUtils {
  static calculateNumberOfAccountingPeriods(startedAtInSeconds: number, endedAtInSeconds: number, accountingPeriodInSeconds: number): number {
    const durationInSeconds = this.calculateDuration(startedAtInSeconds, endedAtInSeconds);

    if (!Number.isFinite(accountingPeriodInSeconds)) {
      throw new Error('accountingPeriodInSeconds must be a finite number: ' + accountingPeriodInSeconds);
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

  static calculateProductionStartDate(startedAtInSeconds: number, accountingPeriodInSeconds: number, accountingPeriodIndex: number): Date {
    return this.calculateProductionDate(
      startedAtInSeconds,
      accountingPeriodInSeconds,
      accountingPeriodIndex,
      false,
    );
  }

  static calculateProductionEndDate(startedAtInSeconds: number, accountingPeriodInSeconds: number, accountingPeriodIndex: number): Date {
    return this.calculateProductionDate(
      startedAtInSeconds,
      accountingPeriodInSeconds,
      accountingPeriodIndex,
      true,
    );
  }

  static calculateProductionDate(startedAtInSeconds: number, accountingPeriodInSeconds: number, accountingPeriodIndex: number, isEnd: boolean): Date {
    const productionStartedAtInMs = startedAtInSeconds * 1000;
    const accountingPeriodInMs = accountingPeriodInSeconds * 1000;
    const accountingPeriodOffsetInMs = (accountingPeriodIndex + (isEnd ? 1 : 0)) * accountingPeriodInMs;

    return new Date(
      isEnd
        ? productionStartedAtInMs + accountingPeriodOffsetInMs - 1000 // Subtract 1 second to ensure the end time is before the next period starts
        : productionStartedAtInMs + accountingPeriodOffsetInMs,
    );
  }

  static calculateWaterAmount(startedAt: string, endedAt: string, waterConsumptionPerHour: number): number {
    const startedAtInSeconds = DateTimeUtil.convertDateStringToSeconds(startedAt);
    const endedAtInSeconds = DateTimeUtil.convertDateStringToSeconds(endedAt);
    const durationInSeconds = ProductionUtils.calculateDuration(startedAtInSeconds, endedAtInSeconds);
    return (waterConsumptionPerHour / TimeInSeconds.ONE_HOUR) * durationInSeconds;
  }

  static calculateAccountingPeriods(startedAt: string, endedAt: string, totalAmount: number, predecessors: ProcessStepEntity[]): AccountingPeriod[] {
    const startInSeconds = DateTimeUtil.convertDateStringToSeconds(startedAt);
    const endInSeconds = DateTimeUtil.convertDateStringToSeconds(endedAt);
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
