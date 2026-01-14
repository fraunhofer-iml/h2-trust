/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  ProcessStepEntityFixture,
  BatchEntityFixture,
  QualityDetailsEntityFixture,
} from '@h2-trust/fixtures/entities';
import { ProofOfOriginHydrogenBatchEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { BatchType, HydrogenColor, MeasurementUnit, ProofOfOrigin } from '@h2-trust/domain';

import { HydrogenStorageSectionService } from './hydrogen-storage-section.service';

describe('HydrogenStorageSectionService', () => {
  let service: HydrogenStorageSectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HydrogenStorageSectionService],
    }).compile();

    service = module.get<HydrogenStorageSectionService>(HydrogenStorageSectionService);
  });

  describe('buildSection', () => {
    it('returns section with classifications grouped by hydrogen color', async () => {
      // Arrange
      const givenGreenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'green-production-1',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'green-batch-1',
          amount: 10,
          qualityDetails: QualityDetailsEntityFixture.createGreen(),
        }),
      });
      const givenYellowHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'yellow-production-1',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'yellow-batch-1',
          amount: 20,
          qualityDetails: QualityDetailsEntityFixture.createYellow(),
        }),
      });
      const givenHydrogenProductions = [givenGreenHydrogenProduction, givenYellowHydrogenProduction];

      // Act
      const actualResult = await service.buildSection(givenHydrogenProductions);

      // Assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_STORAGE_SECTION);
      expect(actualResult.batches).toEqual([]);
      expect(actualResult.classifications).toHaveLength(2);

      const greenClassification = actualResult.classifications.find((c) => c.name === HydrogenColor.GREEN);
      expect(greenClassification).toBeDefined();
      expect(greenClassification.unit).toBe(MeasurementUnit.HYDROGEN);
      expect(greenClassification.classificationType).toBe(BatchType.HYDROGEN);
      expect(greenClassification.batches).toHaveLength(1);

      const greenBatch = greenClassification.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(greenBatch.id).toBe(givenGreenHydrogenProduction.batch.id);
      expect(greenBatch.amount).toBe(givenGreenHydrogenProduction.batch.amount);
      expect(greenBatch.emission).toBeDefined();
      expect(greenBatch.color).toBe(HydrogenColor.GREEN);

      const yellowClassification = actualResult.classifications.find((c) => c.name === HydrogenColor.YELLOW);
      expect(yellowClassification).toBeDefined();
      expect(yellowClassification.batches).toHaveLength(1);

      const yellowBatch = yellowClassification.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(yellowBatch.id).toBe(givenYellowHydrogenProduction.batch.id);
      expect(yellowBatch.amount).toBe(givenYellowHydrogenProduction.batch.amount);
      expect(yellowBatch.color).toBe(HydrogenColor.YELLOW);
    });

    it('returns empty section when no hydrogen productions provided', async () => {
      // Arrange
      const givenHydrogenProductions: ProcessStepEntity[] = [];

      // Act
      const actualResult = await service.buildSection(givenHydrogenProductions);

      // Assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_STORAGE_SECTION);
      expect(actualResult.batches).toEqual([]);
      expect(actualResult.classifications).toEqual([]);
    });

    it('returns empty section when hydrogen productions is undefined', async () => {
      // Act
      const actualResult = await service.buildSection(undefined);

      // Assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_STORAGE_SECTION);
      expect(actualResult.batches).toEqual([]);
      expect(actualResult.classifications).toEqual([]);
    });
  });
});
