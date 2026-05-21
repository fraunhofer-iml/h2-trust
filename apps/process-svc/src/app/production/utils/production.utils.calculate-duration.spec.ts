/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateDuration } from './production.utils';

describe('ProductionUtils.calculateDuration', () => {
  it('should return the difference between start and end in seconds when end is after start', () => {
    // arrange
    const givenStartedAtInSeconds = 300;
    const givenEndedAtInSeconds = 900;

    // act
    const actualDuration = calculateDuration(givenStartedAtInSeconds, givenEndedAtInSeconds);

    // assert
    expect(actualDuration).toBe(600);
  });

  it('should throw when startedAtInSeconds is negative', () => {
    // arrange
    const givenStartedAtInSeconds = -1;
    const givenEndedAtInSeconds = 10;

    // act & assert
    const actualOperation = () => calculateDuration(givenStartedAtInSeconds, givenEndedAtInSeconds);

    expect(actualOperation).toThrow('startedAtInSeconds must be positive');
  });

  it('should throw when endedAtInSeconds is negative', () => {
    // arrange
    const givenStartedAtInSeconds = 1;
    const givenEndedAtInSeconds = -10;

    // act & assert
    const actualOperation = () => calculateDuration(givenStartedAtInSeconds, givenEndedAtInSeconds);

    expect(actualOperation).toThrow('endedAtInSeconds must be positive');
  });

  it('should throw when endedAtInSeconds equals startedAtInSeconds', () => {
    // arrange
    const givenStartedAtInSeconds = 10;
    const givenEndedAtInSeconds = 10;

    // act & assert
    const actualOperation = () => calculateDuration(givenStartedAtInSeconds, givenEndedAtInSeconds);

    expect(actualOperation).toThrow(
      'endedAtInSeconds must be greater than startedAtInSeconds',
    );
  });

  it('should throw when endedAtInSeconds is before startedAtInSeconds', () => {
    // arrange
    const givenStartedAtInSeconds = 20;
    const givenEndedAtInSeconds = 10;

    // act & assert
    const actualOperation = () => calculateDuration(givenStartedAtInSeconds, givenEndedAtInSeconds);

    expect(actualOperation).toThrow(
      'endedAtInSeconds must be greater than startedAtInSeconds',
    );
  });
});