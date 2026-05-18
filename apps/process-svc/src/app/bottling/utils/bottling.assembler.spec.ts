/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchEntity } from '@h2-trust/contracts/entities';
import { BatchEntityFixture, QualityDetailsEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { CreateHydrogenBottlingPayload } from '@h2-trust/contracts/payloads';
import { ProcessType, RfnboType } from '@h2-trust/domain';
import { assembleBottling } from './bottling.assembler';

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
        RfnboType.RFNBO_READY,
      );
      const givenBatchesForBottle = [
        BatchEntityFixture.createHydrogenBatch({ qualityDetails: QualityDetailsEntityFixture.create() }),
      ];

      // Act
      const actualResult = assembleBottling(givenPayload, givenBatchesForBottle);

      // Assert
      expect(actualResult.startedAt).toEqual(givenPayload.filledAt);
      expect(actualResult.endedAt).toEqual(givenPayload.filledAt);
      expect(actualResult.type).toBe(ProcessType.HYDROGEN_BOTTLING);
      expect(actualResult.batch.amount).toBe(givenPayload.amount);
      expect(actualResult.batch.type).toBe(givenBatchesForBottle[0].type);
      expect(actualResult.batch.predecessors).toHaveLength(givenBatchesForBottle.length);
      expect(actualResult.batch.predecessors[0].id).toBe(givenBatchesForBottle[0].id);
      expect(actualResult.batch.owner.id).toBe(givenPayload.ownerId);
      expect(actualResult.recordedBy.id).toBe(givenPayload.recordedById);
      expect(actualResult.executedBy.id).toBe(givenPayload.hydrogenStorageUnitId);
    });

    it(`determines all predecessors`, () => {
      // Arrange
      const givenPayload = new CreateHydrogenBottlingPayload(
        200,
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        'recorder-1',
        'storage-unit-1',
        RfnboType.RFNBO_READY,
      );
      const givenBatchesForBottle = [
        BatchEntityFixture.createHydrogenBatch({
          id: 'batch-1',
          qualityDetails: QualityDetailsEntityFixture.create(),
        }),
        BatchEntityFixture.createHydrogenBatch({
          id: 'batch-2',
          qualityDetails: QualityDetailsEntityFixture.create(),
        }),
      ];

      // Act
      const actualResult = assembleBottling(givenPayload, givenBatchesForBottle);

      // Assert
      expect(actualResult.batch.predecessors).toHaveLength(2);
      expect(actualResult.batch.predecessors[0].id).toBe('batch-1');
      expect(actualResult.batch.predecessors[1].id).toBe('batch-2');
    });

    it('throws exception when no predecessor batches provided', () => {
      // Arrange
      const givenPayload = new CreateHydrogenBottlingPayload(
        100,
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        'recorder-1',
        'storage-unit-1',
        RfnboType.RFNBO_READY,
      );
      const givenBatchesForBottle: BatchEntity[] = [];

      const expectedErrorMessage = 'No predecessor types found: batch list has no quality details';

      // Act & Assert
      expect(() => assembleBottling(givenPayload, givenBatchesForBottle)).toThrow(expectedErrorMessage);
    });
  });
});
