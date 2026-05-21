/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateWaterAmount } from './production.utils';

describe('ProductionUtils.calculateWaterAmount', () => {
  describe('valid inputs', () => {
    it('should calculate water amount for 1 hour duration when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T01:00:00Z');
      const givenWaterConsumptionPerHour = 100;
      const expectedResult = 100;

      // act
      const actualResult = calculateWaterAmount(givenStartedAt, givenEndedAt, givenWaterConsumptionPerHour);

      // assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should calculate water amount for 2 hours duration when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T02:00:00Z');
      const givenWaterConsumptionPerHour = 100;
      const expectedResult = 200;

      // act
      const actualResult = calculateWaterAmount(givenStartedAt, givenEndedAt, givenWaterConsumptionPerHour);

      // assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should calculate water amount for 30 minutes duration when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T00:30:00Z');
      const givenWaterConsumptionPerHour = 100;
      const expectedResult = 50;

      // act
      const actualResult = calculateWaterAmount(givenStartedAt, givenEndedAt, givenWaterConsumptionPerHour);

      // assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should calculate water amount for 15 minutes duration when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T00:15:00Z');
      const givenWaterConsumptionPerHour = 100;
      const expectedResult = 25;

      // act
      const actualResult = calculateWaterAmount(givenStartedAt, givenEndedAt, givenWaterConsumptionPerHour);

      // assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should calculate water amount with fractional consumption rate when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T01:00:00Z');
      const givenWaterConsumptionPerHour = 50.5;
      const expectedResult = 50.5;

      // act
      const actualResult = calculateWaterAmount(givenStartedAt, givenEndedAt, givenWaterConsumptionPerHour);

      // assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should calculate water amount for zero consumption rate when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T01:00:00Z');
      const givenWaterConsumptionPerHour = 0;
      const expectedResult = 0;

      // act
      const actualResult = calculateWaterAmount(givenStartedAt, givenEndedAt, givenWaterConsumptionPerHour);

      // assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should calculate water amount for very short duration (1 second) when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T00:00:01Z');
      const givenWaterConsumptionPerHour = 3600;
      const expectedResult = 1;

      // act
      const actualResult = calculateWaterAmount(givenStartedAt, givenEndedAt, givenWaterConsumptionPerHour);

      // assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should calculate water amount for long duration (24 hours) when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-02T00:00:00Z');
      const givenWaterConsumptionPerHour = 100;
      const expectedResult = 2400;

      // act
      const actualResult = calculateWaterAmount(givenStartedAt, givenEndedAt, givenWaterConsumptionPerHour);

      // assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should handle dates with milliseconds when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00.500Z');
      const givenEndedAt = new Date('2024-01-01T01:00:00.500Z');
      const givenWaterConsumptionPerHour = 100;
      const expectedResult = 100;

      // act
      const actualResult = calculateWaterAmount(givenStartedAt, givenEndedAt, givenWaterConsumptionPerHour);

      // assert
      expect(actualResult).toBe(expectedResult);
    });
  });

  describe('invalid inputs', () => {
    it('should throw error when endedAt is before startedAt', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T01:00:00Z');
      const givenEndedAt = new Date('2024-01-01T00:00:00Z');
      const givenWaterConsumptionPerHour = 100;

      // act & assert
      const actualOperation = () => {
        calculateWaterAmount(givenStartedAt, givenEndedAt, givenWaterConsumptionPerHour);
      };

      expect(actualOperation).toThrow('endedAtInSeconds must be greater than startedAtInSeconds');
    });

    it('should throw error when startedAt equals endedAt', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T00:00:00Z');
      const givenWaterConsumptionPerHour = 100;

      // act & assert
      const actualOperation = () => {
        calculateWaterAmount(givenStartedAt, givenEndedAt, givenWaterConsumptionPerHour);
      };

      expect(actualOperation).toThrow('endedAtInSeconds must be greater than startedAtInSeconds');
    });

    it('should throw error for negative water consumption rate when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T01:00:00Z');
      const givenWaterConsumptionPerHour = -100;

      // act & assert
      const actualOperation = () => {
        calculateWaterAmount(givenStartedAt, givenEndedAt, givenWaterConsumptionPerHour);
      };

      expect(actualOperation).toThrow(
        `waterConsumptionPerHour must be non-negative: [${givenWaterConsumptionPerHour}]`,
      );
    });
  });

  describe('edge cases', () => {
    it('should calculate water amount across year boundary when called', () => {
      // arrange
      const givenStartedAt = new Date('2023-12-31T23:00:00Z');
      const givenEndedAt = new Date('2024-01-01T01:00:00Z');
      const givenWaterConsumptionPerHour = 100;
      const expectedResult = 200;

      // act
      const actualResult = calculateWaterAmount(givenStartedAt, givenEndedAt, givenWaterConsumptionPerHour);

      // assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should handle very large water consumption values when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T01:00:00Z');
      const givenWaterConsumptionPerHour = 1000000;
      const expectedResult = 1000000;

      // act
      const actualResult = calculateWaterAmount(givenStartedAt, givenEndedAt, givenWaterConsumptionPerHour);

      // assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should handle very small water consumption values when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T01:00:00Z');
      const givenWaterConsumptionPerHour = 0.001;
      const expectedResult = 0.001;

      // act
      const actualResult = calculateWaterAmount(givenStartedAt, givenEndedAt, givenWaterConsumptionPerHour);

      // assert
      expect(actualResult).toBe(expectedResult);
    });
  });
});
