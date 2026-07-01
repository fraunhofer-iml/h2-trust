/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchEntity, UnitEntity } from '@h2-trust/contracts/entities';
import {
  BatchDetailsEntityFixture,
  BatchEntityFixture,
  HydrogenBottlingUnitEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { CreateBatchDetailsPayload, CreateProcessStepPayload } from '@h2-trust/contracts/payloads';
import { PowerType, ProcessType, RfnboType } from '@h2-trust/domain';
import { buildProcessStepEntity } from './bottling.assembler';

describe('BottlingAssembler', () => {
  describe('assembleBottling', () => {
    it('should assemble process step entity from payload and predecessor batches when called', () => {
      // arrange
      const batchDetails: CreateBatchDetailsPayload = new CreateBatchDetailsPayload(
        RfnboType.RFNBO_READY,
        PowerType.NOT_SPECIFIED,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
      );

      const givenPayload = new CreateProcessStepPayload(
        batchDetails,
        ProcessType.HYDROGEN_BOTTLING,
        100,
        'company-1',
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        new Date('2024-01-15T10:00:00Z'),
        'storage-unit-1',
        'hydrogen-production-unit-1',
      );

      const executingUnit: UnitEntity = HydrogenBottlingUnitEntityFixture.create();

      const givenBatchesForBottle = [
        BatchEntityFixture.createHydrogenBatch({ details: BatchDetailsEntityFixture.create() }),
      ];

      // act
      const actualResult = buildProcessStepEntity(givenPayload, givenBatchesForBottle, executingUnit);

      // assert
      expect(actualResult.startedAt).toEqual(givenPayload.startedAt);
      expect(actualResult.endedAt).toEqual(givenPayload.endedAt);
      expect(actualResult.type).toBe(ProcessType.HYDROGEN_BOTTLING);
      expect(actualResult.batch.amount).toBe(givenPayload.amount);
      expect(actualResult.batch.type).toBe(givenBatchesForBottle[0].type);
      expect(actualResult.batch.predecessors).toHaveLength(givenBatchesForBottle.length);
      expect(actualResult.batch.predecessors[0].id).toBe(givenBatchesForBottle[0].id);
      expect(actualResult.batch.owner.id).toBe(givenPayload.ownerId);
      expect(actualResult.recordedBy.id).toBe(givenPayload.recordedById);
    });

    it(`should determine all predecessors when called`, () => {
      // arrange
      const batchDetails: CreateBatchDetailsPayload = new CreateBatchDetailsPayload(
        RfnboType.RFNBO_READY,
        PowerType.NOT_SPECIFIED,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
      );

      const givenPayload = new CreateProcessStepPayload(
        batchDetails,
        ProcessType.HYDROGEN_BOTTLING,
        100,
        'company-1',
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        new Date('2024-01-15T10:00:00Z'),
        'storage-unit-1',
        'hydrogen-production-unit-1',
      );
      const givenBatchesForBottle = [
        BatchEntityFixture.createHydrogenBatch({
          id: 'batch-1',
          details: BatchDetailsEntityFixture.create(),
        }),
        BatchEntityFixture.createHydrogenBatch({
          id: 'batch-2',
          details: BatchDetailsEntityFixture.create(),
        }),
      ];
      const executingUnit: UnitEntity = HydrogenBottlingUnitEntityFixture.create();

      // act
      const actualResult = buildProcessStepEntity(givenPayload, givenBatchesForBottle, executingUnit);

      // assert
      expect(actualResult.batch.predecessors).toHaveLength(2);
      expect(actualResult.batch.predecessors[0].id).toBe('batch-1');
      expect(actualResult.batch.predecessors[1].id).toBe('batch-2');
    });

    it('should throw exception when no predecessor batches provided', () => {
      // arrange
      const batchDetails: CreateBatchDetailsPayload = new CreateBatchDetailsPayload(
        RfnboType.RFNBO_READY,
        PowerType.NOT_SPECIFIED,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
      );

      const givenPayload = new CreateProcessStepPayload(
        batchDetails,
        ProcessType.HYDROGEN_BOTTLING,
        100,
        'company-1',
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        new Date('2024-01-15T10:00:00Z'),
        'storage-unit-1',
        'hydrogen-production-unit-1',
      );
      const executingUnit: UnitEntity = HydrogenBottlingUnitEntityFixture.create();

      const givenBatchesForBottle: BatchEntity[] = [];

      const expectedErrorMessage = 'No predecessor types found: batch list has no quality details';

      // act & assert
      const actualOperation = () => buildProcessStepEntity(givenPayload, givenBatchesForBottle, executingUnit);

      expect(actualOperation).toThrow(expectedErrorMessage);
    });
  });
});
