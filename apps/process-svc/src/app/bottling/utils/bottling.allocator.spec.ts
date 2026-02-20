/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStorageUnitEntityFixture } from 'libs/amqp/src/lib/fixtures/hydrogen-storage-unit.entity.fixture';
import { HydrogenComponentEntity } from '@h2-trust/amqp';
import { BatchType, HydrogenColor, ProcessType, RFNBOType } from '@h2-trust/domain';
import {
  BatchEntityFixture,
  HydrogenComponentEntityFixture,
  ProcessStepEntityFixture,
  QualityDetailsEntityFixture,
} from '@h2-trust/fixtures/entities';
import { BottlingAllocator } from './bottling.allocator';

describe('BottlingAllocator', () => {
  describe('allocate', () => {
    it('allocates single process step when amount matches exactly', () => {
      // Arrange
      const givenHydrogenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction({
          batch: BatchEntityFixture.createHydrogenBatch({
            amount: 100,
            qualityDetails: QualityDetailsEntityFixture.createGreen(),
            rfnboType: RFNBOType.RFNBO_READY,
          }),
        }),
      ];
      const givenHydrogenComposition = [HydrogenComponentEntityFixture.createGreen({ amount: 100 })];

      // Act
      const actualResult = BottlingAllocator.allocate(
        givenProcessSteps,
        givenHydrogenComposition,
        givenHydrogenStorageUnitId,
      );

      // Assert
      expect(actualResult.batchesForBottle).toHaveLength(1);
      expect(actualResult.batchesForBottle[0].id).toBe(givenProcessSteps[0].batch.id);
      expect(actualResult.processStepsToBeSplit).toHaveLength(0);
      expect(actualResult.consumedSplitProcessSteps).toHaveLength(0);
      expect(actualResult.processStepsForRemainingAmount).toHaveLength(0);
    });

    it('allocates multiple process steps when single batch is not enough', () => {
      // Arrange
      const givenHydrogenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction({
          id: 'ps-1',
          batch: BatchEntityFixture.createHydrogenBatch({
            id: 'batch-1',
            amount: 50,
            qualityDetails: QualityDetailsEntityFixture.createGreen(),
            rfnboType: RFNBOType.RFNBO_READY,
          }),
        }),
        ProcessStepEntityFixture.createHydrogenProduction({
          id: 'ps-2',
          batch: BatchEntityFixture.createHydrogenBatch({
            id: 'batch-2',
            amount: 50,
            qualityDetails: QualityDetailsEntityFixture.createGreen(),
            rfnboType: RFNBOType.RFNBO_READY,
          }),
        }),
      ];
      const givenHydrogenComposition = [HydrogenComponentEntityFixture.createGreen({ amount: 100 })];

      // Act
      const actualResult = BottlingAllocator.allocate(
        givenProcessSteps,
        givenHydrogenComposition,
        givenHydrogenStorageUnitId,
      );

      // Assert
      expect(actualResult.batchesForBottle).toHaveLength(2);
      expect(actualResult.batchesForBottle[0].id).toBe(givenProcessSteps[0].batch.id);
      expect(actualResult.batchesForBottle[1].id).toBe(givenProcessSteps[1].batch.id);
      expect(actualResult.processStepsToBeSplit).toHaveLength(0);
    });

    it('splits last process step when amount exceeds requested', () => {
      // Arrange
      const givenHydrogenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction({
          batch: BatchEntityFixture.createHydrogenBatch({
            amount: 150,
            qualityDetails: QualityDetailsEntityFixture.createGreen(),
            hydrogenStorageUnit: HydrogenStorageUnitEntityFixture.create({
              id: givenHydrogenStorageUnitId,
            }),
            rfnboType: RFNBOType.RFNBO_READY,
          }),
        }),
      ];
      const givenHydrogenComposition = [HydrogenComponentEntityFixture.createGreen({ amount: 100 })];

      // Act
      const actualResult = BottlingAllocator.allocate(
        givenProcessSteps,
        givenHydrogenComposition,
        givenHydrogenStorageUnitId,
      );

      // Assert
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

    it('creates split process steps with correct properties', () => {
      // Arrange
      const givenHydrogenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction({
          batch: BatchEntityFixture.createHydrogenBatch({
            amount: 200,
            qualityDetails: QualityDetailsEntityFixture.createGreen(),
            hydrogenStorageUnit: HydrogenStorageUnitEntityFixture.create({
              id: givenHydrogenStorageUnitId,
            }),
            rfnboType: RFNBOType.RFNBO_READY,
          }),
        }),
      ];
      const givenHydrogenComposition = [HydrogenComponentEntityFixture.createGreen({ amount: 80 })];

      // Act
      const actualResult = BottlingAllocator.allocate(
        givenProcessSteps,
        givenHydrogenComposition,
        givenHydrogenStorageUnitId,
      );

      // Assert
      const consumedStep = actualResult.consumedSplitProcessSteps[0];
      expect(consumedStep.type).toBe(ProcessType.HYDROGEN_PRODUCTION);
      expect(consumedStep.batch.type).toBe(BatchType.HYDROGEN);
      expect(consumedStep.batch.predecessors[0].id).toBe(givenProcessSteps[0].batch.id);
      expect(consumedStep.batch.qualityDetails.color).toBe(HydrogenColor.GREEN);
      expect(consumedStep.startedAt).toEqual(givenProcessSteps[0].startedAt);
      expect(consumedStep.endedAt).toEqual(givenProcessSteps[0].endedAt);

      const remainingStep = actualResult.processStepsForRemainingAmount[0];
      expect(remainingStep.type).toBe(ProcessType.HYDROGEN_PRODUCTION);
      expect(remainingStep.batch.amount).toBe(120);
      expect(remainingStep.batch.active).toBe(true);
    });

    it('filters process steps by requested color', () => {
      // Arrange
      const givenHydrogenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction({
          id: 'ps-1',
          batch: BatchEntityFixture.createHydrogenBatch({
            id: 'batch-green',
            amount: 100,
            qualityDetails: QualityDetailsEntityFixture.createGreen(),
            rfnboType: RFNBOType.RFNBO_READY,
          }),
        }),
        ProcessStepEntityFixture.createHydrogenProduction({
          id: 'ps-2',
          batch: BatchEntityFixture.createHydrogenBatch({
            id: 'batch-yellow',
            amount: 100,
            qualityDetails: QualityDetailsEntityFixture.createYellow(),
            rfnboType: RFNBOType.NON_CERTIFIABLE,
          }),
        }),
      ];
      const givenHydrogenComposition = [HydrogenComponentEntityFixture.createGreen({ amount: 100 })];

      // Act
      const actualResult = BottlingAllocator.allocate(
        givenProcessSteps,
        givenHydrogenComposition,
        givenHydrogenStorageUnitId,
      );

      // Assert
      expect(actualResult.batchesForBottle).toHaveLength(1);
      expect(actualResult.batchesForBottle[0].id).toBe(givenProcessSteps[0].batch.id);
    });

    it('throws exception when not enough hydrogen available for requested color', () => {
      // Arrange
      const givenHydrogenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction({
          batch: BatchEntityFixture.createHydrogenBatch({
            amount: 50,
            qualityDetails: QualityDetailsEntityFixture.createGreen(),
            rfnboType: RFNBOType.RFNBO_READY,
          }),
        }),
      ];
      const givenHydrogenComposition = [HydrogenComponentEntityFixture.createGreen({ amount: 100 })];

      const expectedErrorMessage = `There is not enough hydrogen in storage unit ${givenHydrogenStorageUnitId} for the requested amount of 100 of quality ${RFNBOType.RFNBO_READY}.`;

      // Act & Assert
      expect(() =>
        BottlingAllocator.allocate(givenProcessSteps, givenHydrogenComposition, givenHydrogenStorageUnitId),
      ).toThrow(expectedErrorMessage);
    });

    it('returns empty results when hydrogen composition is empty', () => {
      // Arrange
      const givenHydrogenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction({
          batch: BatchEntityFixture.createHydrogenBatch({
            amount: 100,
            qualityDetails: QualityDetailsEntityFixture.createGreen(),
            rfnboType: RFNBOType.RFNBO_READY,
          }),
        }),
      ];
      const givenHydrogenComposition: HydrogenComponentEntity[] = [];

      // Act
      const actualResult = BottlingAllocator.allocate(
        givenProcessSteps,
        givenHydrogenComposition,
        givenHydrogenStorageUnitId,
      );

      // Assert
      expect(actualResult.batchesForBottle).toHaveLength(0);
      expect(actualResult.processStepsToBeSplit).toHaveLength(0);
      expect(actualResult.consumedSplitProcessSteps).toHaveLength(0);
      expect(actualResult.processStepsForRemainingAmount).toHaveLength(0);
    });
  });
});
