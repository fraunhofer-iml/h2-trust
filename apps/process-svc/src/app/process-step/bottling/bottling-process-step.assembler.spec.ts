/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchEntity, CreateHydrogenBottlingPayload } from '@h2-trust/amqp';
import { HydrogenColor, ProcessType } from '@h2-trust/domain';
import { BatchEntityFixture, QualityDetailsEntityFixture } from '@h2-trust/fixtures/entities';
import { BottlingProcessStepAssembler } from './bottling-process-step.assembler';

describe('BottlingProcessStepAssembler', () => {
  describe('assemble', () => {
    it('assembles process step entity from payload and predecessor batches', () => {
      // Arrange
      const givenPayload = new CreateHydrogenBottlingPayload(
        100,
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        'recorder-1',
        'storage-unit-1',
        HydrogenColor.GREEN,
      );
      const givenBatchesForBottle = [
        BatchEntityFixture.createHydrogenBatch({ qualityDetails: QualityDetailsEntityFixture.createGreen() }),
      ];

      // Act
      const actualResult = BottlingProcessStepAssembler.assemble(givenPayload, givenBatchesForBottle);

      // Assert
      expect(actualResult.startedAt).toEqual(givenPayload.filledAt);
      expect(actualResult.endedAt).toEqual(givenPayload.filledAt);
      expect(actualResult.type).toBe(ProcessType.HYDROGEN_BOTTLING);
      expect(actualResult.batch.amount).toBe(givenPayload.amount);
      expect(actualResult.batch.qualityDetails.color).toBe(givenBatchesForBottle[0].qualityDetails.color);
      expect(actualResult.batch.type).toBe(givenBatchesForBottle[0].type);
      expect(actualResult.batch.predecessors).toHaveLength(givenBatchesForBottle.length);
      expect(actualResult.batch.predecessors[0].id).toBe(givenBatchesForBottle[0].id);
      expect(actualResult.batch.owner.id).toBe(givenPayload.ownerId);
      expect(actualResult.recordedBy.id).toBe(givenPayload.recordedById);
      expect(actualResult.executedBy.id).toBe(givenPayload.hydrogenStorageUnitId);
    });

    it(`determines ${HydrogenColor.GREEN} color when all predecessors are ${HydrogenColor.GREEN}`, () => {
      // Arrange
      const givenPayload = new CreateHydrogenBottlingPayload(
        200,
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        'recorder-1',
        'storage-unit-1',
        HydrogenColor.GREEN,
      );
      const givenBatchesForBottle = [
        BatchEntityFixture.createHydrogenBatch({
          id: 'batch-1',
          qualityDetails: QualityDetailsEntityFixture.createGreen(),
        }),
        BatchEntityFixture.createHydrogenBatch({
          id: 'batch-2',
          qualityDetails: QualityDetailsEntityFixture.createGreen(),
        }),
      ];

      // Act
      const actualResult = BottlingProcessStepAssembler.assemble(givenPayload, givenBatchesForBottle);

      // Assert
      expect(actualResult.batch.predecessors).toHaveLength(2);
      expect(actualResult.batch.predecessors[0].id).toBe('batch-1');
      expect(actualResult.batch.predecessors[1].id).toBe('batch-2');
      expect(actualResult.batch.qualityDetails.color).toBe(HydrogenColor.GREEN);
    });

    it(`determines ${HydrogenColor.YELLOW} color when all predecessors are ${HydrogenColor.YELLOW}`, () => {
      // Arrange
      const givenPayload = new CreateHydrogenBottlingPayload(
        100,
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        'recorder-1',
        'storage-unit-1',
        HydrogenColor.YELLOW,
      );
      const givenBatchesForBottle = [
        BatchEntityFixture.createHydrogenBatch({
          id: 'batch-1',
          qualityDetails: QualityDetailsEntityFixture.createYellow(),
        }),
        BatchEntityFixture.createHydrogenBatch({
          id: 'batch-2',
          qualityDetails: QualityDetailsEntityFixture.createYellow(),
        }),
      ];

      // Act
      const actualResult = BottlingProcessStepAssembler.assemble(givenPayload, givenBatchesForBottle);

      // Assert
      expect(actualResult.batch.qualityDetails.color).toBe(HydrogenColor.YELLOW);
    });
    it('determines MIX color when predecessors have different colors', () => {
      // Arrange
      const givenPayload = new CreateHydrogenBottlingPayload(
        100,
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        'recorder-1',
        'storage-unit-1',
        HydrogenColor.GREEN,
      );
      const givenBatchesForBottle = [
        BatchEntityFixture.createHydrogenBatch({
          id: 'batch-1',
          qualityDetails: QualityDetailsEntityFixture.createGreen(),
        }),
        BatchEntityFixture.createHydrogenBatch({
          id: 'batch-2',
          qualityDetails: QualityDetailsEntityFixture.createYellow(),
        }),
      ];

      // Act
      const actualResult = BottlingProcessStepAssembler.assemble(givenPayload, givenBatchesForBottle);

      // Assert
      expect(actualResult.batch.qualityDetails.color).toBe(HydrogenColor.MIX);
    });

    it('throws exception when no predecessor batches provided', () => {
      // Arrange
      const givenPayload = new CreateHydrogenBottlingPayload(
        100,
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        'recorder-1',
        'storage-unit-1',
        HydrogenColor.GREEN,
      );
      const givenBatchesForBottle: BatchEntity[] = [];

      const expectedErrorMessage = 'No predecessor colors specified';

      // Act & Assert
      expect(() => BottlingProcessStepAssembler.assemble(givenPayload, givenBatchesForBottle)).toThrow(
        expectedErrorMessage,
      );
    });
  });
});
