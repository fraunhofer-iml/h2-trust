/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculatePartialAmountRelativeToPowerProduction } from './production.utils';

describe('ProductionUtils.calculatePartialAmountRelativeToPowerProduction', () => {
  it('should return the proportional amount for the given partial power consumption when called', () => {
    // arrange
    const totalAmount = 80;
    const totalPowerConsumption = 200;
    const partialPowerConsumption = 50;

    // act
    const actualAmount = calculatePartialAmountRelativeToPowerProduction(
      totalAmount,
      totalPowerConsumption,
      partialPowerConsumption,
    );

    // assert
    expect(actualAmount).toBe(20);
  });

  it('should return zero when partialPowerConsumption is zero', () => {
    // arrange
    const totalAmount = 80;
    const totalPowerConsumption = 200;
    const partialPowerConsumption = 0;

    // act
    const actualAmount = calculatePartialAmountRelativeToPowerProduction(
      totalAmount,
      totalPowerConsumption,
      partialPowerConsumption,
    );

    // assert
    expect(actualAmount).toBe(0);
  });

  it('should throw when totalAmount is zero', () => {
    // arrange
    const totalAmount = 0;
    const totalPowerConsumption = 200;
    const partialPowerConsumption = 50;

    // act & assert
    expect(() => calculatePartialAmountRelativeToPowerProduction(totalAmount, totalPowerConsumption, partialPowerConsumption)).toThrow(
      'The partial amount could not be calculated because at least one total is 0.',
    );
  });

  it('should throw when totalPowerConsumption is zero', () => {
    // arrange
    const totalAmount = 80;
    const totalPowerConsumption = 0;
    const partialPowerConsumption = 50;

    // act & assert
    expect(() => calculatePartialAmountRelativeToPowerProduction(totalAmount, totalPowerConsumption, partialPowerConsumption)).toThrow(
      'The partial amount could not be calculated because at least one total is 0.',
    );
  });
});