/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfOriginHydrogenBatchEntity, ProofOfOriginSectionEntity } from '@h2-trust/amqp';
import { ProofOfOrigin } from '@h2-trust/domain';
import { HydrogenComponentEntityFixture, ProcessStepEntityFixture } from '@h2-trust/fixtures/entities';
import { HydrogenBottlingProofOfOriginService } from '../hydrogen-bottling-proof-of-origin.service';

describe('HydrogenBottlingSectionAssembler', () => {
  describe('assembleHydrogenBottlingSection', () => {
    it('returns section with hydrogen batch, composition and emissions', async () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenHydrogenCompositions = [
        HydrogenComponentEntityFixture.createGreen({ amount: 60 }),
        HydrogenComponentEntityFixture.createYellow({ amount: 40 }),
      ];

      // Act
      const actualResult: ProofOfOriginSectionEntity =
        HydrogenBottlingProofOfOriginService.assembleHydrogenBottlingSection(
          givenHydrogenBottling,
          givenHydrogenCompositions,
        );

      // Assert
      expect(actualResult.name).toBe(ProofOfOrigin.HYDROGEN_BOTTLING_SECTION);
      expect(actualResult.batches).toHaveLength(1);
      expect(actualResult.classifications).toEqual([]);

      const batch = actualResult.batches[0] as ProofOfOriginHydrogenBatchEntity;
      expect(batch.id).toBe(givenHydrogenBottling.batch.id);
      expect(batch.emission).toBeDefined();
      expect(batch.emission.totalEmissionsPerKgHydrogen).toBe(0);
      expect(batch.emission.basisOfCalculation).toEqual(['E = [TBD]']);
      expect(batch.createdAt).toBe(givenHydrogenBottling.startedAt);
      expect(batch.amount).toBe(givenHydrogenBottling.batch.amount);
      expect(batch.batchType).toBe(givenHydrogenBottling.batch.type);
      expect(batch.hydrogenComposition).toEqual(givenHydrogenCompositions);
      expect(batch.unitId).toBe(givenHydrogenBottling.executedBy.id);
      expect(batch.color).toBe(givenHydrogenBottling.batch.qualityDetails.color);
      expect(batch.processStep).toBe(givenHydrogenBottling.type);
      expect(batch.accountingPeriodEnd).toBe(givenHydrogenBottling.endedAt);
    });
  });
});
