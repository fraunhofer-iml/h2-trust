/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductionUtils } from './production.utils';
import { ProductionErrorMessages } from '../../constants';

describe('ProductionUtils.calculateBatchAmountPerPeriod', () => {
  it('should return the full amount if numberOfAccountingPeriods is less than 1', () => {
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = 0.5;

    const expectedAmountPerPeriod = 10;

    const actualAmountPerPeriod = ProductionUtils.calculateBatchAmountPerAccountingPeriod(
      givenBatchAmount,
      givenNumberOfAccountingPeriods,
    );

    expect(actualAmountPerPeriod).toBe(expectedAmountPerPeriod);
  });

  it('should divide the amount equally for integer periods', () => {
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = 2;

    const expectedAmountPerPeriod = 5;

    const actualAmountPerPeriod = ProductionUtils.calculateBatchAmountPerAccountingPeriod(
      givenBatchAmount,
      givenNumberOfAccountingPeriods,
    );

    expect(actualAmountPerPeriod).toBe(expectedAmountPerPeriod);
  });

  it('should divide the amount equally for non-integer periods', () => {
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = 2.2;

    const expectedAmountPerPeriod = 10 / 2.2;

    const actualAmountPerPeriod = ProductionUtils.calculateBatchAmountPerAccountingPeriod(
      givenBatchAmount,
      givenNumberOfAccountingPeriods,
    );

    expect(actualAmountPerPeriod).toBeCloseTo(expectedAmountPerPeriod);
  });

  it('should return the full amount if numberOfAccountingPeriods is exactly 1', () => {
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = 1;

    const expectedAmountPerPeriod = 10;

    const actualAmountPerPeriod = ProductionUtils.calculateBatchAmountPerAccountingPeriod(
      givenBatchAmount,
      givenNumberOfAccountingPeriods,
    );

    expect(actualAmountPerPeriod).toBe(expectedAmountPerPeriod);
  });

  it('should throw if batchAmount is negative', () => {
    const givenBatchAmount = -10;
    const givenNumberOfAccountingPeriods = 1;

    expect(() =>
      ProductionUtils.calculateBatchAmountPerAccountingPeriod(givenBatchAmount, givenNumberOfAccountingPeriods),
    ).toThrow(ProductionErrorMessages.BATCH_AMOUNT_NOT_POSITIVE);
  });

  it('should throw if batchAmount is zero', () => {
    const givenBatchAmount = 0;
    const givenNumberOfAccountingPeriods = 1;

    expect(() =>
      ProductionUtils.calculateBatchAmountPerAccountingPeriod(givenBatchAmount, givenNumberOfAccountingPeriods),
    ).toThrow(ProductionErrorMessages.BATCH_AMOUNT_NOT_POSITIVE);
  });

  it('should throw if numberOfAccountingPeriods is negative', () => {
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = -1;

    expect(() =>
      ProductionUtils.calculateBatchAmountPerAccountingPeriod(givenBatchAmount, givenNumberOfAccountingPeriods),
    ).toThrow(ProductionErrorMessages.NUMBER_OF_PERIODS_NOT_POSITIVE);
  });

  it('should throw if numberOfAccountingPeriods is zero', () => {
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = 0;

    expect(() =>
      ProductionUtils.calculateBatchAmountPerAccountingPeriod(givenBatchAmount, givenNumberOfAccountingPeriods),
    ).toThrow(ProductionErrorMessages.NUMBER_OF_PERIODS_NOT_POSITIVE);
  });
});
