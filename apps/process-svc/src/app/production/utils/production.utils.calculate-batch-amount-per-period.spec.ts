/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateBatchAmountPerAccountingPeriod } from './production.utils';

describe('ProductionUtils.calculateBatchAmountPerAccountingPeriod', () => {
  it('should return the full amount when numberOfAccountingPeriods is less than 1', () => {
  // arrange
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = 0.5;

    const expectedAmountPerPeriod = 10;

    // act
    const actualAmountPerPeriod = calculateBatchAmountPerAccountingPeriod(
      givenBatchAmount,
      givenNumberOfAccountingPeriods,
    );

    // assert
    expect(actualAmountPerPeriod).toBe(expectedAmountPerPeriod);
  });

  it('should divide the amount equally for integer periods when called', () => {
  // arrange
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = 2;

    const expectedAmountPerPeriod = 5;

    // act
    const actualAmountPerPeriod = calculateBatchAmountPerAccountingPeriod(
      givenBatchAmount,
      givenNumberOfAccountingPeriods,
    );

    // assert
    expect(actualAmountPerPeriod).toBe(expectedAmountPerPeriod);
  });

  it('should divide the amount equally for non-integer periods when called', () => {
  // arrange
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = 2.2;

    const expectedAmountPerPeriod = 10 / 2.2;

    // act
    const actualAmountPerPeriod = calculateBatchAmountPerAccountingPeriod(
      givenBatchAmount,
      givenNumberOfAccountingPeriods,
    );

    // assert
    expect(actualAmountPerPeriod).toBeCloseTo(expectedAmountPerPeriod);
  });

  it('should return the full amount when numberOfAccountingPeriods is exactly 1', () => {
  // arrange
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = 1;

    const expectedAmountPerPeriod = 10;

    // act
    const actualAmountPerPeriod = calculateBatchAmountPerAccountingPeriod(
      givenBatchAmount,
      givenNumberOfAccountingPeriods,
    );

    // assert
    expect(actualAmountPerPeriod).toBe(expectedAmountPerPeriod);
  });

  it('should throw when batchAmount is negative', () => {
  // arrange
    const givenBatchAmount = -10;
    const givenNumberOfAccountingPeriods = 1;

    // act & assert
    expect(() => calculateBatchAmountPerAccountingPeriod(givenBatchAmount, givenNumberOfAccountingPeriods)).toThrow(
      'batchAmount must be greater than zero',
    );
  });

  it('should throw when batchAmount is zero', () => {
  // arrange
    const givenBatchAmount = 0;
    const givenNumberOfAccountingPeriods = 1;

    // act & assert
    expect(() => calculateBatchAmountPerAccountingPeriod(givenBatchAmount, givenNumberOfAccountingPeriods)).toThrow(
      'batchAmount must be greater than zero',
    );
  });

  it('should throw when numberOfAccountingPeriods is negative', () => {
  // arrange
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = -1;

    // act & assert
    expect(() => calculateBatchAmountPerAccountingPeriod(givenBatchAmount, givenNumberOfAccountingPeriods)).toThrow(
      'numberOfAccountingPeriods must be greater than zero',
    );
  });

  it('should throw when numberOfAccountingPeriods is zero', () => {
  // arrange
    const givenBatchAmount = 10;
    const givenNumberOfAccountingPeriods = 0;

    // act & assert
    expect(() => calculateBatchAmountPerAccountingPeriod(givenBatchAmount, givenNumberOfAccountingPeriods)).toThrow(
      'numberOfAccountingPeriods must be greater than zero',
    );
  });
});
