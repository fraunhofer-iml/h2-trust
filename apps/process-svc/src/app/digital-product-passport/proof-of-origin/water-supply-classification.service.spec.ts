/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ProcessStepEntity, ProofOfOriginWaterBatchEntity } from '@h2-trust/amqp';
import { BatchType, MeasurementUnit, ProofOfOrigin } from '@h2-trust/domain';
import { ProcessStepEntityFixture } from '@h2-trust/fixtures/entities';
import { WaterSupplyClassificationService } from './water-supply-classification.service';

describe('WaterSupplyClassificationService', () => {
  let service: WaterSupplyClassificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaterSupplyClassificationService],
    }).compile();

    service = module.get<WaterSupplyClassificationService>(WaterSupplyClassificationService);
  });

  describe('buildWaterSupplyClassification', () => {
    it('returns classification with water batches and emissions', () => {
      // Arrange
      const givenWaterConsumption = ProcessStepEntityFixture.createWaterConsumption();
      const givenWaterSupplies = [givenWaterConsumption];
      const givenHydrogenAmount = 100;

      // Act
      const actualResult = service.buildWaterSupplyClassification(givenWaterSupplies, givenHydrogenAmount);

      // Assert
      expect(actualResult.name).toBe(ProofOfOrigin.WATER_SUPPLY_CLASSIFICATION);
      expect(actualResult.unit).toBe(MeasurementUnit.WATER);
      expect(actualResult.classificationType).toBe(BatchType.WATER);
      expect(actualResult.batches).toHaveLength(1);
      expect(actualResult.subClassifications).toEqual([]);

      const batch = actualResult.batches[0] as ProofOfOriginWaterBatchEntity;
      expect(batch.id).toBe(givenWaterConsumption.batch.id);
      expect(batch.emission).toBeDefined();
      expect(batch.emission.totalEmissionsPerKgHydrogen).toBeGreaterThan(0);
      expect(batch.createdAt).toBe(givenWaterConsumption.startedAt);
      expect(batch.amount).toBe(givenWaterConsumption.batch.amount);
      expect(batch.unit).toBe(MeasurementUnit.WATER);
      expect(batch.deionizedWaterAmount).toBe(givenWaterConsumption.batch.amount);
    });

    it('returns classification with multiple water batches', () => {
      // Arrange
      const givenWaterConsumption1 = ProcessStepEntityFixture.createWaterConsumption();
      givenWaterConsumption1.id = 'water-consumption-1';
      givenWaterConsumption1.batch.id = 'water-batch-1';

      const givenWaterConsumption2 = ProcessStepEntityFixture.createWaterConsumption();
      givenWaterConsumption2.id = 'water-consumption-2';
      givenWaterConsumption2.batch.id = 'water-batch-2';

      const givenWaterSupplies = [givenWaterConsumption1, givenWaterConsumption2];
      const givenHydrogenAmount = 100;

      // Act
      const actualResult = service.buildWaterSupplyClassification(givenWaterSupplies, givenHydrogenAmount);

      // Assert
      expect(actualResult.name).toBe(ProofOfOrigin.WATER_SUPPLY_CLASSIFICATION);
      expect(actualResult.batches).toHaveLength(2);

      const batch1 = actualResult.batches[0] as ProofOfOriginWaterBatchEntity;
      expect(batch1.id).toBe(givenWaterConsumption1.batch.id);

      const batch2 = actualResult.batches[1] as ProofOfOriginWaterBatchEntity;
      expect(batch2.id).toBe(givenWaterConsumption2.batch.id);
    });

    it('throws error when no water supplies provided', () => {
      // Arrange
      const givenWaterSupplies: ProcessStepEntity[] = [];
      const givenHydrogenAmount = 100;

      const errorMessage = 'No process steps of type water supply found.';

      // Act & Assert
      expect(() => service.buildWaterSupplyClassification(givenWaterSupplies, givenHydrogenAmount)).toThrow(
        errorMessage,
      );
    });

    it('throws error when water supplies is undefined', () => {
      // Arrange
      const givenWaterSupplies: ProcessStepEntity[] = undefined;
      const givenHydrogenAmount = 100;

      const errorMessage = 'No process steps of type water supply found.';

      // Act & Assert
      expect(() => service.buildWaterSupplyClassification(givenWaterSupplies, givenHydrogenAmount)).toThrow(
        errorMessage,
      );
    });
  });
});
