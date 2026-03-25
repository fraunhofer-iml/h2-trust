/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity, ProofOfOriginHydrogenBatchEntity } from '@h2-trust/amqp';
import { BatchType, ProofOfOrigin, RfnboType } from '@h2-trust/domain';
import { BatchEntityFixture, ProcessStepEntityFixture, QualityDetailsEntityFixture } from '@h2-trust/fixtures/entities';
import { HydrogenStorageSectionAssembler } from './hydrogen-storage-section.assembler';

describe('HydrogenStorageSectionAssembler', () => {
  describe('assembleSection', () => {
    it('returns section with classifications grouped by hydrogen rfnbo type', async () => {
      // Arrange
      const givenRfnboReadyHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'rfnbo-production-1',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'rfnbo-batch-1',
          amount: 10,
          qualityDetails: QualityDetailsEntityFixture.createGreen(),
        }),
      });
      const givenNonCertifiableHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'non-certifiable-production-1',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'non-certifiable-batch-1',
          amount: 20,
          qualityDetails: QualityDetailsEntityFixture.createYellow(),
        }),
      });
      const givenHydrogenProductions = [givenRfnboReadyHydrogenProduction, givenNonCertifiableHydrogenProduction];

      // Act
      const actualResult = HydrogenStorageSectionAssembler.assembleSection(givenHydrogenProductions);

      // Assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_STORAGE_SECTION);
      expect(actualResult.batches).toEqual([]);
      expect(actualResult.classifications).toHaveLength(2);

      const rfnboReadyClassification = actualResult.classifications.find((c) => c.name === RfnboType.RFNBO_READY);
      expect(rfnboReadyClassification).toBeDefined();
      expect(rfnboReadyClassification.classificationType).toBe(BatchType.HYDROGEN);
      expect(rfnboReadyClassification.batches).toHaveLength(1);

      const rfnboReadyBatch = rfnboReadyClassification.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(rfnboReadyBatch.id).toBe(givenRfnboReadyHydrogenProduction.batch.id);
      expect(rfnboReadyBatch.amount).toBe(givenRfnboReadyHydrogenProduction.batch.amount);
      expect(rfnboReadyBatch.emission).toBeDefined();
      expect(rfnboReadyBatch.rfnboType).toBe(RfnboType.RFNBO_READY);

      const nonCertifiableClassification = actualResult.classifications.find(
        (c) => c.name === RfnboType.NON_CERTIFIABLE,
      );
      expect(nonCertifiableClassification).toBeDefined();
      expect(nonCertifiableClassification.batches).toHaveLength(1);

      const nonCertifiableBatch = nonCertifiableClassification.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(nonCertifiableBatch.id).toBe(givenNonCertifiableHydrogenProduction.batch.id);
      expect(nonCertifiableBatch.amount).toBe(givenNonCertifiableHydrogenProduction.batch.amount);
      expect(nonCertifiableBatch.rfnboType).toBe(RfnboType.NON_CERTIFIABLE);
    });

    it('returns empty section when no hydrogen productions provided', async () => {
      // Arrange
      const givenHydrogenProductions: ProcessStepEntity[] = [];

      // Act
      const actualResult = HydrogenStorageSectionAssembler.assembleSection(givenHydrogenProductions);

      // Assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_STORAGE_SECTION);
      expect(actualResult.batches).toEqual([]);
      expect(actualResult.classifications).toEqual([]);
    });

    it('returns empty section when hydrogen productions is undefined', async () => {
      // Act
      const actualResult = HydrogenStorageSectionAssembler.assembleSection(undefined);

      // Assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_STORAGE_SECTION);
      expect(actualResult.batches).toEqual([]);
      expect(actualResult.classifications).toEqual([]);
    });
  });
});
