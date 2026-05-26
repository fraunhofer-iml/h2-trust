/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchEntity, ProcessStepEntity } from '@h2-trust/contracts/entities';
import { BatchEntityFixture, CompanyEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { BatchType } from '@h2-trust/domain';
import { calculateAccountingPeriods } from './production.utils';

describe('ProductionUtils.calculateAccountingPeriods', () => {
  const emptyBatchEntityArray: readonly BatchEntity[] = [];

  describe('valid inputs', () => {
    it('should calculate single accounting period for 1 hour duration when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T01:00:00Z');
      const givenTotalAmount = 100;
      const givenPredecessors: ProcessStepEntity[] = [];
      const expectedResult = [
        {
          startedAt: new Date(givenStartedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: givenTotalAmount,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // act
      const actualResult = calculateAccountingPeriods(
        givenStartedAt,
        givenEndedAt,
        givenTotalAmount,
        givenPredecessors,
      );

      // assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should calculate two accounting periods for 2 hour duration when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T02:00:00Z');
      const givenTotalAmount = 200;
      const givenPredecessors: ProcessStepEntity[] = [];
      const expectedAmountPerPeriod = givenTotalAmount / 2;
      const expectedResult = [
        {
          startedAt: new Date(givenStartedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-01T01:00:00Z'),
          endedAt: new Date('2024-01-01T01:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // act
      const actualResult = calculateAccountingPeriods(
        givenStartedAt,
        givenEndedAt,
        givenTotalAmount,
        givenPredecessors,
      );

      // assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should align start time to accounting period boundary when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:30:00Z');
      const givenEndedAt = new Date('2024-01-01T01:30:00Z');
      const givenTotalAmount = 100;
      const givenPredecessors: ProcessStepEntity[] = [];
      const expectedAmountPerPeriod = givenTotalAmount / 2;
      const expectedResult = [
        {
          startedAt: new Date('2024-01-01T00:00:00Z'),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-01T01:00:00Z'),
          endedAt: new Date('2024-01-01T01:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // act
      const actualResult = calculateAccountingPeriods(
        givenStartedAt,
        givenEndedAt,
        givenTotalAmount,
        givenPredecessors,
      );

      // assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should distribute amount evenly across multiple periods when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T03:00:00Z');
      const givenTotalAmount = 300;
      const givenPredecessors: ProcessStepEntity[] = [];
      const expectedAmountPerPeriod = givenTotalAmount / 3;
      const expectedResult = [
        {
          startedAt: new Date(givenStartedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-01T01:00:00Z'),
          endedAt: new Date('2024-01-01T01:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-01T02:00:00Z'),
          endedAt: new Date('2024-01-01T02:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // act
      const actualResult = calculateAccountingPeriods(
        givenStartedAt,
        givenEndedAt,
        givenTotalAmount,
        givenPredecessors,
      );

      // assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should include predecessors matching the period start time when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T02:00:00Z');
      const givenTotalAmount = 200;

      const givenBatch1 = BatchEntityFixture.createPowerBatch({
        id: 'batch-1',
        amount: 50,
        type: BatchType.POWER,
        owner: CompanyEntityFixture.createPowerProducer({ name: 'owner-1' }),
      });
      const givenBatch2 = BatchEntityFixture.createPowerBatch({
        id: 'batch-2',
        amount: 50,
        type: BatchType.POWER,
        owner: CompanyEntityFixture.createPowerProducer({ name: 'owner-2' }),
      });
      const givenPredecessors: ProcessStepEntity[] = [
        {
          id: 'step-1',
          startedAt: new Date(givenStartedAt),
          batch: givenBatch1,
        } as ProcessStepEntity,
        {
          id: 'step-2',
          startedAt: new Date('2024-01-01T01:00:00Z'),
          batch: givenBatch2,
        } as ProcessStepEntity,
      ];
      const expectedAmountPerPeriod = givenTotalAmount / 2;
      const expectedResult = [
        {
          startedAt: new Date(givenStartedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: [givenBatch1],
        },
        {
          startedAt: new Date('2024-01-01T01:00:00Z'),
          endedAt: new Date('2024-01-01T01:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: [givenBatch2],
        },
      ];

      // act
      const actualResult = calculateAccountingPeriods(
        givenStartedAt,
        givenEndedAt,
        givenTotalAmount,
        givenPredecessors,
      );

      // assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should group multiple predecessors with same start time when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T01:00:00Z');
      const givenTotalAmount = 100;
      const givenBatch1 = BatchEntityFixture.createPowerBatch({
        id: 'batch-1',
        amount: 30,
        type: BatchType.POWER,
        owner: CompanyEntityFixture.createPowerProducer({ name: 'owner-1' }),
      });
      const givenBatch2 = BatchEntityFixture.createPowerBatch({
        id: 'batch-2',
        amount: 20,
        type: BatchType.POWER,
        owner: CompanyEntityFixture.createPowerProducer({ name: 'owner-2' }),
      });

      const givenPredecessors: ProcessStepEntity[] = [
        {
          id: 'step-1',
          startedAt: new Date(givenStartedAt),
          batch: givenBatch1,
        } as ProcessStepEntity,
        {
          id: 'step-2',
          startedAt: new Date(givenStartedAt),
          batch: givenBatch2,
        } as ProcessStepEntity,
      ];
      const expectedResult = [
        {
          startedAt: new Date(givenStartedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: givenTotalAmount,
          predecessors: [givenBatch1, givenBatch2],
        },
      ];

      // act
      const actualResult = calculateAccountingPeriods(
        givenStartedAt,
        givenEndedAt,
        givenTotalAmount,
        givenPredecessors,
      );

      // assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should handle periods spanning across days when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T23:00:00Z');
      const givenEndedAt = new Date('2024-01-02T01:00:00Z');
      const givenTotalAmount = 200;
      const givenPredecessors: ProcessStepEntity[] = [];
      const expectedAmountPerPeriod = givenTotalAmount / 2;
      const expectedResult = [
        {
          startedAt: new Date(givenStartedAt),
          endedAt: new Date('2024-01-01T23:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-02T00:00:00Z'),
          endedAt: new Date('2024-01-02T00:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // act
      const actualResult = calculateAccountingPeriods(
        givenStartedAt,
        givenEndedAt,
        givenTotalAmount,
        givenPredecessors,
      );

      // assert
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('invalid inputs', () => {
    it('should throw error when endedAt is before startedAt', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T02:00:00Z');
      const givenEndedAt = new Date('2024-01-01T01:00:00Z');
      const givenTotalAmount = 100;
      const givenPredecessors: ProcessStepEntity[] = [];
      const expectedResult = 'endedAtInSeconds must be greater than startedAtInSeconds';

      // act & assert
      const actualOperation = () => {
        calculateAccountingPeriods(givenStartedAt, givenEndedAt, givenTotalAmount, givenPredecessors);
      };

      expect(actualOperation).toThrow(expectedResult);
    });

    it('should throw error when startedAt equals endedAt', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T00:00:00Z');
      const givenTotalAmount = 100;
      const givenPredecessors: ProcessStepEntity[] = [];
      const expectedResult = 'endedAtInSeconds must be greater than startedAtInSeconds';

      // act & assert
      const actualOperation = () => {
        calculateAccountingPeriods(givenStartedAt, givenEndedAt, givenTotalAmount, givenPredecessors);
      };

      expect(actualOperation).toThrow(expectedResult);
    });

    it('should throw error when totalAmount is zero', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T01:00:00Z');
      const givenTotalAmount = 0;
      const givenPredecessors: ProcessStepEntity[] = [];
      const expectedResult = 'batchAmount must be greater than zero';

      // act & assert
      const actualOperation = () => {
        calculateAccountingPeriods(givenStartedAt, givenEndedAt, givenTotalAmount, givenPredecessors);
      };

      expect(actualOperation).toThrow(expectedResult);
    });

    it('should throw error when totalAmount is negative', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T01:00:00Z');
      const givenTotalAmount = -100;
      const givenPredecessors: ProcessStepEntity[] = [];
      const expectedResult = 'batchAmount must be greater than zero';

      // act & assert
      const actualOperation = () => {
        calculateAccountingPeriods(givenStartedAt, givenEndedAt, givenTotalAmount, givenPredecessors);
      };

      expect(actualOperation).toThrow(expectedResult);
    });
  });

  describe('edge cases', () => {
    it('should handle very small amounts when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T02:00:00Z');
      const givenTotalAmount = 0.001;
      const givenPredecessors: ProcessStepEntity[] = [];
      const expectedAmountPerPeriod = givenTotalAmount / 2;
      const expectedResult = [
        {
          startedAt: new Date(givenStartedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-01T01:00:00Z'),
          endedAt: new Date('2024-01-01T01:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // act
      const actualResult = calculateAccountingPeriods(
        givenStartedAt,
        givenEndedAt,
        givenTotalAmount,
        givenPredecessors,
      );

      // assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should handle very large amounts when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T01:00:00Z');
      const givenTotalAmount = 1000000;
      const givenPredecessors: ProcessStepEntity[] = [];
      const expectedResult = [
        {
          startedAt: new Date(givenStartedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: givenTotalAmount,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // act
      const actualResult = calculateAccountingPeriods(
        givenStartedAt,
        givenEndedAt,
        givenTotalAmount,
        givenPredecessors,
      );

      // assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should handle many accounting periods when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T12:00:00Z');
      const givenTotalAmount = 1200;
      const givenPredecessors: ProcessStepEntity[] = [];
      const expectedNumberOfPeriods = 12;
      const expectedAmountPerPeriod = givenTotalAmount / expectedNumberOfPeriods;

      // act
      const actualResult = calculateAccountingPeriods(
        givenStartedAt,
        givenEndedAt,
        givenTotalAmount,
        givenPredecessors,
      );

      // assert
      expect(actualResult).toHaveLength(expectedNumberOfPeriods);
      expect(actualResult[0].amount).toBe(expectedAmountPerPeriod);
      expect(actualResult[11].amount).toBe(expectedAmountPerPeriod);
      expect(actualResult[0].startedAt).toEqual(new Date(givenStartedAt));
      expect(actualResult[11].startedAt).toEqual(new Date('2024-01-01T11:00:00Z'));
    });

    it('should handle predecessors not matching any period start time when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T02:00:00Z');
      const givenTotalAmount = 200;
      const givenBatch1 = BatchEntityFixture.createPowerBatch({
        id: 'batch-1',
        amount: 50,
        type: BatchType.POWER,
        owner: CompanyEntityFixture.createPowerProducer({ name: 'owner-1' }),
      });

      const givenPredecessors: ProcessStepEntity[] = [
        {
          id: 'step-1',
          startedAt: new Date('2024-01-01T00:30:00Z'),
          batch: givenBatch1,
        } as ProcessStepEntity,
      ];
      const expectedAmountPerPeriod = givenTotalAmount / 2;
      const expectedResult = [
        {
          startedAt: new Date(givenStartedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-01T01:00:00Z'),
          endedAt: new Date('2024-01-01T01:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // act
      const actualResult = calculateAccountingPeriods(
        givenStartedAt,
        givenEndedAt,
        givenTotalAmount,
        givenPredecessors,
      );

      // assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should handle year boundary crossing when called', () => {
      // arrange
      const givenStartedAt = new Date('2023-12-31T23:00:00Z');
      const givenEndedAt = new Date('2024-01-01T01:00:00Z');
      const givenTotalAmount = 200;
      const givenPredecessors: ProcessStepEntity[] = [];
      const expectedAmountPerPeriod = givenTotalAmount / 2;
      const expectedResult = [
        {
          startedAt: new Date(givenStartedAt),
          endedAt: new Date('2023-12-31T23:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
        {
          startedAt: new Date('2024-01-01T00:00:00Z'),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: expectedAmountPerPeriod,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // act
      const actualResult = calculateAccountingPeriods(
        givenStartedAt,
        givenEndedAt,
        givenTotalAmount,
        givenPredecessors,
      );

      // assert
      expect(actualResult).toEqual(expectedResult);
    });

    it('should handle partial hour at end of period when called', () => {
      // arrange
      const givenStartedAt = new Date('2024-01-01T00:00:00Z');
      const givenEndedAt = new Date('2024-01-01T00:30:00Z');
      const givenTotalAmount = 100;
      const givenPredecessors: ProcessStepEntity[] = [];
      const expectedResult = [
        {
          startedAt: new Date(givenStartedAt),
          endedAt: new Date('2024-01-01T00:59:59Z'),
          amount: givenTotalAmount,
          predecessors: emptyBatchEntityArray,
        },
      ];

      // act
      const actualResult = calculateAccountingPeriods(
        givenStartedAt,
        givenEndedAt,
        givenTotalAmount,
        givenPredecessors,
      );

      // assert
      expect(actualResult).toEqual(expectedResult);
    });
  });
});
