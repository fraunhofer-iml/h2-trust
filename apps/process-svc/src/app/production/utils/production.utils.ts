/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export class ProductionUtils {
  static calculateNumberOfAccountingPeriods(
    productionStartedAtInSeconds: number,
    productionEndedAtInSeconds: number,
    accountingPeriodInSeconds: number,
  ): number {
    const durationInSeconds = this.calculateDuration(productionStartedAtInSeconds, productionEndedAtInSeconds);

    if (!Number.isFinite(accountingPeriodInSeconds)) {
      throw new Error('accountingPeriodInSeconds must be a finite number: ' + accountingPeriodInSeconds);
    }

    if (accountingPeriodInSeconds <= 0) {
      throw new Error('accountingPeriodInSeconds must be greater than zero');
    }

    return Math.ceil(durationInSeconds / accountingPeriodInSeconds);
  }

  static calculateDuration(productionStartedAtInSeconds: number, productionEndedAtInSeconds: number) {
    const durationInSeconds = productionEndedAtInSeconds - productionStartedAtInSeconds;

    if (productionStartedAtInSeconds < 0) {
      throw new Error('productionStartedAtInSeconds must be positive');
    }

    if (productionEndedAtInSeconds < 0) {
      throw new Error('productionEndedAtInSeconds must be positive');
    }

    if (durationInSeconds <= 0) {
      throw new Error('productionEndedAtInSeconds must be greater than productionStartedAtInSeconds');
    }

    return durationInSeconds;
  }

  static calculateBatchAmountPerPeriod(batchAmount: number, numberOfAccountingPeriods: number): number {
    if (batchAmount <= 0) {
      throw new Error('batchAmount must be greater than zero');
    }

    if (numberOfAccountingPeriods <= 0) {
      throw new Error('numberOfAccountingPeriods must be greater than zero');
    }

    return batchAmount / Math.max(1, numberOfAccountingPeriods);
  }

  static calculateProductionStartDate(
    productionStartedAtInSeconds: number,
    accountingPeriodInSeconds: number,
    accountingPeriodIndex: number,
  ): Date {
    return this.calculateProductionDate(
      productionStartedAtInSeconds,
      accountingPeriodInSeconds,
      accountingPeriodIndex,
      false,
    );
  }

  static calculateProductionEndDate(
    productionStartedAtInSeconds: number,
    accountingPeriodInSeconds: number,
    accountingPeriodIndex: number,
  ): Date {
    return this.calculateProductionDate(
      productionStartedAtInSeconds,
      accountingPeriodInSeconds,
      accountingPeriodIndex,
      true,
    );
  }

  static calculateProductionDate(
    productionStartedAtInSeconds: number,
    accountingPeriodInSeconds: number,
    accountingPeriodIndex: number,
    isEnd: boolean,
  ): Date {
    const productionStartedAtInMs = productionStartedAtInSeconds * 1000;
    const accountingPeriodInMs = accountingPeriodInSeconds * 1000;
    const accountingPeriodOffsetInMs = (accountingPeriodIndex + (isEnd ? 1 : 0)) * accountingPeriodInMs;

    return new Date(
      isEnd
        ? productionStartedAtInMs + accountingPeriodOffsetInMs - 1000 // Subtract 1 second to ensure the end time is before the next period starts
        : productionStartedAtInMs + accountingPeriodOffsetInMs,
    );
  }
}
