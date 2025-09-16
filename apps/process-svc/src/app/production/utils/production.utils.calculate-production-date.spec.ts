/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductionUtils } from './production.utils';

describe('ProductionUtils.calculateProductionDate', () => {
  it('should calculate the correct start date for the first accountingPeriod', () => {
    const productionStartedAtInSeconds = 1000;
    const accountingPeriodInSeconds = 60;
    const accountingPeriodIndex = 0;
    const isEnd = false;

    const expectedDate = new Date((1000 + 0 * 60) * 1000);

    const actualDate = ProductionUtils.calculateProductionDate(
      productionStartedAtInSeconds,
      accountingPeriodInSeconds,
      accountingPeriodIndex,
      isEnd,
    );

    expect(actualDate.getTime()).toBe(expectedDate.getTime());
  });

  it('should calculate the correct end date for the first accountingPeriod', () => {
    const productionStartedAtInSeconds = 1000;
    const accountingPeriodInSeconds = 60;
    const accountingPeriodIndex = 0;
    const isEnd = true;

    // (1000 + (0+1)*60) * 1000 - 1000 = (1000 + 60) * 1000 - 1000 = 1060000 - 1000 = 1059000
    const expectedDate = new Date((1000 + 1 * 60) * 1000 - 1000);

    const actualDate = ProductionUtils.calculateProductionDate(
      productionStartedAtInSeconds,
      accountingPeriodInSeconds,
      accountingPeriodIndex,
      isEnd,
    );

    expect(actualDate.getTime()).toBe(expectedDate.getTime());
  });

  it('should calculate the correct start date for a later accountingPeriod', () => {
    const productionStartedAtInSeconds = 2000;
    const accountingPeriodInSeconds = 120;
    const accountingPeriodIndex = 2;
    const isEnd = false;

    // (2000 + 2*120) * 1000 = (2000 + 240) * 1000 = 2240000
    const expectedDate = new Date((2000 + 2 * 120) * 1000);

    const actualDate = ProductionUtils.calculateProductionDate(
      productionStartedAtInSeconds,
      accountingPeriodInSeconds,
      accountingPeriodIndex,
      isEnd,
    );

    expect(actualDate.getTime()).toBe(expectedDate.getTime());
  });

  it('should calculate the correct end date for a later accountingPeriod', () => {
    const productionStartedAtInSeconds = 2000;
    const accountingPeriodInSeconds = 120;
    const accountingPeriodIndex = 2;
    const isEnd = true;

    // (2000 + (2+1)*120) * 1000 - 1000 = (2000 + 360) * 1000 - 1000 = 2360000 - 1000 = 2359000
    const expectedDate = new Date((2000 + 3 * 120) * 1000 - 1000);

    const actualDate = ProductionUtils.calculateProductionDate(
      productionStartedAtInSeconds,
      accountingPeriodInSeconds,
      accountingPeriodIndex,
      isEnd,
    );

    // then
    expect(actualDate.getTime()).toBe(expectedDate.getTime());
  });
});
