/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateNumberOfAccountingPeriods } from './production.utils';

describe('ProductionUtils.calculateNumberOfAccountingPeriods', () => {
  it('should calculate correct number of periods (divisible) when called', () => {
    // arrange
    const givenProductionStartedAtSeconds = 15;
    const givenProductionEndedAtSeconds = 75;
    const givenAccountingPeriodSeconds = 15;

    const expectedNumberOfAccountingPeriods = 4;

    // act
    const actualNumberOfAccountingPeriods = calculateNumberOfAccountingPeriods(
      givenProductionStartedAtSeconds,
      givenProductionEndedAtSeconds,
      givenAccountingPeriodSeconds,
    );

    // assert
    expect(actualNumberOfAccountingPeriods).toBe(expectedNumberOfAccountingPeriods);
  });

  it('should round up for non-divisible durations when called', () => {
    // arrange
    const givenProductionStartedAtSeconds = 5;
    const givenProductionEndedAtSeconds = 10;
    const givenAccountingPeriodSeconds = 2;

    const expectedNumberOfAccountingPeriods = 3; // (10-5)/2 = 2.5 -> ceil = 3

    // act
    const actualNumberOfAccountingPeriods = calculateNumberOfAccountingPeriods(
      givenProductionStartedAtSeconds,
      givenProductionEndedAtSeconds,
      givenAccountingPeriodSeconds,
    );

    // assert
    expect(actualNumberOfAccountingPeriods).toBe(expectedNumberOfAccountingPeriods);
  });

  it('should throw when productionStartedAtSeconds is negative', () => {
    // arrange
    const givenProductionStartedAtSeconds = -90;
    const givenProductionEndedAtSeconds = 75;
    const givenAccountingPeriodSeconds = 15;

    // act & assert
    const actualOperation = () =>
      calculateNumberOfAccountingPeriods(
        givenProductionStartedAtSeconds,
        givenProductionEndedAtSeconds,
        givenAccountingPeriodSeconds,
      );

    expect(actualOperation).toThrow('startedAtInSeconds must be positive');
  });

  it('should throw when productionEndedAtSeconds is negative', () => {
    // arrange
    const givenProductionStartedAtSeconds = 90;
    const givenProductionEndedAtSeconds = -75;
    const givenAccountingPeriodSeconds = 15;

    // act & assert
    const actualOperation = () =>
      calculateNumberOfAccountingPeriods(
        givenProductionStartedAtSeconds,
        givenProductionEndedAtSeconds,
        givenAccountingPeriodSeconds,
      );

    expect(actualOperation).toThrow('endedAtInSeconds must be positive');
  });

  it('should throw when accountingPeriodInSeconds is negative', () => {
    // arrange
    const givenProductionStartedAtSeconds = 0;
    const givenProductionEndedAtSeconds = 10;
    const givenAccountingPeriodSeconds = -5;

    // act & assert
    const actualOperation = () =>
      calculateNumberOfAccountingPeriods(
        givenProductionStartedAtSeconds,
        givenProductionEndedAtSeconds,
        givenAccountingPeriodSeconds,
      );

    expect(actualOperation).toThrow('accountingPeriodInSeconds must be greater than zero');
  });

  it('should throw when accountingPeriodInSeconds is zero', () => {
    // arrange
    const givenProductionStartedAtSeconds = 0;
    const givenProductionEndedAtSeconds = 10;
    const givenAccountingPeriodSeconds = 0;

    // act & assert
    const actualOperation = () =>
      calculateNumberOfAccountingPeriods(
        givenProductionStartedAtSeconds,
        givenProductionEndedAtSeconds,
        givenAccountingPeriodSeconds,
      );

    expect(actualOperation).toThrow('accountingPeriodInSeconds must be greater than zero');
  });

  it('should throw when durationInSeconds is negative', () => {
    // arrange
    const givenProductionStartedAtSeconds = 90;
    const givenProductionEndedAtSeconds = 75;
    const givenAccountingPeriodSeconds = 15;

    // act & assert
    const actualOperation = () =>
      calculateNumberOfAccountingPeriods(
        givenProductionStartedAtSeconds,
        givenProductionEndedAtSeconds,
        givenAccountingPeriodSeconds,
      );

    expect(actualOperation).toThrow('endedAtInSeconds must be greater than startedAtInSeconds');
  });

  it('should throw when durationInSeconds is zero', () => {
    // arrange
    const givenProductionStartedAtSeconds = 75;
    const givenProductionEndedAtSeconds = 75;
    const givenAccountingPeriodSeconds = 15;

    // act & assert
    const actualOperation = () =>
      calculateNumberOfAccountingPeriods(
        givenProductionStartedAtSeconds,
        givenProductionEndedAtSeconds,
        givenAccountingPeriodSeconds,
      );

    expect(actualOperation).toThrow('endedAtInSeconds must be greater than startedAtInSeconds');
  });
});
