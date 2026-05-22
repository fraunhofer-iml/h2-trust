/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateProductionDate, calculateProductionEndDate, calculateProductionStartDate } from './production.utils';

describe('ProductionUtils.calculateProductionStartDate', () => {
  it('should delegate to calculateProductionDate with isEnd set to false when called', () => {
    // arrange
    const givenProductionStartedAtInSeconds = 2000;
    const givenAccountingPeriodInSeconds = 120;
    const givenAccountingPeriodIndex = 2;

    // act
    const actualDate = calculateProductionStartDate(
      givenProductionStartedAtInSeconds,
      givenAccountingPeriodInSeconds,
      givenAccountingPeriodIndex,
    );

    // assert
    expect(actualDate.getTime()).toBe(new Date((2000 + 2 * 120) * 1000).getTime());
  });
});

describe('ProductionUtils.calculateProductionEndDate', () => {
  it('should delegate to calculateProductionDate with isEnd set to true when called', () => {
    // arrange
    const givenProductionStartedAtInSeconds = 2000;
    const givenAccountingPeriodInSeconds = 120;
    const givenAccountingPeriodIndex = 2;

    // act
    const actualDate = calculateProductionEndDate(
      givenProductionStartedAtInSeconds,
      givenAccountingPeriodInSeconds,
      givenAccountingPeriodIndex,
    );

    // assert
    expect(actualDate.getTime()).toBe(new Date((2000 + 3 * 120) * 1000 - 1000).getTime());
  });
});

describe('ProductionUtils.calculateProductionDate', () => {
  it('should calculate the correct start date for the first accountingPeriod when called', () => {
    // arrange
    const givenProductionStartedAtInSeconds = 1000;
    const givenAccountingPeriodInSeconds = 60;
    const givenAccountingPeriodIndex = 0;
    const givenIsEnd = false;

    const expectedDate = new Date((1000 + 0 * 60) * 1000);

    // act
    const actualDate = calculateProductionDate(
      givenProductionStartedAtInSeconds,
      givenAccountingPeriodInSeconds,
      givenAccountingPeriodIndex,
      givenIsEnd,
    );

    // assert
    expect(actualDate.getTime()).toBe(expectedDate.getTime());
  });

  it('should calculate the correct end date for the first accountingPeriod when called', () => {
    // arrange
    const givenProductionStartedAtInSeconds = 1000;
    const givenAccountingPeriodInSeconds = 60;
    const givenAccountingPeriodIndex = 0;
    const givenIsEnd = true;

    // (1000 + (0+1)*60) * 1000 - 1000 = (1000 + 60) * 1000 - 1000 = 1060000 - 1000 = 1059000
    const expectedDate = new Date((1000 + 1 * 60) * 1000 - 1000);

    // act
    const actualDate = calculateProductionDate(
      givenProductionStartedAtInSeconds,
      givenAccountingPeriodInSeconds,
      givenAccountingPeriodIndex,
      givenIsEnd,
    );

    // assert
    expect(actualDate.getTime()).toBe(expectedDate.getTime());
  });

  it('should calculate the correct start date for a later accountingPeriod when called', () => {
    // arrange
    const givenProductionStartedAtInSeconds = 2000;
    const givenAccountingPeriodInSeconds = 120;
    const givenAccountingPeriodIndex = 2;
    const givenIsEnd = false;

    // (2000 + 2*120) * 1000 = (2000 + 240) * 1000 = 2240000
    const expectedDate = new Date((2000 + 2 * 120) * 1000);

    // act
    const actualDate = calculateProductionDate(
      givenProductionStartedAtInSeconds,
      givenAccountingPeriodInSeconds,
      givenAccountingPeriodIndex,
      givenIsEnd,
    );

    // assert
    expect(actualDate.getTime()).toBe(expectedDate.getTime());
  });

  it('should calculate the correct end date for a later accountingPeriod when called', () => {
    // arrange
    const givenProductionStartedAtInSeconds = 2000;
    const givenAccountingPeriodInSeconds = 120;
    const givenAccountingPeriodIndex = 2;
    const givenIsEnd = true;

    // (2000 + (2+1)*120) * 1000 - 1000 = (2000 + 360) * 1000 - 1000 = 2360000 - 1000 = 2359000
    const expectedDate = new Date((2000 + 3 * 120) * 1000 - 1000);

    // act
    const actualDate = calculateProductionDate(
      givenProductionStartedAtInSeconds,
      givenAccountingPeriodInSeconds,
      givenAccountingPeriodIndex,
      givenIsEnd,
    );

    // assert
    expect(actualDate.getTime()).toBe(expectedDate.getTime());
  });
});
