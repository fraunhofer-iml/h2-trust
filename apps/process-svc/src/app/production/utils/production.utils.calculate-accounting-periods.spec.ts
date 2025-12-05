/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { ProductionUtils } from './production.utils';
import { ProcessType } from '@h2-trust/domain';

describe('ProductionUtils.calculateAccountingPeriods', () => {
  const emptyBatchEntityArray: readonly BatchEntity[] = [];

  describe('valid inputs', () => {
    it('should calculate single accounting period for 1 hour duration', () => {
      // Arrange
      const startedAt = '2024-01-01T00:00:00Z';
      const endedAt = '2024-01-01T01:00:00Z';
      const totalAmount = 100;
      const predecessors: ProcessStepEntity[] = [];
      const expectedResult = [
        {
          startedAt: new Date(startedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: totalAmount,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // Act
      const actualResult = ProductionUtils.calculateAccountingPeriods(
        startedAt,
        endedAt,
        totalAmount,
        predecessors,
      );

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should calculate two accounting periods for 2 hour duration', () => {
      // Arrange
      const startedAt = '2024-01-01T00:00:00Z';
      const endedAt = '2024-01-01T02:00:00Z';
      const totalAmount = 200;
      const predecessors: ProcessStepEntity[] = [];
      const amountPerPeriod = totalAmount / 2;
      const expectedResult = [
        {
          startedAt: new Date(startedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: amountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-01T01:00:00Z'),
          endedAt: new Date('2024-01-01T01:59:59Z'),
          amount: amountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // Act
      const actualResult = ProductionUtils.calculateAccountingPeriods(
        startedAt,
        endedAt,
        totalAmount,
        predecessors,
      );

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should align start time to accounting period boundary', () => {
      // Arrange
      const startedAt = '2024-01-01T00:30:00Z';
      const endedAt = '2024-01-01T01:30:00Z';
      const totalAmount = 100;
      const predecessors: ProcessStepEntity[] = [];
      const amountPerPeriod = totalAmount / 2;
      const expectedResult = [
        {
          startedAt: new Date('2024-01-01T00:00:00Z'),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: amountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-01T01:00:00Z'),
          endedAt: new Date('2024-01-01T01:59:59Z'),
          amount: amountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // Act
      const actualResult = ProductionUtils.calculateAccountingPeriods(
        startedAt,
        endedAt,
        totalAmount,
        predecessors,
      );

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should distribute amount evenly across multiple periods', () => {
      // Arrange
      const startedAt = '2024-01-01T00:00:00Z';
      const endedAt = '2024-01-01T03:00:00Z';
      const totalAmount = 300;
      const predecessors: ProcessStepEntity[] = [];
      const amountPerPeriod = totalAmount / 3;
      const expectedResult = [
        {
          startedAt: new Date(startedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: amountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-01T01:00:00Z'),
          endedAt: new Date('2024-01-01T01:59:59Z'),
          amount: amountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-01T02:00:00Z'),
          endedAt: new Date('2024-01-01T02:59:59Z'),
          amount: amountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // Act
      const actualResult = ProductionUtils.calculateAccountingPeriods(
        startedAt,
        endedAt,
        totalAmount,
        predecessors,
      );

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should include predecessors matching the period start time', () => {
      // Arrange
      const startedAt = '2024-01-01T00:00:00Z';
      const endedAt = '2024-01-01T02:00:00Z';
      const totalAmount = 200;
      const batch1: BatchEntity = {
        id: 'batch-1',
        amount: 50,
        type: ProcessType.POWER_PRODUCTION,
        owner: 'owner-1',
      } as BatchEntity;
      const batch2: BatchEntity = {
        id: 'batch-2',
        amount: 50,
        type: ProcessType.POWER_PRODUCTION,
        owner: 'owner-2',
      } as BatchEntity;
      const predecessors: ProcessStepEntity[] = [
        {
          id: 'step-1',
          startedAt: new Date(startedAt),
          batch: batch1,
        } as ProcessStepEntity,
        {
          id: 'step-2',
          startedAt: new Date('2024-01-01T01:00:00Z'),
          batch: batch2,
        } as ProcessStepEntity,
      ];
      const amountPerPeriod = totalAmount / 2;
      const expectedResult = [
        {
          startedAt: new Date(startedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: amountPerPeriod,
          predecessors: [batch1],
        },
        {
          startedAt: new Date('2024-01-01T01:00:00Z'),
          endedAt: new Date('2024-01-01T01:59:59Z'),
          amount: amountPerPeriod,
          predecessors: [batch2],
        },
      ];

      // Act
      const actualResult = ProductionUtils.calculateAccountingPeriods(
        startedAt,
        endedAt,
        totalAmount,
        predecessors,
      );

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should group multiple predecessors with same start time', () => {
      // Arrange
      const startedAt = '2024-01-01T00:00:00Z';
      const endedAt = '2024-01-01T01:00:00Z';
      const totalAmount = 100;
      const batch1: BatchEntity = {
        id: 'batch-1',
        amount: 30,
        type: ProcessType.POWER_PRODUCTION,
        owner: 'owner-1',
      } as BatchEntity;
      const batch2: BatchEntity = {
        id: 'batch-2',
        amount: 20,
        type: ProcessType.POWER_PRODUCTION,
        owner: 'owner-2',
      } as BatchEntity;
      const predecessors: ProcessStepEntity[] = [
        {
          id: 'step-1',
          startedAt: new Date(startedAt),
          batch: batch1,
        } as ProcessStepEntity,
        {
          id: 'step-2',
          startedAt: new Date(startedAt),
          batch: batch2,
        } as ProcessStepEntity,
      ];
      const expectedResult = [
        {
          startedAt: new Date(startedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: totalAmount,
          predecessors: [batch1, batch2],
        },
      ];

      // Act
      const actualResult = ProductionUtils.calculateAccountingPeriods(
        startedAt,
        endedAt,
        totalAmount,
        predecessors,
      );

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should handle periods spanning across days', () => {
      // Arrange
      const startedAt = '2024-01-01T23:00:00Z';
      const endedAt = '2024-01-02T01:00:00Z';
      const totalAmount = 200;
      const predecessors: ProcessStepEntity[] = [];
      const amountPerPeriod = totalAmount / 2;
      const expectedResult = [
        {
          startedAt: new Date(startedAt),
          endedAt: new Date('2024-01-01T23:59:59Z'),
          amount: amountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-02T00:00:00Z'),
          endedAt: new Date('2024-01-02T00:59:59Z'),
          amount: amountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // Act
      const actualResult = ProductionUtils.calculateAccountingPeriods(
        startedAt,
        endedAt,
        totalAmount,
        predecessors,
      );

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('invalid inputs', () => {
    it('should throw error when endedAt is before startedAt', () => {
      // Arrange
      const startedAt = '2024-01-01T02:00:00Z';
      const endedAt = '2024-01-01T01:00:00Z';
      const totalAmount = 100;
      const predecessors: ProcessStepEntity[] = [];
      const expectedResult = 'endedAtInSeconds must be greater than startedAtInSeconds';

      // Act & Assert
      expect(() => {
        ProductionUtils.calculateAccountingPeriods(startedAt, endedAt, totalAmount, predecessors);
      }).toThrow(expectedResult);
    });

    it('should throw error when startedAt equals endedAt', () => {
      // Arrange
      const startedAt = '2024-01-01T00:00:00Z';
      const endedAt = '2024-01-01T00:00:00Z';
      const totalAmount = 100;
      const predecessors: ProcessStepEntity[] = [];
      const expectedResult = 'endedAtInSeconds must be greater than startedAtInSeconds';

      // Act & Assert
      expect(() => {
        ProductionUtils.calculateAccountingPeriods(startedAt, endedAt, totalAmount, predecessors);
      }).toThrow(expectedResult);
    });

    it('should throw error when totalAmount is zero', () => {
      // Arrange
      const startedAt = '2024-01-01T00:00:00Z';
      const endedAt = '2024-01-01T01:00:00Z';
      const totalAmount = 0;
      const predecessors: ProcessStepEntity[] = [];
      const expectedResult = 'batchAmount must be greater than zero';

      // Act & Assert
      expect(() => {
        ProductionUtils.calculateAccountingPeriods(startedAt, endedAt, totalAmount, predecessors);
      }).toThrow(expectedResult);
    });

    it('should throw error when totalAmount is negative', () => {
      // Arrange
      const startedAt = '2024-01-01T00:00:00Z';
      const endedAt = '2024-01-01T01:00:00Z';
      const totalAmount = -100;
      const predecessors: ProcessStepEntity[] = [];
      const expectedResult = 'batchAmount must be greater than zero';

      // Act & Assert
      expect(() => {
        ProductionUtils.calculateAccountingPeriods(startedAt, endedAt, totalAmount, predecessors);
      }).toThrow(expectedResult);
    });
  });

  describe('edge cases', () => {
    it('should handle very small amounts', () => {
      // Arrange
      const startedAt = '2024-01-01T00:00:00Z';
      const endedAt = '2024-01-01T02:00:00Z';
      const totalAmount = 0.001;
      const predecessors: ProcessStepEntity[] = [];
      const amountPerPeriod = totalAmount / 2;
      const expectedResult = [
        {
          startedAt: new Date(startedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: amountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-01T01:00:00Z'),
          endedAt: new Date('2024-01-01T01:59:59Z'),
          amount: amountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // Act
      const actualResult = ProductionUtils.calculateAccountingPeriods(
        startedAt,
        endedAt,
        totalAmount,
        predecessors,
      );

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should handle very large amounts', () => {
      // Arrange
      const startedAt = '2024-01-01T00:00:00Z';
      const endedAt = '2024-01-01T01:00:00Z';
      const totalAmount = 1000000;
      const predecessors: ProcessStepEntity[] = [];
      const expectedResult = [
        {
          startedAt: new Date(startedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: totalAmount,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // Act
      const actualResult = ProductionUtils.calculateAccountingPeriods(
        startedAt,
        endedAt,
        totalAmount,
        predecessors,
      );

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should handle many accounting periods', () => {
      // Arrange
      const startedAt = '2024-01-01T00:00:00Z';
      const endedAt = '2024-01-01T12:00:00Z';
      const totalAmount = 1200;
      const predecessors: ProcessStepEntity[] = [];
      const expectedNumberOfPeriods = 12;
      const amountPerPeriod = totalAmount / expectedNumberOfPeriods;

      // Act
      const actualResult = ProductionUtils.calculateAccountingPeriods(
        startedAt,
        endedAt,
        totalAmount,
        predecessors,
      );

      // Assert
      expect(actualResult).toHaveLength(expectedNumberOfPeriods);
      expect(actualResult[0].amount).toBe(amountPerPeriod);
      expect(actualResult[11].amount).toBe(amountPerPeriod);
      expect(actualResult[0].startedAt).toEqual(new Date(startedAt));
      expect(actualResult[11].startedAt).toEqual(new Date('2024-01-01T11:00:00Z'));
    });

    it('should handle predecessors not matching any period start time', () => {
      // Arrange
      const startedAt = '2024-01-01T00:00:00Z';
      const endedAt = '2024-01-01T02:00:00Z';
      const totalAmount = 200;
      const batch1: BatchEntity = {
        id: 'batch-1',
        amount: 50,
        type: ProcessType.POWER_PRODUCTION,
        owner: 'owner-1',
      } as BatchEntity;
      const predecessors: ProcessStepEntity[] = [
        {
          id: 'step-1',
          startedAt: new Date('2024-01-01T00:30:00Z'),
          batch: batch1,
        } as ProcessStepEntity,
      ];
      const amountPerPeriod = totalAmount / 2;
      const expectedResult = [
        {
          startedAt: new Date(startedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: amountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-01T01:00:00Z'),
          endedAt: new Date('2024-01-01T01:59:59Z'),
          amount: amountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // Act
      const actualResult = ProductionUtils.calculateAccountingPeriods(
        startedAt,
        endedAt,
        totalAmount,
        predecessors,
      );

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should handle year boundary crossing', () => {
      // Arrange
      const startedAt = '2023-12-31T23:00:00Z';
      const endedAt = '2024-01-01T01:00:00Z';
      const totalAmount = 200;
      const predecessors: ProcessStepEntity[] = [];
      const amountPerPeriod = totalAmount / 2;
      const expectedResult = [
        {
          startedAt: new Date(startedAt),
          endedAt: new Date('2023-12-31T23:59:59Z'),
          amount: amountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-01T00:00:00Z'),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: amountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // Act
      const actualResult = ProductionUtils.calculateAccountingPeriods(
        startedAt,
        endedAt,
        totalAmount,
        predecessors,
      );

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should handle partial hour at end of period', () => {
      // Arrange
      const startedAt = '2024-01-01T00:00:00Z';
      const endedAt = '2024-01-01T00:30:00Z';
      const totalAmount = 100;
      const predecessors: ProcessStepEntity[] = [];
      const expectedResult = [
        {
          startedAt: new Date(startedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: totalAmount,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // Act
      const actualResult = ProductionUtils.calculateAccountingPeriods(
        startedAt,
        endedAt,
        totalAmount,
        predecessors,
      );

      // Assert
      expect(actualResult).toEqual(expectedResult);
    });
  });
});
