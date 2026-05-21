/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity } from '@h2-trust/contracts/entities';
import {
  BatchEntityFixture,
  HydrogenComponentEntityFixture,
  HydrogenStorageUnitEntityFixture,
  ProcessStepEntityFixture,
  QualityDetailsEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { BatchType, ProcessType, RfnboType } from '@h2-trust/domain';
import { allocateBottling } from './bottling.allocator';

describe('allocateBottling', () => {
  describe('allocate', () => {
    it('should allocate single process step when amount matches exactly', () => {
      // arrange
      const givenHydrogenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction({
          batch: BatchEntityFixture.createHydrogenBatch({
            amount: 100,
            qualityDetails: QualityDetailsEntityFixture.create(),
          }),
        }),
      ];
      const givenHydrogenComposition = [HydrogenComponentEntityFixture.createRfnboReady({ amount: 100 })];

      // act
      const actualResult = allocateBottling(givenProcessSteps, givenHydrogenComposition, givenHydrogenStorageUnitId);

      // assert
      expect(actualResult.batchesForBottle).toHaveLength(1);
      expect(actualResult.batchesForBottle[0].id).toBe(givenProcessSteps[0].batch.id);
      expect(actualResult.processStepsToBeSplit).toHaveLength(0);
      expect(actualResult.consumedSplitProcessSteps).toHaveLength(0);
      expect(actualResult.processStepsForRemainingAmount).toHaveLength(0);
    });

    it('should allocate multiple process steps when single batch is not enough', () => {
      // arrange
      const givenHydrogenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction({
          id: 'ps-1',
          batch: BatchEntityFixture.createHydrogenBatch({
            id: 'batch-1',
            amount: 50,
            qualityDetails: QualityDetailsEntityFixture.create(),
          }),
        }),
        ProcessStepEntityFixture.createHydrogenProduction({
          id: 'ps-2',
          batch: BatchEntityFixture.createHydrogenBatch({
            id: 'batch-2',
            amount: 50,
            qualityDetails: QualityDetailsEntityFixture.create(),
          }),
        }),
      ];
      const givenHydrogenComposition = [HydrogenComponentEntityFixture.createRfnboReady({ amount: 100 })];

      // act
      const actualResult = allocateBottling(givenProcessSteps, givenHydrogenComposition, givenHydrogenStorageUnitId);

      // assert
      expect(actualResult.batchesForBottle).toHaveLength(2);
      expect(actualResult.batchesForBottle[0].id).toBe(givenProcessSteps[0].batch.id);
      expect(actualResult.batchesForBottle[1].id).toBe(givenProcessSteps[1].batch.id);
      expect(actualResult.processStepsToBeSplit).toHaveLength(0);
    });

    it('should split last process step when amount exceeds requested', () => {
      // arrange
      const givenHydrogenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction({
          batch: BatchEntityFixture.createHydrogenBatch({
            amount: 150,
            qualityDetails: QualityDetailsEntityFixture.create(),
            hydrogenStorageUnit: HydrogenStorageUnitEntityFixture.create({
              id: givenHydrogenStorageUnitId,
            }),
          }),
        }),
      ];
      const givenHydrogenComposition = [HydrogenComponentEntityFixture.createRfnboReady({ amount: 100 })];

      // act
      const actualResult = allocateBottling(givenProcessSteps, givenHydrogenComposition, givenHydrogenStorageUnitId);

      // assert
      expect(actualResult.batchesForBottle).toHaveLength(0);
      expect(actualResult.processStepsToBeSplit).toHaveLength(1);
      expect(actualResult.processStepsToBeSplit[0].id).toBe(givenProcessSteps[0].id);
      expect(actualResult.consumedSplitProcessSteps).toHaveLength(1);
      expect(actualResult.consumedSplitProcessSteps[0].batch.amount).toBe(100);
      expect(actualResult.consumedSplitProcessSteps[0].batch.active).toBe(false);
      expect(actualResult.processStepsForRemainingAmount).toHaveLength(1);
      expect(actualResult.processStepsForRemainingAmount[0].batch.amount).toBe(50);
      expect(actualResult.processStepsForRemainingAmount[0].batch.active).toBe(true);
    });

    it('should create split process steps with correct properties when called', () => {
      // arrange
      const givenHydrogenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction({
          batch: BatchEntityFixture.createHydrogenBatch({
            amount: 200,
            qualityDetails: QualityDetailsEntityFixture.create(),
            hydrogenStorageUnit: HydrogenStorageUnitEntityFixture.create({
              id: givenHydrogenStorageUnitId,
            }),
          }),
        }),
      ];
      const givenHydrogenComposition = [HydrogenComponentEntityFixture.createRfnboReady({ amount: 80 })];

      // act
      const actualResult = allocateBottling(givenProcessSteps, givenHydrogenComposition, givenHydrogenStorageUnitId);

      // assert
      const consumedStep = actualResult.consumedSplitProcessSteps[0];
      expect(consumedStep.type).toBe(ProcessType.HYDROGEN_PRODUCTION);
      expect(consumedStep.batch.type).toBe(BatchType.HYDROGEN);
      expect(consumedStep.batch.predecessors[0].id).toBe(givenProcessSteps[0].batch.id);
      expect(consumedStep.startedAt).toEqual(givenProcessSteps[0].startedAt);
      expect(consumedStep.endedAt).toEqual(givenProcessSteps[0].endedAt);

      const remainingStep = actualResult.processStepsForRemainingAmount[0];
      expect(remainingStep.type).toBe(ProcessType.HYDROGEN_PRODUCTION);
      expect(remainingStep.batch.amount).toBe(120);
      expect(remainingStep.batch.active).toBe(true);
    });

    it('should filter process steps by rfnbo type when called', () => {
      // arrange
      const givenHydrogenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction({
          id: 'ps-1',
          batch: BatchEntityFixture.createHydrogenBatch({
            id: 'batch-green',
            amount: 100,
            qualityDetails: QualityDetailsEntityFixture.create(),
          }),
        }),
        ProcessStepEntityFixture.createHydrogenProduction({
          id: 'ps-2',
          batch: BatchEntityFixture.createHydrogenBatch({
            id: 'batch-yellow',
            amount: 100,
            qualityDetails: QualityDetailsEntityFixture.create(),
          }),
        }),
      ];
      const givenHydrogenComposition = [HydrogenComponentEntityFixture.createRfnboReady({ amount: 100 })];

      // act
      const actualResult = allocateBottling(givenProcessSteps, givenHydrogenComposition, givenHydrogenStorageUnitId);

      // assert
      expect(actualResult.batchesForBottle).toHaveLength(1);
      expect(actualResult.batchesForBottle[0].id).toBe(givenProcessSteps[0].batch.id);
    });

    it('should throw exception when not enough rfnbo-ready hydrogen available', () => {
      // arrange
      const givenHydrogenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction({
          batch: BatchEntityFixture.createHydrogenBatch({
            amount: 50,
            qualityDetails: QualityDetailsEntityFixture.create(),
          }),
        }),
      ];
      const givenHydrogenComposition = [HydrogenComponentEntityFixture.createRfnboReady({ amount: 100 })];

      const expectedErrorMessage = `There is not enough hydrogen in storage unit '${givenHydrogenStorageUnitId}' for the requested amount of 100 of quality ${RfnboType.RFNBO_READY}.`;

      // act & assert
      expect(() => allocateBottling(givenProcessSteps, givenHydrogenComposition, givenHydrogenStorageUnitId)).toThrow(
        expectedErrorMessage,
      );
    });

    it('should return empty results when hydrogen composition is empty', () => {
      // arrange
      const givenHydrogenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction({
          batch: BatchEntityFixture.createHydrogenBatch({
            amount: 100,
            qualityDetails: QualityDetailsEntityFixture.create(),
          }),
        }),
      ];
      const givenHydrogenComposition: HydrogenComponentEntity[] = [];

      // act
      const actualResult = allocateBottling(givenProcessSteps, givenHydrogenComposition, givenHydrogenStorageUnitId);

      // assert
      expect(actualResult.batchesForBottle).toHaveLength(0);
      expect(actualResult.processStepsToBeSplit).toHaveLength(0);
      expect(actualResult.consumedSplitProcessSteps).toHaveLength(0);
      expect(actualResult.processStepsForRemainingAmount).toHaveLength(0);
    });
  });
});
