/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductionUtils } from './production.utils';

describe('ProductionUtils.calculateNumberOfAccountingPeriods', () => {
  it('should calculate correct number of periods (divisible)', () => {
    const givenProductionStartedAtSeconds = 15;
    const givenProductionEndedAtSeconds = 75;
    const givenAccountingPeriodSeconds = 15;

    const expectedNumberOfAccountingPeriods = 4;

    const actualNumberOfAccountingPeriods = ProductionUtils.calculateNumberOfAccountingPeriods(
      givenProductionStartedAtSeconds,
      givenProductionEndedAtSeconds,
      givenAccountingPeriodSeconds,
    );

    expect(actualNumberOfAccountingPeriods).toBe(expectedNumberOfAccountingPeriods);
  });

  it('should round up for non-divisible durations', () => {
    const givenProductionStartedAtSeconds = 5;
    const givenProductionEndedAtSeconds = 10;
    const givenAccountingPeriodSeconds = 2;

    const expectedNumberOfAccountingPeriods = 3; // (10-5)/2 = 2.5 -> ceil = 3

    const actualNumberOfAccountingPeriods = ProductionUtils.calculateNumberOfAccountingPeriods(
      givenProductionStartedAtSeconds,
      givenProductionEndedAtSeconds,
      givenAccountingPeriodSeconds,
    );

    expect(actualNumberOfAccountingPeriods).toBe(expectedNumberOfAccountingPeriods);
  });

  it('should throw if productionStartedAtSeconds is negative', () => {
    const givenProductionStartedAtSeconds = -90;
    const givenProductionEndedAtSeconds = 75;
    const givenAccountingPeriodSeconds = 15;

    const expectedErrorMessage = 'productionStartedAtInSeconds must be positive';

    expect(() =>
      ProductionUtils.calculateNumberOfAccountingPeriods(
        givenProductionStartedAtSeconds,
        givenProductionEndedAtSeconds,
        givenAccountingPeriodSeconds,
      ),
    ).toThrow(expectedErrorMessage);
  });

  it('should throw if productionEndedAtSeconds is negative', () => {
    const givenProductionStartedAtSeconds = 90;
    const givenProductionEndedAtSeconds = -75;
    const givenAccountingPeriodSeconds = 15;

    const expectedErrorMessage = 'productionEndedAtInSeconds must be positive';

    expect(() =>
      ProductionUtils.calculateNumberOfAccountingPeriods(
        givenProductionStartedAtSeconds,
        givenProductionEndedAtSeconds,
        givenAccountingPeriodSeconds,
      ),
    ).toThrow(expectedErrorMessage);
  });

  it('should throw if accountingPeriodInSeconds is negative', () => {
    const givenProductionStartedAtSeconds = 0;
    const givenProductionEndedAtSeconds = 10;
    const givenAccountingPeriodSeconds = -5;

    const expectedErrorMessage = 'accountingPeriodInSeconds must be greater than zero';

    expect(() =>
      ProductionUtils.calculateNumberOfAccountingPeriods(
        givenProductionStartedAtSeconds,
        givenProductionEndedAtSeconds,
        givenAccountingPeriodSeconds,
      ),
    ).toThrow(expectedErrorMessage);
  });

  it('should throw if accountingPeriodInSeconds is zero', () => {
    const givenProductionStartedAtSeconds = 0;
    const givenProductionEndedAtSeconds = 10;
    const givenAccountingPeriodSeconds = 0;

    const expectedErrorMessage = 'accountingPeriodInSeconds must be greater than zero';

    expect(() =>
      ProductionUtils.calculateNumberOfAccountingPeriods(
        givenProductionStartedAtSeconds,
        givenProductionEndedAtSeconds,
        givenAccountingPeriodSeconds,
      ),
    ).toThrow(expectedErrorMessage);
  });

  it('should throw if durationInSeconds is negative', () => {
    const givenProductionStartedAtSeconds = 90;
    const givenProductionEndedAtSeconds = 75;
    const givenAccountingPeriodSeconds = 15;

    const expectedErrorMessage = 'productionEndedAtInSeconds must be greater than productionStartedAtInSeconds';

    expect(() =>
      ProductionUtils.calculateNumberOfAccountingPeriods(
        givenProductionStartedAtSeconds,
        givenProductionEndedAtSeconds,
        givenAccountingPeriodSeconds,
      ),
    ).toThrow(expectedErrorMessage);
  });

  it('should throw if durationInSeconds is zero', () => {
    const givenProductionStartedAtSeconds = 75;
    const givenProductionEndedAtSeconds = 75;
    const givenAccountingPeriodSeconds = 15;

    const expectedErrorMessage = 'productionEndedAtInSeconds must be greater than productionStartedAtInSeconds';

    expect(() =>
      ProductionUtils.calculateNumberOfAccountingPeriods(
        givenProductionStartedAtSeconds,
        givenProductionEndedAtSeconds,
        givenAccountingPeriodSeconds,
      ),
    ).toThrow(expectedErrorMessage);
  });
});
