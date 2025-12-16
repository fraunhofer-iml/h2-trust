/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductionUtils } from './production.utils';

describe('ProductionUtils.calculateWaterAmount', () => {
  describe('valid inputs', () => {
    it('should calculate water amount for 1 hour duration', () => {
      // Arrange
      const startedAt = new Date('2024-01-01T00:00:00Z');
      const endedAt = new Date('2024-01-01T01:00:00Z');
      const waterConsumptionPerHour = 100;
      const expectedResult = 100;

      // Act
      const actualResult = ProductionUtils.calculateWaterAmount(startedAt, endedAt, waterConsumptionPerHour);

      // Assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should calculate water amount for 2 hours duration', () => {
      // Arrange
      const startedAt = new Date('2024-01-01T00:00:00Z');
      const endedAt = new Date('2024-01-01T02:00:00Z');
      const waterConsumptionPerHour = 100;
      const expectedResult = 200;

      // Act
      const actualResult = ProductionUtils.calculateWaterAmount(startedAt, endedAt, waterConsumptionPerHour);

      // Assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should calculate water amount for 30 minutes duration', () => {
      // Arrange
      const startedAt = new Date('2024-01-01T00:00:00Z');
      const endedAt = new Date('2024-01-01T00:30:00Z');
      const waterConsumptionPerHour = 100;
      const expectedResult = 50;

      // Act
      const actualResult = ProductionUtils.calculateWaterAmount(startedAt, endedAt, waterConsumptionPerHour);

      // Assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should calculate water amount for 15 minutes duration', () => {
      // Arrange
      const startedAt = new Date('2024-01-01T00:00:00Z');
      const endedAt = new Date('2024-01-01T00:15:00Z');
      const waterConsumptionPerHour = 100;
      const expectedResult = 25;

      // Act
      const actualResult = ProductionUtils.calculateWaterAmount(startedAt, endedAt, waterConsumptionPerHour);

      // Assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should calculate water amount with fractional consumption rate', () => {
      // Arrange
      const startedAt = new Date('2024-01-01T00:00:00Z');
      const endedAt = new Date('2024-01-01T01:00:00Z');
      const waterConsumptionPerHour = 50.5;
      const expectedResult = 50.5;

      // Act
      const actualResult = ProductionUtils.calculateWaterAmount(startedAt, endedAt, waterConsumptionPerHour);

      // Assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should calculate water amount for zero consumption rate', () => {
      // Arrange
      const startedAt = new Date('2024-01-01T00:00:00Z');
      const endedAt = new Date('2024-01-01T01:00:00Z');
      const waterConsumptionPerHour = 0;
      const expectedResult = 0;

      // Act
      const actualResult = ProductionUtils.calculateWaterAmount(startedAt, endedAt, waterConsumptionPerHour);

      // Assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should calculate water amount for very short duration (1 second)', () => {
      // Arrange
      const startedAt = new Date('2024-01-01T00:00:00Z');
      const endedAt = new Date('2024-01-01T00:00:01Z');
      const waterConsumptionPerHour = 3600;
      const expectedResult = 1;

      // Act
      const actualResult = ProductionUtils.calculateWaterAmount(startedAt, endedAt, waterConsumptionPerHour);

      // Assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should calculate water amount for long duration (24 hours)', () => {
      // Arrange
      const startedAt = new Date('2024-01-01T00:00:00Z');
      const endedAt = new Date('2024-01-02T00:00:00Z');
      const waterConsumptionPerHour = 100;
      const expectedResult = 2400;

      // Act
      const actualResult = ProductionUtils.calculateWaterAmount(startedAt, endedAt, waterConsumptionPerHour);

      // Assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should handle dates with milliseconds', () => {
      // Arrange
      const startedAt = new Date('2024-01-01T00:00:00.500Z');
      const endedAt = new Date('2024-01-01T01:00:00.500Z');
      const waterConsumptionPerHour = 100;
      const expectedResult = 100;

      // Act
      const actualResult = ProductionUtils.calculateWaterAmount(startedAt, endedAt, waterConsumptionPerHour);

      // Assert
      expect(actualResult).toBe(expectedResult);
    });
  });

  describe('invalid inputs', () => {
    it('should throw error when endedAt is before startedAt', () => {
      // Arrange
      const startedAt = new Date('2024-01-01T01:00:00Z');
      const endedAt = new Date('2024-01-01T00:00:00Z');
      const waterConsumptionPerHour = 100;
      const expectedResult = 'endedAtInSeconds must be greater than startedAtInSeconds';

      // Act & Assert
      expect(() => {
        ProductionUtils.calculateWaterAmount(startedAt, endedAt, waterConsumptionPerHour);
      }).toThrow(expectedResult);
    });

    it('should throw error when startedAt equals endedAt', () => {
      // Arrange
      const startedAt = new Date('2024-01-01T00:00:00Z');
      const endedAt = new Date('2024-01-01T00:00:00Z');
      const waterConsumptionPerHour = 100;
      const expectedResult = 'endedAtInSeconds must be greater than startedAtInSeconds';

      // Act & Assert
      expect(() => {
        ProductionUtils.calculateWaterAmount(startedAt, endedAt, waterConsumptionPerHour);
      }).toThrow(expectedResult);
    });

    it('should throw error for negative water consumption rate', () => {
      // Arrange
      const startedAt = new Date('2024-01-01T00:00:00Z');
      const endedAt = new Date('2024-01-01T01:00:00Z');
      const waterConsumptionPerHour = -100;
      const expectedResult = `waterConsumptionPerHour must be non-negative: [${waterConsumptionPerHour}]`;

      // Act & Assert
      expect(() => {
        ProductionUtils.calculateWaterAmount(startedAt, endedAt, waterConsumptionPerHour);
      }).toThrow(expectedResult);
    });
  });

  describe('edge cases', () => {
    it('should calculate water amount across year boundary', () => {
      // Arrange
      const startedAt = new Date('2023-12-31T23:00:00Z');
      const endedAt = new Date('2024-01-01T01:00:00Z');
      const waterConsumptionPerHour = 100;
      const expectedResult = 200;

      // Act
      const actualResult = ProductionUtils.calculateWaterAmount(startedAt, endedAt, waterConsumptionPerHour);

      // Assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should handle very large water consumption values', () => {
      // Arrange
      const startedAt = new Date('2024-01-01T00:00:00Z');
      const endedAt = new Date('2024-01-01T01:00:00Z');
      const waterConsumptionPerHour = 1000000;
      const expectedResult = 1000000;

      // Act
      const actualResult = ProductionUtils.calculateWaterAmount(startedAt, endedAt, waterConsumptionPerHour);

      // Assert
      expect(actualResult).toBe(expectedResult);
    });

    it('should handle very small water consumption values', () => {
      // Arrange
      const startedAt = new Date('2024-01-01T00:00:00Z');
      const endedAt = new Date('2024-01-01T01:00:00Z');
      const waterConsumptionPerHour = 0.001;
      const expectedResult = 0.001;

      // Act
      const actualResult = ProductionUtils.calculateWaterAmount(startedAt, endedAt, waterConsumptionPerHour);

      // Assert
      expect(actualResult).toBe(expectedResult);
    });
  });
});
