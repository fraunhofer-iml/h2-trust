/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculatePartialAmountRelativeToPowerProduction } from './production.utils';

describe('ProductionUtils.calculatePartialAmountRelativeToPowerProduction', () => {
  it('should return the proportional amount for the given partial power consumption', () => {
    const actualAmount = calculatePartialAmountRelativeToPowerProduction(80, 200, 50);

    expect(actualAmount).toBe(20);
  });

  it('should return zero when partialPowerConsumption is zero', () => {
    const actualAmount = calculatePartialAmountRelativeToPowerProduction(80, 200, 0);

    expect(actualAmount).toBe(0);
  });

  it('should throw if totalAmount is zero', () => {
    expect(() => calculatePartialAmountRelativeToPowerProduction(0, 200, 50)).toThrow(
      'The partial amount could not be calculated because at least one total is 0.',
    );
  });

  it('should throw if totalPowerConsumption is zero', () => {
    expect(() => calculatePartialAmountRelativeToPowerProduction(80, 0, 50)).toThrow(
      'The partial amount could not be calculated because at least one total is 0.',
    );
  });
});