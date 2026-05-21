/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateDuration } from './production.utils';

describe('ProductionUtils.calculateDuration', () => {
  it('should return the difference between start and end in seconds', () => {
    const actualDuration = calculateDuration(300, 900);

    expect(actualDuration).toBe(600);
  });

  it('should throw if startedAtInSeconds is negative', () => {
    expect(() => calculateDuration(-1, 10)).toThrow('startedAtInSeconds must be positive');
  });

  it('should throw if endedAtInSeconds is negative', () => {
    expect(() => calculateDuration(1, -10)).toThrow('endedAtInSeconds must be positive');
  });

  it('should throw if endedAtInSeconds equals startedAtInSeconds', () => {
    expect(() => calculateDuration(10, 10)).toThrow('endedAtInSeconds must be greater than startedAtInSeconds');
  });

  it('should throw if endedAtInSeconds is before startedAtInSeconds', () => {
    expect(() => calculateDuration(20, 10)).toThrow('endedAtInSeconds must be greater than startedAtInSeconds');
  });
});