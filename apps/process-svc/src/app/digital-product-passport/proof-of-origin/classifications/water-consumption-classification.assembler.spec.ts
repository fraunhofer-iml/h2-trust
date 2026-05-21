/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity, ProofOfOriginWaterBatchEntity } from '@h2-trust/contracts/entities';
import { ProcessStepEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { BatchType, ProofOfOrigin } from '@h2-trust/domain';
import { assembleWaterSupplyClassification } from './water-consumption-classification.assembler';

describe('WaterConsumptionProofOfOriginAssembler', () => {
  describe('assembleWaterSupplyClassification', () => {
    it('should return a classification with water batches and emissions when water supplies are provided', () => {
    // arrange
      const givenWaterConsumption = ProcessStepEntityFixture.createWaterConsumption();
      const givenWaterSupplies = [givenWaterConsumption];
      const givenHydrogenAmount = 100;

      // act
      const actualResult = assembleWaterSupplyClassification(givenWaterSupplies, givenHydrogenAmount);

      // assert
      expect(actualResult.name).toBe(ProofOfOrigin.WATER_SUPPLY_CLASSIFICATION);
      expect(actualResult.classificationType).toBe(BatchType.WATER);
      expect(actualResult.batches).toHaveLength(1);
      expect(actualResult.subClassifications).toEqual([]);

      const givenBatch = actualResult.batches[0] as ProofOfOriginWaterBatchEntity;
      expect(givenBatch.id).toBe(givenWaterConsumption.batch.id);
      expect(givenBatch.emission).toBeDefined();
      expect(givenBatch.emission.totalEmissionsPerKgHydrogen).toBeGreaterThan(0);
      expect(givenBatch.createdAt).toBe(givenWaterConsumption.startedAt);
      expect(givenBatch.amount).toBe(givenWaterConsumption.batch.amount);
      expect(givenBatch.deionizedWaterAmount).toBe(givenWaterConsumption.batch.amount);
    });

    it('should return a classification with multiple water batches when multiple water supplies are provided', () => {
    // arrange
      const givenWaterConsumption1 = ProcessStepEntityFixture.createWaterConsumption();
      givenWaterConsumption1.id = 'water-consumption-1';
      givenWaterConsumption1.batch.id = 'water-batch-1';

      const givenWaterConsumption2 = ProcessStepEntityFixture.createWaterConsumption();
      givenWaterConsumption2.id = 'water-consumption-2';
      givenWaterConsumption2.batch.id = 'water-batch-2';

      const givenWaterSupplies = [givenWaterConsumption1, givenWaterConsumption2];
      const givenHydrogenAmount = 100;

      // act
      const actualResult = assembleWaterSupplyClassification(givenWaterSupplies, givenHydrogenAmount);

      // assert
      expect(actualResult.name).toBe(ProofOfOrigin.WATER_SUPPLY_CLASSIFICATION);
      expect(actualResult.batches).toHaveLength(2);

      const givenBatch1 = actualResult.batches[0] as ProofOfOriginWaterBatchEntity;
      expect(givenBatch1.id).toBe(givenWaterConsumption1.batch.id);

      const givenBatch2 = actualResult.batches[1] as ProofOfOriginWaterBatchEntity;
      expect(givenBatch2.id).toBe(givenWaterConsumption2.batch.id);
    });

    it('should throw error when no water supplies provided', () => {
    // arrange
      const givenWaterSupplies: ProcessStepEntity[] = [];
      const givenHydrogenAmount = 100;
      const expectedErrorMessage = 'No process steps of type water supply found.';

      // act & assert
      const actualOperation = () => assembleWaterSupplyClassification(givenWaterSupplies, givenHydrogenAmount);

      expect(actualOperation).toThrow(expectedErrorMessage);
    });

    it('should throw error when water supplies is undefined', () => {
    // arrange
      const givenWaterSupplies: ProcessStepEntity[] = undefined;
      const givenHydrogenAmount = 100;
      const expectedErrorMessage = 'No process steps of type water supply found.';

      // act & assert
      const actualOperation = () => assembleWaterSupplyClassification(givenWaterSupplies, givenHydrogenAmount);

      expect(actualOperation).toThrow(expectedErrorMessage);
    });
  });
});
